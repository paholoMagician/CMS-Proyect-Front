import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {

  private hubConnection!: signalR.HubConnection;
  public url: string = environment.deploy_url;

  constructor(private http: HttpClient) { }

  guardarCronos(model:any []) {
    return this.http.post(this.url + 'Cronograma/GuardarCrono', model);
  }

  obtenerCronograma(ccia:string,anio:number,mes:number,loc:any) {
    return this.http.get( this.url + 'Cronograma/obtenerAgencias/'+ccia+ '/'+anio+'/'+mes+'/'+loc );
  }

  obtenerLocalidades() {
    return this.http.get( this.url + 'localidad/MainLocalidad' );
  }

  obtenerDetalleCronoUnit(tipo:number, codcrono:string) { 
    return this.http.get( this.url + 'CronoDetalleUnit/DetalleUnitCrono/'+tipo+'/'+codcrono );
  }

  editarCrnograma( codcronograma:string, model:any[] ) {
    return this.http.put( this.url + 'Cronograma/EditarCrono/'+codcronograma, model );
  }

}
