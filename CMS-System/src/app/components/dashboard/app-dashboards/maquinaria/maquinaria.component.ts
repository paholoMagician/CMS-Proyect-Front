import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/components/shared/services/shared.service';

import Swal from 'sweetalert2'
import { MaquinariaService } from './services/maquinaria.service';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})


@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrls: ['./maquinaria.component.scss']
})
export class MaquinariaComponent implements OnInit {

  tipoMaquinaLista: any = []; 
  maquinariaLista: any = [];
  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _delete_show:       boolean = true;
  _action_butto:      string = 'Crear';
  ccia:               any;
  _show_spinner:      boolean = false; 
  columnHead:         any = [ 'edit', 'nombretipomaquina', 'nombre', 'modelo', 'marca', 'ninventario', 'nserie', 'codigobp', 'observacion' ];
  public dataSource!: MatTableDataSource<any>;

  @Input() modulo: any = [];
  
  dataEmitter: any = {};
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;


  public maquinariaForm = new FormGroup({
    nombremaquina:               new FormControl(''),
    observacion:                 new FormControl(''),
    modelo:                      new FormControl(''),
    marca:                       new FormControl(''),
    nserie:                      new FormControl(''),
    ninventario:                 new FormControl(''),
    codtipomaquina:              new FormControl(''),
    codigobp:                    new FormControl(''),
  })

  constructor( private DataMaster: SharedService, private maquinaria: MaquinariaService ) { }

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('MQT');
    this.obtenerMaquinaria();
  }

  onSubmit() {
    switch(this._action_butto) {
      case 'Crear':
        this.guardarMaquinaria();
        break;
      case 'Actualizar':
        this.editarMaquinaria();
        break;
    }
  }

  validatePersonal() {

    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }

  }

  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'MQT':
            this.tipoMaquinaLista = data;
            // console.log(this.tipoMaquinaLista);
            break;
        }
      }
    }) 
  }

  modelMaquinaria: any = [];
  guardarMaquinaria() {


    if ( this.maquinariaForm.controls['nombremaquina'].value == undefined || this.maquinariaForm.controls['nombremaquina'].value == null || this.maquinariaForm.controls['nombremaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El nombre de la maquinaria no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codtipomaquina'].value == undefined || this.maquinariaForm.controls['codtipomaquina'].value == null || this.maquinariaForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['modelo'].value == undefined || this.maquinariaForm.controls['modelo'].value == null || this.maquinariaForm.controls['modelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo de la maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['marca'].value == undefined || this.maquinariaForm.controls['marca'].value == null || this.maquinariaForm.controls['marca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca de la maquina no debe estar vacío' })
    else {
    this._show_spinner = true;
    const cliente = this.maquinariaForm.controls['nombremaquina'].value.toString().replace(' ', '_').slice(0,6);
    const token: string = 'MAQ-'+cliente+'-'+this.DataMaster.generateRandomString(15);
    const xuser: any = sessionStorage.getItem('UserCod');

    this.modelMaquinaria = {
      "codmaquina": token,
      "nombremaquina":  this.maquinariaForm.controls['nombremaquina'].value,
      "codtipomaquina": this.maquinariaForm.controls['codtipomaquina'].value,
      "observacion":    this.maquinariaForm.controls['observacion'].value,
      "modelo":         this.maquinariaForm.controls['modelo'].value,
      "marca":          this.maquinariaForm.controls['marca'].value,
      "nserie":         this.maquinariaForm.controls['nserie'].value,
      "ninventario":    this.maquinariaForm.controls['ninventario'].value,
      "codigobp":       this.maquinariaForm.controls['codigobp'].value,
      "codusercrea" :   xuser, 
      "feccrea"  :      new Date(),
      "codcia"      :   this.ccia
    }

    console.warn('MAQUINARIA');
    console.warn(this.modelMaquinaria);
    this.maquinaria.guardarMaquinaria( this.modelMaquinaria ).subscribe({

      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Máquina: '+this.maquinariaForm.controls['nombremaquina'].value+' agregada',
          'La máquina se ha guardado con éxito',
          'success'
        )
      }, error: (e) => {
        console.error(e);
        Swal.fire(
          'Oops!',
          'Esta máquina no se ha podido guardar',
          'error'
        )
      }, complete: () => {
        this.obtenerMaquinaria();
        this.limpiar();
      }

    })
    }
  }

  editarMaquinaria() {

  }

  eliminarMaquinaria(data:any) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  obtenerMaquinaria() {
    this._show_spinner = true;
    this.maquinaria.obtenerMaquinaria( this.ccia ).subscribe({
      next: (maquinas) => {
        this.maquinariaLista = maquinas
        console.log('LISTA MAQUINARIA GUARDADO');
        console.log(this.maquinariaLista);
        this._show_spinner = false;
      },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      },
      complete: () => {
        this.dataSource = new MatTableDataSource(this.maquinariaLista);
        this.dataSource.paginator = this.paginator;
      }
    })
  }

  codmaquinaria: string = '';
  maquinariaModel: any = [];
  
  catchData(data: any) {

    this.maquinariaModel = data;
    
    this.maquinariaForm.controls['nombremaquina'].setValue(data.nombremaquina);
    this.maquinariaForm.controls['codtipomaquina'].setValue(data.codtipomaquina.trim());
    this.maquinariaForm.controls['observacion'].setValue(data.observacion);
    this.maquinariaForm.controls['modelo'].setValue(data.modelo);
    this.maquinariaForm.controls['marca'].setValue(data.marca);
    this.maquinariaForm.controls['nserie'].setValue(data.nserie);
    this.maquinariaForm.controls['ninventario'].setValue(data.ninventario);
    this.maquinariaForm.controls['codigobp'].setValue(data.codigobp);
    this.codmaquinaria = data.codmaquina;
    this._icon_button   = 'sync_alt';
    this._action_butto  = 'Actualizar';
    this._cancel_button = true;
  }

  limpiar() {
    this.maquinariaForm.controls['nombremaquina'].setValue('');
    this.maquinariaForm.controls['codtipomaquina'].setValue('');
    this.maquinariaForm.controls['observacion'].setValue('');
    this.maquinariaForm.controls['modelo'].setValue('');
    this.maquinariaForm.controls['marca'].setValue('');
    this.maquinariaForm.controls['nserie'].setValue('');
    this.maquinariaForm.controls['ninventario'].setValue('');
    this.maquinariaForm.controls['codigobp'].setValue('');
    this._action_butto      = 'Crear';
    this._icon_button       = 'add';
    this._cancel_button     = false;
  }

}
