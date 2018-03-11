"use strict";
/// <reference path="../index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var glob_1 = require("glob");
var read_file_1 = require("read-file");
var from_1 = require("rxjs/observable/from");
var of_1 = require("rxjs/observable/of");
var operators_1 = require("rxjs/operators");
var util_1 = require("util");
var glob = util_1.promisify(glob_1.default);
var read = util_1.promisify(read_file_1.default);
exports.getFilesListFromGlob = function (globStr) {
    return from_1.from(glob('!(node_modules)/**/*.ts', {})).pipe(operators_1.map(function (files) { return files.filter(function (file) { return !file.includes('node_modules'); }); }), operators_1.catchError(function (err) {
        console.log('An error occured while listing all the files');
        console.log(err);
        return of_1.of([]);
    }));
};
function readFile(filePath) {
    return from_1.from(read(filePath, 'utf8')).pipe(operators_1.catchError(function (e) {
        console.log("An error occured while trying to read \"" + filePath + "\"");
        return of_1.of('');
    }));
}
exports.readFile = readFile;
//# sourceMappingURL=files.helper.js.map