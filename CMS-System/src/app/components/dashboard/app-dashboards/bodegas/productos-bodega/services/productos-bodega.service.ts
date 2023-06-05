import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ProductosBodegaService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }
  
  guardarItemBodega(model:any[]) {
    return this.http.post( this.url + 'AsignarProductoBodega/guardarProductoBodega', model );
  }

  obtenerItemsBodega( id:number ) {
    return this.http.get( this.url + 'AsignarProductoBodega/obtenerItemsBodega/' + id );
  }

  eliminarItemBodega( id:number ) {
    return this.http.get( this.url + 'AsignarProductoBodega/eliminarItemBodega/' + id );
  }

}
