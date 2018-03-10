/// <reference path="../index.d.ts" />

import globTmp from 'glob';
import readTmp from 'read-file';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { catchError, map } from 'rxjs/operators';
import { promisify } from 'util';

const glob = promisify(globTmp);
const read = promisify(readTmp);

export const getFilesListFromGlob = (globStr: string): Observable<string[]> =>
  from(glob('!(node_modules)/**/*.ts', {})).pipe(
    map(files => files.filter(file => !file.includes('node_modules'))),
    catchError(err => {
      console.log('An error occured while listing all the files');
      console.log(err);
      return of([]);
    })
  );

export function readFile(filePath: string): Observable<string> {
  return from<string>(read(filePath, 'utf8')).pipe(
    catchError((e: any) => {
      console.log(`An error occured while trying to read "${filePath}"`);
      return of('');
    })
  );
}
