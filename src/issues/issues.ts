import chalk from 'chalk';
import nodeFetch from 'node-fetch';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import splitLines from 'split-lines';
import { table } from 'table';

import { FetchedIssue, IssuesProvider, IssueStatus, ParsedIssue } from './issues.interface';

export const getIssuesFromLines = (lines: string[], regex: RegExp): ParsedIssue[] =>
  lines.reduce<ParsedIssue[]>((issues, line) => {
    const issuesFromLine = getIssuesFromLine(line, regex);
    return issuesFromLine.length ? [...issues, ...issuesFromLine] : issues;
  }, []);

export const getIssuesFromLine = (line: string, regex: RegExp): ParsedIssue[] => {
  let match: RegExpExecArray | null;
  const issues: ParsedIssue[] = [];

  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regex.exec(line))) {
    const [_, owner, repo, id] = match;
    issues.push({
      owner,
      repo,
      id,
    });
  }

  return issues;
};

export const fetchIssueStatus = (issue: ParsedIssue): Observable<FetchedIssue> => {
  return from(
    nodeFetch(`https://api.github.com/repos/${issue.owner}/${issue.repo}/issues/${issue.id}`),
  ).pipe(
    switchMap(data => from(data.json()).pipe(map(body => ({ status: data.status, body })))),
    map(data => {
      const { status } = data;

      if (status === 200) {
        const { state } = data.body;

        if (state === 'open') {
          return { ...issue, status: IssueStatus.OPEN };
        } else if (state === 'closed') {
          return { ...issue, status: IssueStatus.CLOSED };
        } else {
          return { ...issue, status: IssueStatus.UNKNOWN };
        }
      } else if (status === 404) {
        return { ...issue, status: IssueStatus.NOT_FOUND };
      }

      return { ...issue, status: IssueStatus.ERROR };
    }),
    catchError(e => {
      console.log(e);

      return of({
        ...issue,
        status: IssueStatus.ERROR,
      });
    }),
  );
};

export const getAllIssuesFromMultipleStrings = (
  strings: string[],
  issuesProviders: IssuesProvider[],
): Observable<FetchedIssue[]>[] => {
  return strings.map(fileContent => {
    let issues: Observable<FetchedIssue>[] = [];

    for (let issuesProvider of issuesProviders) {
      issues.push(...getIssuesFromString(fileContent, issuesProvider));
    }

    return forkJoin(...issues);
  });
};

export const getIssuesFromString = (
  str: string,
  issuesProvider: IssuesProvider,
): Observable<FetchedIssue>[] => {
  const regexIssue: RegExp = new RegExp(issuesProvider.regexStr, 'g');
  const splitedLines: string[] = splitLines(str);
  const issues: ParsedIssue[] = getIssuesFromLines(splitedLines, regexIssue);

  return issues.map(issue => fetchIssueStatus(issue));
};

const mapStatusColors = {
  [IssueStatus.OPEN]: chalk.bgGreen.white,
  [IssueStatus.CLOSED]: chalk.bgMagenta.white,
  [IssueStatus.NOT_FOUND]: chalk.bgYellow.white,
  [IssueStatus.ERROR]: chalk.bgRed.white,
  [IssueStatus.UNKNOWN]: chalk.bgBlack.white,
};

const setColorByStatus = (status: IssueStatus) => mapStatusColors[status](status);

const getIssuesAsTable = (issues: FetchedIssue[]): string => {
  const formatAndApplyColorOnStatus = issues.reduce<any>(
    (acc, issue) => [...acc, Object.values({ ...issue, status: setColorByStatus(issue.status) })],
    [],
  );

  const header: string[] = ['Owner', 'Repo', 'ID', 'Status'].map(title =>
    chalk.blueBright.bold(title),
  );

  return table([header, ...formatAndApplyColorOnStatus]);
};

export const displayIssuesAsTable = (issues: FetchedIssue[]) =>
  console.log(getIssuesAsTable(issues));
