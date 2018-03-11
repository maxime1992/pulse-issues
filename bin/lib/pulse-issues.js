"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ora_1 = require("ora");
var operators_1 = require("rxjs/operators");
var issues_1 = require("./issues/issues");
var providers_1 = require("./providers");
var pulse_issues_project_1 = require("./pulse-issues-project");
var pulseIssueProject = new pulse_issues_project_1.PulseIssueProject();
var spinner = ora_1.default('Loading issues').start();
pulseIssueProject
    .getIssuesForProviders([providers_1.PROVIDERS.GITHUB, providers_1.PROVIDERS.GITLAB])
    .pipe(operators_1.tap(function (issues) {
    spinner.stop();
    issues_1.displayIssues(issues);
}))
    .subscribe();
//# sourceMappingURL=pulse-issues.js.map