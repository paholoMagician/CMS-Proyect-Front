import { Component, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { ImagecontrolService } from '../shared/image-control/services/imagecontrol.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  _show_spinner:      boolean = false; 
  moduloEmitter: any = {};
  _usuario: boolean = false;
  _asignacion: boolean = false;
  _dashboard: boolean = true;
  _clientes: boolean = false;
  _maquinaria: boolean = false;
  _version: string = '1.0.0 en desarrollo';
  _date: any = '';
  panelOpenState = false;
  _agencias: boolean = false;
  _perfil_usuario: boolean = false;
  _bodegas: boolean = false;

  constructor( private dash: DashboardService ) { }

  ngOnInit(): void {
    this.obtenerVersionCMS();
    this.obtenerEmpresa()
  }
  recibirModulo(modulo: any) {
    this.moduloEmitter = modulo;
    switch (this.moduloEmitter.nombre) {
      case 'Usuario':
        this._usuario    = true;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = false;
        this._agencias   = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        break;
      case 'Cobertura Técnica':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = true;
        this._clientes   = false;
        this._agencias   = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        break;
      case 'Clientes':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = true;
        this._agencias   = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        break;
      case 'Agencias':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = false;
        this._agencias   = true;
        this._maquinaria = false;        
        this._perfil_usuario = false;
        this._bodegas = false;
        break;
      case 'Maquinaria':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = false;
        this._agencias   = false;
        this._maquinaria = true;
        this._perfil_usuario = false;
        this._bodegas = false;
        break;
      case 'Perfil':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = false;
        this._agencias   = false;
        this._maquinaria = false;
        this._perfil_usuario = true;
        this._bodegas = false;
        break;
      case 'Bodegas Virtuales':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = false;
        this._clientes   = false;
        this._agencias   = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = true;
        break;
    }
  }

  versionCMSLista: any = [];
  obtenerVersionCMS(){
    this._show_spinner = true;
    this.dash.getVersionCMS().subscribe({
      next:(cms) => {
        this.versionCMSLista = cms;
        // console.warn(this.versionCMSLista);
        this._show_spinner = false;
      },error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }
    })
  }
  
  versionlista: any = [];
  obtenerVersionamiento(version:string) {
    this._show_spinner = true;
    this.dash.getVersion(version).subscribe({
      next:(version) => {
        this.versionlista = version;
        // console.warn(this.versionlista);
        this._show_spinner = false;
      },error: (e) => {
        this._show_spinner = false;
      }
    })
  }
  listEmpresa: any = [];
  obtenerEmpresa() {
    this._show_spinner = true;
    this.dash.obtenerEmpresa().subscribe({
      next: (empresa) => {
        this.listEmpresa = empresa;
        this._show_spinner = false;
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        sessionStorage.setItem('codcia', this.listEmpresa[0].codcia);
        this._show_spinner = false;
      } 
     })
  }


}
