/// <reference path="../../../src/index.d.ts" />
import { Observable } from 'rxjs/Observable';
export declare const getFilesListFromGlob: (globStr: string) => Observable<string[]>;
export declare function readFile(filePath: string): Observable<string>;
