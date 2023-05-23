import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }


  /** CLIENTES */
  guardarClientes( model: any [] ) {
    return this.http.post( this.url + 'ClienteAgencia/guardarCliente', model );
  }

  obtenerClientes( ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/obtenerClientes/' + ccia );
  }

  editaCLientes( codcli: string, ccia: string, model: any [] ) {
    return this.http.put( this.url + 'ClienteAgencia/EditarCliente/'+codcli+'/'+ccia, model );
  }

  eliminarClientes( codcli: string, ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/eliminarClientes/'+codcli+'/'+ccia );
  }

  /**AGENCIAS */
  guardarAgencia( model:any [] ) {
    return this.http.post( this.url + 'ClienteAgencia/guardarAgencia', model );
  } 

  obtenerAgencias( ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/obtenerAgencias/' + ccia );
  }

  eliminarAgencias( codcli: string, ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/eliminarAgencia/'+codcli+'/'+ccia );
  }

  editaAgencias( codcli: string, ccia: string, model: any [] ) {
    return this.http.put( this.url + 'ClienteAgencia/EditarAgencia/'+codcli+'/'+ccia, model );
  }

}
