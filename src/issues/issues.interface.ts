export interface IssuesProvider {
  name: string;
  baseUrl: string;
  regexStr: string;
}

export enum IssueStatus {
  OPEN = 'opened',
  CLOSED = 'closed',
  NOT_FOUND = 'not-found',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export interface ParsedIssue {
  owner: string;
  repo: string;
  id: string;
}

export interface FetchedIssue extends ParsedIssue {
  status: IssueStatus;
}
