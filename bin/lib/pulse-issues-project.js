"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var forkJoin_1 = require("rxjs/observable/forkJoin");
var from_1 = require("rxjs/observable/from");
var operators_1 = require("rxjs/operators");
var files_helper_1 = require("./helpers/files.helper");
var issues_1 = require("./issues/issues");
var PulseIssueProject = /** @class */ (function () {
    function PulseIssueProject() {
    }
    PulseIssueProject.prototype.getIssuesForProviders = function (isuesProviders) {
        var filesList$ = files_helper_1.getFilesListFromGlob('!(node_modules)/**/*.ts');
        var files$$ = filesList$.pipe(operators_1.flatMap(function (files) { return from_1.from(files.map(function (file) { return files_helper_1.readFile(file); })); }));
        var readFilesByPool$ = files$$.pipe(
        // TODO: check why bufferCount cannot be more than 1
        operators_1.bufferCount(1), operators_1.concatMap(function (filesObs) { return forkJoin_1.forkJoin.apply(void 0, filesObs); }));
        var getIssuesFromStrings$ = readFilesByPool$.pipe(operators_1.flatMap(function (filesContent) {
            return forkJoin_1.forkJoin.apply(void 0, issues_1.getAllIssuesFromMultipleStrings(filesContent, isuesProviders));
        }), issues_1.flattenIssues());
        var orderedIssues$ = getIssuesFromStrings$.pipe(issues_1.orderIssues());
        return orderedIssues$;
    };
    return PulseIssueProject;
}());
exports.PulseIssueProject = PulseIssueProject;
//# sourceMappingURL=pulse-issues-project.js.map