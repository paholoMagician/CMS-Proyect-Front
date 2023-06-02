import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BodegasService {
  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  guardarBodegas(model: any []) {
    return this.http.post( this.url + 'Bodegas/guardarBodegas', model );
  }

}
