import { tap } from 'rxjs/operators';

import { displayIssues } from './issues/issues';
import { IssueStatus } from './issues/issues.interface';
import { PROVIDERS } from './providers';
import { PulseIssueProject } from './pulse-issues-project';

const pulseIssueProject = new PulseIssueProject();

pulseIssueProject
  .getIssuesForProviders([PROVIDERS.GITHUB, PROVIDERS.GITLAB])
  .pipe(tap(issues => displayIssues(issues)))
  .subscribe();
