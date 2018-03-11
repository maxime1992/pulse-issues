"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var node_fetch_1 = require("node-fetch");
var forkJoin_1 = require("rxjs/observable/forkJoin");
var from_1 = require("rxjs/observable/from");
var of_1 = require("rxjs/observable/of");
var operators_1 = require("rxjs/operators");
var split_lines_1 = require("split-lines");
var table_1 = require("table");
var issues_interface_1 = require("./issues.interface");
exports.getIssuesFromLines = function (lines, regex, issuesProviderPrepareLink) {
    return lines.reduce(function (issues, line) {
        var issuesFromLine = exports.getIssuesFromLine(line, regex, issuesProviderPrepareLink);
        return issuesFromLine.length ? issues.concat(issuesFromLine) : issues;
    }, []);
};
exports.getIssuesFromLine = function (line, regex, issuesProviderPrepareLink) {
    var match;
    var issues = [];
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = regex.exec(line))) {
        var _1 = match[0], owner = match[1], repo = match[2], id = match[3];
        issues.push({
            link: getLink(issuesProviderPrepareLink, {
                owner: owner,
                repo: repo,
                id: id,
            }),
            owner: owner,
            repo: repo,
            id: id,
        });
    }
    return issues;
};
var getLink = function (prepareLink, data) {
    return prepareLink
        .replace('{{owner}}', data.owner)
        .replace('{{repo}}', data.repo)
        .replace('{{id}}', data.id);
};
exports.fetchIssueStatus = function (issue) {
    return from_1.from(node_fetch_1.default("https://api.github.com/repos/" + issue.owner + "/" + issue.repo + "/issues/" + issue.id)).pipe(operators_1.switchMap(function (data) { return from_1.from(data.json()).pipe(operators_1.map(function (body) { return ({ status: data.status, body: body }); })); }), operators_1.map(function (data) {
        var status = data.status;
        if (status === 200) {
            var state = data.body.state;
            if (state === 'open') {
                return __assign({}, issue, { status: issues_interface_1.IssueStatus.OPEN });
            }
            else if (state === 'closed') {
                return __assign({}, issue, { status: issues_interface_1.IssueStatus.CLOSED });
            }
            else {
                return __assign({}, issue, { status: issues_interface_1.IssueStatus.UNKNOWN });
            }
        }
        else if (status === 404) {
            return __assign({}, issue, { status: issues_interface_1.IssueStatus.NOT_FOUND });
        }
        return __assign({}, issue, { status: issues_interface_1.IssueStatus.ERROR });
    }), operators_1.catchError(function (e) {
        console.log(e);
        return of_1.of(__assign({}, issue, { status: issues_interface_1.IssueStatus.ERROR }));
    }));
};
exports.getAllIssuesFromMultipleStrings = function (strings, issuesProviders) {
    return strings.map(function (fileContent) {
        var issues = [];
        for (var _i = 0, issuesProviders_1 = issuesProviders; _i < issuesProviders_1.length; _i++) {
            var issuesProvider = issuesProviders_1[_i];
            issues.push.apply(issues, exports.getIssuesFromString(fileContent, issuesProvider));
        }
        return forkJoin_1.forkJoin.apply(void 0, issues);
    });
};
exports.getIssuesFromString = function (str, issuesProvider) {
    var regexIssue = new RegExp(issuesProvider.regexStr, 'g');
    var splitedLines = split_lines_1.default(str);
    var issues = exports.getIssuesFromLines(splitedLines, regexIssue, issuesProvider.prepareLink);
    return issues.map(function (issue) { return exports.fetchIssueStatus(issue); });
};
exports.flattenIssues = function () {
    return operators_1.reduce(function (issues, nonFlattenedIssues) {
        nonFlattenedIssues.map(function (nonFlattenedIssues) {
            return nonFlattenedIssues.map(function (issue) { return issues.push(issue); });
        });
        return issues;
    }, []);
};
exports.orderIssues = function () {
    return operators_1.map(function (issues) {
        return issues.sort(function (issue1, issue2) { return issue1.link.localeCompare(issue2.link); });
    });
};
var mapStatusColors = (_a = {},
    _a[issues_interface_1.IssueStatus.OPEN] = chalk_1.default.bgGreen.white,
    _a[issues_interface_1.IssueStatus.CLOSED] = chalk_1.default.bgMagenta.white,
    _a[issues_interface_1.IssueStatus.NOT_FOUND] = chalk_1.default.bgYellow.white,
    _a[issues_interface_1.IssueStatus.ERROR] = chalk_1.default.bgRed.white,
    _a[issues_interface_1.IssueStatus.UNKNOWN] = chalk_1.default.bgBlack.white,
    _a);
var setColorByStatus = function (status) { return mapStatusColors[status](status); };
var getIssuesAsTable = function (issues) {
    var formatAndApplyColorOnStatus = issues.reduce(function (acc, issue) { return acc.concat([
        [issue.owner, issue.repo, issue.id, setColorByStatus(issue.status), issue.link],
    ]); }, []);
    var header = ['Owner', 'Repo', 'ID', 'Status', 'Link'].map(function (title) {
        return chalk_1.default.blueBright.bold(title);
    });
    return table_1.table([header].concat(formatAndApplyColorOnStatus));
};
exports.displayIssues = function (issues) {
    return console.log(issues.length ? getIssuesAsTable(issues) : chalk_1.default.green('No issue found from this path'));
};
var _a;
//# sourceMappingURL=issues.js.map