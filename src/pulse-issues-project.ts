import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { from } from 'rxjs/observable/from';
import { bufferCount, concatMap, flatMap, reduce } from 'rxjs/operators';

import { getFilesListFromGlob, readFile } from './helpers/files.helper';
import { getAllIssuesFromMultipleStrings } from './issues/issues';
import { FetchedIssue, IssuesProvider, ParsedIssue } from './issues/issues.interface';

export class PulseIssueProject {
  public getIssuesForProviders(isuesProviders: IssuesProvider[]): Observable<FetchedIssue[]> {
    const filesList$ = getFilesListFromGlob('!(node_modules)/**/*.ts');

    const files$$: Observable<Observable<string>> = filesList$.pipe(
      flatMap(files => from(files.map(file => readFile(file))))
    );

    const readFilesByPool$ = files$$.pipe(
      // TODO: check why bufferCount cannot be more than 1
      bufferCount(1),
      concatMap(filesObs => forkJoin(...filesObs))
    );

    const getIssuesFromStrings$ = readFilesByPool$.pipe(
      flatMap(filesContent =>
        forkJoin(...getAllIssuesFromMultipleStrings(filesContent, isuesProviders))
      ),
      reduce(
        (acc: FetchedIssue[], curr: FetchedIssue[][]) => {
          curr.map(y => y.map(z => acc.push(z)));
          return acc;
        },
        [] as FetchedIssue[]
      )
    );

    return getIssuesFromStrings$;
  }
}
