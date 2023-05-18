import { Component, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  moduloEmitter: any = {};
  _usuario: boolean = false;
  _asignacion: boolean = false;
  _dashboard: boolean = true;
  _version: string = '1.0.0 en desarrollo';
  _date: any = '';
  panelOpenState = false;

  constructor( private dash: DashboardService ) { }

  ngOnInit(): void {
    this.obtenerVersionCMS();
    this.obtenerEmpresa()
  }
  recibirModulo(modulo: any) {
    this.moduloEmitter = modulo;
    switch (this.moduloEmitter.nombre) {
      case 'Usuario':
        this._usuario = true;
        this._dashboard = false;
        this._asignacion = false;
        break;
      case 'Cobertura Técnica':
        this._usuario    = false;
        this._dashboard  = false;
        this._asignacion = true;
        break;
    }
  }

  versionCMSLista: any = [];
  obtenerVersionCMS(){
    this.dash.getVersionCMS().subscribe({
      next:(cms) => {
        this.versionCMSLista = cms;
        console.warn(this.versionCMSLista);
      }
    })
  }
  
  versionlista: any = [];
  obtenerVersionamiento(version:string) {
    this.dash.getVersion(version).subscribe({
      next:(version) => {
        this.versionlista = version;
        console.warn(this.versionlista);
      }
    })
  }
  listEmpresa: any = [];
  obtenerEmpresa() {
    this.dash.obtenerEmpresa().subscribe({
      next: (empresa) => {
        this.listEmpresa = empresa;
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        sessionStorage.setItem('codcia', this.listEmpresa[0].codcia);
      } 
     })
  }

}
