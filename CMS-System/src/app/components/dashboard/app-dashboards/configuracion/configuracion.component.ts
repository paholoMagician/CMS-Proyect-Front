import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../usuario/services/user.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  ccia:               any;
  _show_spinner: boolean = false;
  @Input() modulo: any = [];
  listausuarios:any = [];

  _funcionalidad_list: any = [

    {
      nombre: 'Configuración de módulos y permisos',
      descripción: '',
      icon: ''
    }

  ];

  constructor( public usuario: UserService ) { }

  ngOnInit(): void {
    // this.xuser = sessionStorage.getItem('UserCod');
    this.ccia = sessionStorage.getItem('codcia');
    // this.obtenerUsuariosEmpresa();
  }
  
  lista:any;
  cargarConfig(data:any []) {
    this.lista = data;
    return this.lista;
  }



}
