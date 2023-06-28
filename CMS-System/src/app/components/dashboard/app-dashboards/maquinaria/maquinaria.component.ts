import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/components/shared/services/shared.service';

import Swal from 'sweetalert2'
import { MaquinariaService } from './services/maquinaria.service';
import { Console, error, warn } from 'console';
import { ImagecontrolService } from 'src/app/components/shared/image-control/services/imagecontrol.service';

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

  _IMGE:any;

  tipoMaquinaLista: any = []; 
  maquinariaLista: any = [];

  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _delete_show:       boolean = true;
  _action_butto:      string = 'Crear';
  ccia:               any;
  _show_spinner:      boolean = false; 

  sgrupolista: any = [];
  grupolista: any = [];
  modeloActivo:   any = null;

  columnHead:         any = [ 'edit', 'nombretipomaquina', 'marca', 'modelo', 'ninventario', 'nserie', 'codigobp', 'continicial', 'contfinal', 'observacion' ];
  public dataSource!: MatTableDataSource<any>;

  @Input() modulo: any = [];
  
  dataEmitter: any = {};
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  modelMaquinaria: any = [];

  public maquinariaForm = new FormGroup({
    observacion:                 new FormControl(''),
    modelo:                      new FormControl(''),
    marca:                       new FormControl(''),
    nserie:                      new FormControl(''),
    ninventario:                 new FormControl(''),
    codtipomaquina:              new FormControl(''),
    codigobp:                    new FormControl(''),
    contadorinicial:             new FormControl(),
    contadorfinal:               new FormControl(), 
    codmarca:                    new FormControl(),
    codmodelo:                   new FormControl()
  })

  constructor( private DataMaster: SharedService, private fileserv: ImagecontrolService, private maquinaria: MaquinariaService ) { }
  xuser: any = '';
  ngOnInit(): void {
    this.xuser = sessionStorage.getItem('UserCod');
    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('MQT');
    this.obtenerMaquinaria();

    // console.warn('ESTE ES EL MODULO');
    // console.warn(this.modulo.nombre);

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


  /** OBTENER TIPO DE MAQUINAS */
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'MQT':
            this.tipoMaquinaLista = data;
            break;
        }
      }
    }) 
  }

  /** OBTENER MARCA */
  codtipomaquinaValue:any;
  getGrupos() {
    this.grupolista  = [];
    this.sgrupolista = [];
    this.maquinariaForm.controls['marca'].setValue('');
    this.maquinariaForm.controls['codmarca'].setValue('');
    this.maquinariaForm.controls['modelo'].setValue('');
    this.maquinariaForm.controls['codmodelo'].setValue('');
    this.codtipomaquinaValue = this.maquinariaForm.controls['codtipomaquina'].value.trim();
    this.DataMaster.getDataMasterGrupo(this.codtipomaquinaValue).subscribe({
        next:( grupo ) => {
          this.grupolista = grupo;
          // console.warn(this.grupolista);
        },
        complete: () => {
          // if(this.grupolista.length == 1) {
          //     let grupo:    any = this.grupolista[0].codigotipomaq.trim();
          //     let subgrupo: any = this.grupolista[0].codmarca.trim();
          //     this.DataMaster.getDataMasterSubGrupo(grupo, subgrupo).subscribe(
          //       {
          //         next:( sgrupo ) => {
          //           this.sgrupolista = sgrupo;
          //           // console.warn(this.sgrupolista);
          //         }
          //       }
          //     )       
          // }
        }
      }
    )
  }


  /** OBTENER MODELOS */
  getSubgrupos() {
    // console.warn(this.maquinariaForm.controls['marca'].value);
    this.maquinariaForm.controls['codmarca'].setValue(this.maquinariaForm.controls['marca'].value);
    let grupo: any = this.codtipomaquinaValue;
    let subgrupo: any = this.maquinariaForm.controls['marca'].value;
    this.DataMaster.getDataMasterSubGrupo(grupo.trim(), subgrupo.trim()).subscribe({
      next:( sgrupo ) => {
        this.sgrupolista = sgrupo;
        console.warn(this.sgrupolista);
      }
    });
  }

  obtenerCodigoModelo(data:any) {
    console.log(this.modeloActivo);
    this.maquinariaForm.controls['codmodelo'].setValue(data);    
  }

  codec:any;
  obtenerImagen() {
    this.codec = this.maquinariaForm.controls['codtipomaquina'].value.trim() +'-'+ this.maquinariaForm.controls['codmarca'].value.trim() +'-'+ this.maquinariaForm.controls['codmodelo'].value.trim();
    console.log(this.codec);
    this.fileserv.obtenerImagenCodBinding(this.codec, 'Maquinaria').subscribe({
      next: (imagen:any) => {
        this._IMGE = imagen[0].imagen;
      }
    })  
  }  

  /**GUARDAR MAQUINARIA */
  guardarMaquinaria() {

    if ( this.maquinariaForm.controls['codtipomaquina'].value == undefined ||
         this.maquinariaForm.controls['codtipomaquina'].value == null ||
         this.maquinariaForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmarca'] .value == undefined || this.maquinariaForm.controls['codmarca'].value == null || this.maquinariaForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca de la maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmodelo'].value == undefined || this.maquinariaForm.controls['codmodelo'].value == null || this.maquinariaForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo de la maquina no debe estar vacío' })
    else {
     
      this._show_spinner = true;
      const cliente = this.maquinariaForm.controls['codtipomaquina'].value;
      const token: string = 'MAQ-'+cliente+'-'+this.DataMaster.generateRandomString(15);

      this.modelMaquinaria = {
        "codmaquina":       token,
        "codtipomaquina":   this.maquinariaForm.controls['codtipomaquina'].value.trim(),
        "observacion":      this.maquinariaForm.controls['observacion'].value,
        "modelo":           this.maquinariaForm.controls['codmodelo'].value,
        "marca":            this.maquinariaForm.controls['codmarca'].value,
        "nserie":           this.maquinariaForm.controls['nserie'].value,
        "ninventario":      this.maquinariaForm.controls['ninventario'].value,
        "codigobp":         this.maquinariaForm.controls['codigobp'].value,
        "codusercrea":      this.xuser,
        "feccrea":          new Date(),
        "codcia":           this.ccia,
        "contadorinicial":  this.maquinariaForm.controls['contadorinicial'].value || 0,
        "contadorfinal":    this.maquinariaForm.controls[ 'contadorfinal' ].value || 0
      }

      this.maquinaria.guardarMaquinaria( this.modelMaquinaria ).subscribe(
        {
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Máquina agregada',
              'La máquina con número de serie '+this.maquinariaForm.controls['nserie'].value+' se ha guardado con éxito',
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
        }
      )
     }
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
        // console.log('LISTA MAQUINARIA GUARDADO');
        // console.log(this.maquinariaLista);
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

  
  capturainfo(data:any) {

    for ( let i = 0; i<=2; i++ ) {
      this.catchData(data);
    }

  }

  limpiar() {
    this.maquinariaForm.controls['codtipomaquina'].setValue('');
    this.maquinariaForm.controls['observacion'].setValue('');
    this.maquinariaForm.controls['modelo'].setValue('');
    this.maquinariaForm.controls['codmodelo'].setValue('');
    this.maquinariaForm.controls['marca'].setValue('');
    this.maquinariaForm.controls['codmarca'].setValue('');
    this.maquinariaForm.controls['nserie'].setValue('');
    this.maquinariaForm.controls['ninventario'].setValue('');
    this.maquinariaForm.controls['codigobp'].setValue('');
    this.maquinariaForm.controls['contadorinicial'].setValue(0);
    this.maquinariaForm.controls['contadorfinal'].setValue(0);
    this._action_butto      = 'Crear';
    this._icon_button       = 'add';
    this._cancel_button     = false;  
    this._IMGE = '';
    this.sgrupolista = [];
    this.grupolista = [];
  }

  validacionMenorContador() {
      if(this.maquinariaForm.controls['contadorfinal'].value.toString().length > 1 ) {
        if(this.maquinariaForm.controls['contadorinicial'].value > this.maquinariaForm.controls['contadorfinal'].value) {
          this.maquinariaForm.controls['contadorfinal'].setValue('')
        }
      }

  }


  editarMaquinaria() {
    
    if ( this.maquinariaForm.controls['codtipomaquina'].value == undefined || this.maquinariaForm.controls['codtipomaquina'].value == null || this.maquinariaForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmarca'].value == undefined || this.maquinariaForm.controls['codmarca'].value == null || this.maquinariaForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca de la maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmodelo'].value == undefined || this.maquinariaForm.controls['codmodelo'].value == null || this.maquinariaForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo de la maquina no debe estar vacío' })
    else {
    this._show_spinner = true;
    
    this.modelMaquinaria = {
      "codmaquina":     this.codmaquinaria,
      "codtipomaquina": this.maquinariaForm.controls['codtipomaquina'].value.trim(),
      "observacion":    this.maquinariaForm.controls['observacion'].value,
      "modelo":         this.maquinariaForm.controls['codmodelo'].value,
      "marca":          this.maquinariaForm.controls['codmarca'].value,
      "nserie":         this.maquinariaForm.controls['nserie'].value,
      "ninventario":    this.maquinariaForm.controls['ninventario'].value,
      "codigobp":       this.maquinariaForm.controls['codigobp'].value,
      "codusercrea" :   this.xuser, 
      "feccrea"  :      new Date(),
      "codcia"      :   this.ccia,
      "contadorinicial":       this.maquinariaForm.controls['contadorinicial'].value || 0,
      "contadorfinal":       this.maquinariaForm.controls['contadorfinal'].value || 0
    }

    console.warn('MAQUINARIA');
    console.warn(this.modelMaquinaria);
    this.maquinaria.putMaquinaria( this.codmaquinaria, this.modelMaquinaria ).subscribe({

      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Máquina : ' + this.nombreMaquinaria + ' actualizada. ',
          'La máquina con número de serie '+this.maquinariaForm.controls['nserie'].value+' se ha actualizado con éxito',
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

  codmaquinaria: string = '';
  maquinariaModel: any = [];
  nombreMaquinaria: string = '';
  catchData(data: any) {    
    // console.warn("DATA----------------")
    // console.warn(data)

    this.maquinariaForm.controls['codtipomaquina'].setValue(data.codtipomaquina.trim());

    console.warn(data.codtipomaquina.trim())

    this.getGrupos();
    this.maquinariaForm.controls['marca'].setValue(data.codmarca.trim());
    this.maquinariaForm.controls['codmarca'].setValue(data.codmarca.trim());
    this.getSubgrupos();
    this.maquinariaForm.controls['modelo'].setValue(data.codmodelo.trim());
    this.maquinariaForm.controls['codmodelo'].setValue(data.codmodelo.trim());


    this.maquinariaForm.controls['observacion'].setValue(data.observacion);
    this.maquinariaForm.controls['nserie'].setValue(data.nserie);
    this.maquinariaForm.controls['ninventario'].setValue(data.ninventario);
    this.maquinariaForm.controls['codigobp'].setValue(data.codigobp);
    this.maquinariaForm.controls['contadorinicial'].setValue(data.contadorinicial);
    this.maquinariaForm.controls['contadorfinal'].setValue(data.contadorfinal);
    this.codmaquinaria  = data.codmaquina;
    this._icon_button   = 'sync_alt';
    this._action_butto  = 'Actualizar';
    this._cancel_button = true;
    this.nombreMaquinaria = data.nombretipomaquina;

    this.obtenerImagen();

  }

  eliminarMaquinaria(data:any) {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible y podría provocar perdida de datos en otros procesos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;  
        
        this.maquinaria.eliminarMaquinaria( data.codmaquina ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Máquina: '+ data.nombretipomaquina +' eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar esta máquina',
              'error'
            )
          }, complete: () => {
            this.obtenerMaquinaria();
          } 
        })
      }
    })
  }


 
}
