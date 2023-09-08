
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class MantenimientoCronogramaService {
  public url: string = environment.deploy_url;
  constructor( private http: HttpClient ) { }

  guardarMantenimiento(model:any) {
    return this.http.post( this.url + 'Mantenimiento/guardarMantenimiento', model );
  }

  obtenerMantenimientos( codcrono:string ) {
    return this.http.get( this.url + 'Mantenimiento/ObtenerMantenimientoCrono/' + codcrono );
  }

  eliminarMantenimiento( id:number ) {
    return this.http.get( this.url + 'Mantenimiento/eliminarMantenimiento/' + id );
  }

}
