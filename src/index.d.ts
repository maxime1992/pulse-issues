import { Observable } from 'rxjs/Observable';

declare module 'read-file' {
  export default function read(file: string, encoding: 'utf8'): Observable<string>;
}
