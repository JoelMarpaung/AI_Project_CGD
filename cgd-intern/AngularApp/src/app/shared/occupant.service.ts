import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Occupant } from './occupant.model';

@Injectable()
export class OccupantService {

  selectedOccupant: Occupant;
  occupants: Occupant[];
  readonly baseURL = 'http://localhost:3000/occupants';

  constructor(private http: HttpClient) { }

  postOccupant(lg: Occupant) {
    return this.http.post(this.baseURL, lg);
  }

  getOccupantList() {
    return this.http.get(this.baseURL);
  }

  putOccupant(lg: Occupant) {
    return this.http.put(this.baseURL + `/${lg._id}`, lg);
  }

  deleteOccupant(_id: string) {
    return this.http.delete(this.baseURL + `/${_id}`);
  }
}
