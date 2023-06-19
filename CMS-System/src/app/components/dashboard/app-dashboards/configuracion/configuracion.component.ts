import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  
  @Input() modulo: any = [];
  _show_spinner: boolean = false;

  _funcionalidad_list: any = [

    {
      nombre: 'Configuración de módulos y permisos',
      descripción: '',
      icon: ''
    }

  ];

  constructor() { }

  ngOnInit(): void {
  }
  
  lista:any;
  cargarConfig(data:any []) {
    this.lista = data;
    return this.lista;
  }

}
