import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Log } from './log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  selectedLog: Log;
  logs: Log[];
  readonly baseURL = 'http://localhost:3000/logs';

  constructor(private http: HttpClient) { }

  postLog(lg: Log) {
    return this.http.post(this.baseURL, lg);
  }

  getLogList() {
    return this.http.get(this.baseURL);
  }

  putLog(lg: Log) {
    return this.http.put(this.baseURL + `/${lg._id}`, lg);
  }

  deleteLog(_id: string) {
    return this.http.delete(this.baseURL + `/${_id}`);
  }
}