import { Observable } from 'rxjs/Observable';
import { FetchedIssue, IssuesProvider } from './issues/issues.interface';
export declare class PulseIssueProject {
    getIssuesForProviders(isuesProviders: IssuesProvider[]): Observable<FetchedIssue[]>;
}
