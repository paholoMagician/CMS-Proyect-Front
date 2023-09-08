import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CrononewdisService } from './services/crononewdis.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from '../usuario/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2'


import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { CronogramaService } from '../cronograma/services/cronograma.service';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { error } from 'console';
import { MantenimientoCronogramaService } from '../crono-grid/services/mantenimiento-cronograma.service';
import { ModalDetalleCronoComponent } from '../crono-grid/modal-detalle-crono/modal-detalle-crono.component';
import { environment } from 'src/environments/environment.prod';

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
  selector: 'app-crononewdis',
  templateUrl: './crononewdis.component.html',
  styleUrls: ['./crononewdis.component.scss']
})
export class CrononewdisComponent implements OnInit {

  _color_letras:string = '';

  _show_filters:boolean = true;
  _width_filter: string = 'auto';
  _show_historymaquine: boolean = false;
  _viewMantenim:boolean = false;
  filtroTexto:any;
  resultado:any = [];  
  listUsuarios:any = [];
  lisTecnicos: any = [];

  calssMenuFilter: string = 'filter-section rounded-2 animate__animated animate__backInDown';

  _filtros:any;

  _dis_btn_setts:boolean = false;
  clientesel: string = 'Escoge un cliente a visualizar'
  listaAgenciasRes: any = [];
  resultadosFiltrados: any = [];
  public ccia:any;
  filteredCronos:any = [];
  _IMGE: any;
  resultadosFiltradosNorte:any = [];
  resultadosFiltradosCentro:any = [];
  resultadosFiltradosSur:any = [];
  resultadosFiltradosGeneral:any = [];
  anioactual: any;
  zlist1:any = [];
  zlist2:any = [];
  zlist3:any = [];
  zlist4:any = [];
  zlist5:any = [];
  zlist6:any = [];
  zlist7:any = [];

  N:string='';
  S:string='';
  C:string='';
  G:string='';
  sumatoria = 0;
  sumatoriaFilter = 0;
  mes = 0;

  listaZonificacion: any = [];

  public localidadform = new FormGroup({
    localidad:   new FormControl(),
  })

  public viewtecnicosform = new FormGroup({
    tecnicoLocal: new FormControl(true)
  })
 

  codeZone:string = '';
  _show_spinner: boolean = false;

  listmeses: any = [{nombre:"Enero", cod: 1}, {nombre:"Febrero", cod: 2}, {nombre:"Marzo", cod: 3}, {nombre:"Abril", cod: 4},
                    {nombre:"Mayo", cod: 5}, {nombre:"Junio", cod: 6}, {nombre:"Julio", cod: 7}, {nombre:"Agosto", cod: 8}, {nombre:"Septiembre", cod: 9},
                    {nombre:"Octubre", cod: 10}, {nombre:"Noviembre", cod: 11}, {nombre:"Diciembre", cod: 12}]

  staticDias: any = [ 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábados' ];

  constructor( private crone: CrononewdisService,
               public dialog: MatDialog,
               private client: ClienteService, 
               private crono: CronogramaService,
               private DataMaster: SharedService,
               private us: UserService,
               private mantenimineto: MantenimientoCronogramaService ) { }

               mesSeleccionado:any;
  ngOnInit(): void {

    let xlocalidad:any = localStorage.getItem('localidad-cronograma-2');

    this.localidadform.controls['localidad'].setValue(Number(xlocalidad));
    this.obtenerLocalidadId();
    this.anioactual = new Date().getFullYear();
    this.ccia = sessionStorage.getItem('codcia');

    const meselegido = localStorage.getItem('meselegido');
  
    if (meselegido) {
      this.mesSeleccionado = Number(meselegido);
      this.diasdelMes(this.mesSeleccionado);
    }

    // this.configurationSpeedDial();
    this.asignarColores();  
    this.obtenerLocalidades();
  }
  
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'ZNF':
            this.listaZonificacion = data;
            console.log(this.listaZonificacion);
            break;
        }
      }, complete: () => {

        this.listaZonificacion.filter((element:any) => {
          this.obtenerZonaAgencia(element.codigo);
        })

      }
    }) 
  }

  filtrarElementos() {
    this.listaMaquinariaAsignadaGhost = this.resmaquinas.filter((item:any) =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.tipomaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  maqsel:boolean = false;
  listaManetnimientoMaquinas: any = [];
  selectAll: boolean = false;
  tecnicoObtenido:any=[];
  selectAllMachine() {    
    
    this.listaMaquinariaAsignadaGhost.forEach((maquina: any) => {
      maquina.selected = this.selectAll;
      if (this.selectAll && !this.listaManetnimientoMaquinas.find((item: any) => item.codprod === maquina.codmaquina)) {
          this.addMaquinaManetenimiento({ target: { checked: true } }, maquina.codmaquina);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {
              element.tecniconombre = this.tecnicoObtenido.tecnico;
              element.fotoperfil = this.tecnicoObtenido.imagenTecnico;
              element.show = true;            
          })
      } else if (!this.selectAll) {
          this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== maquina.codmaquina);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {

            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;

        })
      }
    });

  }
  manteniminetocount:number = 0;
  addMaquinaManetenimiento(event: any, codmachine: any) {

    const xuser: any = sessionStorage.getItem('UserCod');
    if (event.target.checked) {
        const array = {
            codcrono: this.codCrono,
            codtecnico: this.tecnicoObtenido.codusertecnic,
            feciniciomante: null,
            feccrea: new Date(),
            fecfinmant: null,
            horainit: 0,
            horafin: 0,
            usercrea: xuser,
            codprod: codmachine,
            estado: 1
        };

        this.listaManetnimientoMaquinas.push(array);

        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = this.tecnicoObtenido.tecnico;
            element.fotoperfil = this.tecnicoObtenido.imagenTecnico;
            element.show = true;
          }
        })

        console.warn(this.listaManetnimientoMaquinas);
        
    } else {
        this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== codmachine);

        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;
          }
        })

        console.warn(this.listaManetnimientoMaquinas);

    }

    // console.warn('Mantenimiento Agregado');
    // console.warn(this.listaManetnimientoMaquinas);
    this.manteniminetocount = this.listaManetnimientoMaquinas.length;

  }


  getTecnico(tecnico:any) {
    this.tecnicoObtenido = tecnico;
    console.warn(this.tecnicoObtenido);    
    setTimeout(() => {
      this.encontrarMaquinasFaltantes();
      // this.encontrarMaquinasRepetidas();
    }, 500);
  }

  filterMant:any;
  guardarMantenimiento() {

    this.listaManetnimientoMaquinas.filter((element:any) => {
    this.mantenimineto.guardarMantenimiento(element).subscribe ({
        next:(x) => {
          Toast.fire({ icon: 'success', title: 'Asignación ha sido completada' })
          console.log(x);
        }, error: (e) => {
          Toast.fire({ icon: 'error', title: 'No se ha podido completar la asignación' })
          console.log(e);
        }, complete: () => {
          this.obtenerMantenimiento();
          this.manteniminetocount = 0;
          this.selectAll = false;
          setTimeout(() => {
            this.encontrarMaquinasFaltantes();
            // this.encontrarMaquinasRepetidas();
          }, 500);
        }
      }
    )
    }
    )
  }

  codMachine:any;
  obtenerCodMachine(codmachine:any):string {
    this.codMachine = codmachine;
    console.warn(this.codMachine);
    return this.codMachine;
  }

  eliminarMantenimiento( id:number ) {
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
        this.mantenimineto.eliminarMantenimiento( id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire (
              'Deleted!',
              'Mantenimiento eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar este mantenimiento',
              'error'
            )
          }, complete: () => {
            this.obtenerMantenimiento();
            setTimeout(() => {
              this.encontrarMaquinasFaltantes();
              // this.encontrarMaquinasRepetidas();
            }, 1000);
          } 
          })
        }
    })
  }

  openDialog(data:any): void {

    const reasignData = {
        "nombreTecnico": data.nombreTecnico,
        "codfrecuencia": data.codfrecuencia,
        "frecuencia": data.frecuencia,
        "nombreCliente": data.nombreCliente,
        "nombreAgencia": data.nombreAgencia,
        "codcrono": data.codcrono,
        "codusertecnic": data.codusertecnic,
        "codcli": data.codcliente,
        "codagencia": data.codagencia,
        "observacion": data.observacion,
        "feccrea": data.feccrea,
        "codusercreacrono": data.codusercreacrono,
        "semanainicio": data.semanainicio,
        "mes": data.mes,
        "dia": Number(data.dia),
        "anio": data.anio,
        "fechamantenimiento": data.fechamantenimiento,
        "maquinasmanuales": data.maquinasmanuales,
        "localidad": this.idLocalidad
    }

    const dialogRef = this.dialog.open( ModalDetalleCronoComponent, {
      height: '600px',
      width:  '50%',
      data: reasignData, 
    });

    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( 'result' );
      console.warn( result );
      console.warn('mes: ' + this.mes);
      this.diasdelMes(this.mes);

    });


  }


  filterMantenimiento () {
    this.listaMantenimientoMaquinaGhost = this.listaMaquinaMantenimiento.filter((item:any) =>
    item.nombreTecnico.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.marca.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.modelo.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nserie.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nombretipomaquina.toLowerCase().includes(this.filterMant.toLowerCase())
  );
  }

  env = environment.image_url;
  obtenerZonaAgencia(codec:string) {  
    this.resultadosFiltradosNorte   = [];
    this.resultadosFiltradosCentro  = [];
    this.resultadosFiltradosSur     = [];
    this.resultadosFiltradosGeneral = [];
    this.crone.obtenerAgenciaLocalizacion(this.idLocalidad, codec).subscribe({
      next:(x:any) => {        
        if( codec == '001' ) {
          this.zlist1 = x;
          this.resultadosFiltradosNorte = x;
          console.warn('Norte');
          console.warn(this.resultadosFiltradosNorte);
          this.resultadosFiltradosNorte.filter( (cli:any) => {
            // console.warn(this.env + cli.imagen)
            cli.imagen = this.env + cli.imagen;
          })
        }      
        else if (codec == '002') {
          this.zlist2 = x;
          this.resultadosFiltradosSur = x;
          console.warn('SUR');
          console.warn(this.resultadosFiltradosSur);
          this.resultadosFiltradosSur.filter( (cli:any) => {
            // console.warn(this.env + cli.imagen)
            cli.imagen = this.env + cli.imagen;
          })
        } 
        else if (codec == '003') {
          this.zlist3 = x;
          this.resultadosFiltradosCentro = x;
          this.resultadosFiltradosCentro.filter( (cli:any) => {
            // console.warn(this.env + cli.imagen)
            cli.imagen = this.env + cli.imagen;
          })
        }
        else if (codec == '004') {
          this.zlist4 = x;
          this.resultadosFiltradosGeneral = x;
          this.resultadosFiltradosGeneral.filter( (cli:any) => {
            // console.warn(this.env + cli.imagen)
            cli.imagen = this.env + cli.imagen;
          })
        }
        else if (codec == '005') {
          this.zlist5 = x;
        }
        else if (codec == '006') {
          this.zlist6 = x;
        }
        else if (codec == '007') {
          this.zlist7 = x;
        }
      }
    })
  
  } 

  transform(items: any[], filter: any): any[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.dia === filter.dia);
  }  

  getColorForInitial(initial: string): string {
    
    const colors: { [key: string]: string } = {
      N: 'red',
      C: 'green',
      S: 'blue',
      G: 'orange'
    };
    
    return colors[initial] || 'gray';

  }

  asignarColores() {
    this.N = this.getColorForInitial('N');
    this.S = this.getColorForInitial('S');
    this.C = this.getColorForInitial('C');
    this.G = this.getColorForInitial('G');
  }

  filtroTextoNorte: string = '';
  filtrarElementosNorte() {
    this.resultadosFiltradosNorte = this.zlist1.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase())
    );
  }

  filtroTextoCentro: string = '';
  filtrarElementosCentro() {
    this.resultadosFiltradosCentro = this.zlist3.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase())
    );
  }

  filtroTextoSur: string = '';
  filtrarElementosSur() {
    this.resultadosFiltradosSur = this.zlist2.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoSur.toLowerCase())
    );
  }
  
  filtroTextoGeneral: string = '';
  filtrarElementosGeneral() {
    this.resultadosFiltradosGeneral = this.zlist4.filter((item:any) =>
      item.nombreAgencia  .toLowerCase().includes(this.filtroTextoGeneral.toLowerCase())
    );
  }

  resTecnicosFiltrados:any=[];
  filtroTecnico:any;
  fitrarTecnicos() {
    
    console.log(this.filtroTecnico)
    this.resTecnicosFiltrados = this.lisTecnicos.filter( (item:any) => 
    item.nombre.toLowerCase()
               .includes( this.filtroTecnico.toLowerCase() ))
               console.warn(this.resTecnicosFiltrados);

  }

  listaLocalidades: any = [];
  obtenerLocalidades() {

    this.crono.obtenerLocalidades().subscribe(
      {
        next: (x) => {
          this.listaLocalidades = x;
          console.warn(this.listaLocalidades);
        }, error: (e) => {
          console.error(e);
        }
      }
    )

  }

  idLocalidad: any;
  obtenerLocalidadId() {
      this.idLocalidad = this.localidadform.controls['localidad'].value;
      if ( this.idLocalidad != null || this.idLocalidad != undefined ) {
        this.validatesettings(this.idLocalidad);
        this.getDataMaster('ZNF');
      }

      console.warn('>>>>>>>>>>>>>>>>>>>');
      console.warn(this.idLocalidad);
      console.warn('>>>>>>>>>>>>>>>>>>>');

      localStorage.setItem('localidad-cronograma-2', this.idLocalidad);


  }

  validatesettings(id:any) {

    if ( (id == undefined || id == null)  ) {
      this._dis_btn_setts = false;
      return this._dis_btn_setts;
    }
    else {
      this._dis_btn_setts = true;
      return this._dis_btn_setts;
    }

  }

  eliminarCrono( codcrono:string ) {

    Swal.fire({
      title: 'Estás seguro?',
      text: "¡Esta acción es irreversible y podría provocar perdida de datos en otros procesos!. ¿Estas seguro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.crono.deleteCrono(codcrono).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Cronograma eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar el cronograma',
              'error'
            )
          }, complete: () => {
            this.obtenerCrono(this.mes);
          } 
        })
      }
    })

  }

  diasdelMes(mes: number): any[] {

    this.mes = mes;
    localStorage.setItem('meselegido', this.mes.toString());

    // Verifica si el número de mes es válido (entre 1 y 12)
    if (mes < 1 || mes > 12) {
      throw new Error('Número de mes inválido. Debe estar entre 1 y 12.');
    }

    const esBisiesto = (this.anioactual % 4 === 0 && this.anioactual % 100 !== 0) || this.anioactual % 400 === 0;
    const diasEnFebrero = esBisiesto ? 29 : 28;

    const fecha = new Date(this.anioactual, mes - 1, 1);

    let diasEnMes = 31;
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
      diasEnMes = 30;
    } else if (mes === 2) {
      diasEnMes = diasEnFebrero;
    }

    this.resultado = [];

    for (let i = 1; i <= diasEnMes; i++) {
      const fechaDia = new Date(this.anioactual, mes - 1, i);
      // eeee representa el nombre completo del día de la semana
      const diaDeSemana = format(fechaDia, 'eeee', { locale: es }); 
      // dd representa el día del mes con dos dígitos
      if (diaDeSemana !== 'domingo') {
        // dd representa el día del mes con dos dígitos
        const numeroDia = format(fechaDia, 'dd', { locale: es }); 
        this.resultado.push({ dia: diaDeSemana, numero: numeroDia });
      }
      // const numeroDia = format(fechaDia, 'dd', { locale: es }); 
      // this.resultado.push({ dia: diaDeSemana, numero: numeroDia });
    }

    this.obtenerUsuario();
    return this.resultado;

  }

  dismes:any = [];
  searchText: string = '';
  selectedDay: string = '';
  filteredData: any[] = [];
  unirDatos() {
    this.dismes = this.resultado.map((diaMes: any) => ({
      dia: diaMes.dia,
      numero: diaMes.numero,
      tecnicos: [],
    }));
  
    for (const tecnico of this.lisTecnicos) {
      for (const diaMes of this.dismes) {
        diaMes.tecnicos.push({ ...tecnico, cronograma: [] });
      }
    }
  
    for (const tecnico of this.lisTecnicos) {
      const cronogramasTecnico = this.filteredCronos.filter(
        (crono: any) => crono.codusertecnic === tecnico.codusertecnic
      );
  
      for (const cronogramaTecnico of cronogramasTecnico) {
        const diaMes = this.dismes.find((d: any) => d.numero === cronogramaTecnico.dia);
        if (diaMes) {
          const tecnicoEnDia = diaMes.tecnicos.find((t: any) => t.codusertecnic === tecnico.codusertecnic);
          if (tecnicoEnDia) {
            tecnicoEnDia.cronograma.push(cronogramaTecnico);
          }
        }
      }
    }
  
    this.dismes.forEach((diaMes: any) => {
      diaMes.tecnicos.forEach((tecnico: any) => {
        let totalMaquinasIngresadasManual = tecnico.cronograma.reduce(
          (sum: number, cronograma: any) => sum + cronograma.cantidadMaquinasAsignadas, 0
        );
  
        let totalMaquinasManuales = tecnico.cronograma.reduce(
          (sum: number, cronograma: any) => sum + cronograma.maquinasmanuales, 0
        );
  
        tecnico.TotalMaquinasManuales = totalMaquinasManuales;
        tecnico.TotalMaquinasIngresadasManual = totalMaquinasIngresadasManual;

        if(tecnico.TotalMaquinasManuales == 0) tecnico.colorestadomaquinaria = 'gray';
        else if(tecnico.TotalMaquinasManuales > 0 && tecnico.TotalMaquinasManuales < tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = '#51B5D9';
        else if(tecnico.TotalMaquinasManuales == tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = '#5C8300';
        else if(tecnico.TotalMaquinasManuales > tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = 'red';

      });
    });
  
    this.filteredData = this.dismes;

    console.warn(this.filteredData);

  }
  
  

//#region UnirDatos Antiguo()
  // unirDatos() {
  //   this.dismes = this.resultado.map((diaMes: any) => ({
  //     dia: diaMes.dia,
  //     numero: diaMes.numero,
  //     tecnicos: [],
  //   }));
  
  //   for (const tecnico of this.lisTecnicos) {
  //     for (const diaMes of this.dismes) {
  //       diaMes.tecnicos.push({ ...tecnico, cronograma: [] });
  //     }
  //   }
  
  //   for (const tecnico of this.lisTecnicos) {

  //     const cronogramasTecnico = this.filteredCronos.filter(
  //       (crono: any) => crono.codusertecnic === tecnico.codusertecnic
  //     );
  
  //     for (const cronogramaTecnico of cronogramasTecnico) {
        
  //       const diaMes = this.dismes.find((d: any) => d.numero === cronogramaTecnico.dia);
  //       if (diaMes) {
  //         const tecnicoEnDia = diaMes.tecnicos.find( (t: any) => t.codusertecnic === tecnico.codusertecnic );
  //         if (tecnicoEnDia) { tecnicoEnDia.cronograma.push(cronogramaTecnico); }
  //       }
  //     }  
  //   }

  //   this.filteredData = this.dismes;
  //   this.filteredData.filter((x:any)=>{
  //     console.warn('♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣')
  //     console.warn(x.tecnicos);
  //     console.warn('♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣')
  //   })
  
  // }
  //#endregion

  filterByTechnicianName() {
    if (!this.searchText) {
        this.filteredData = this.dismes;
        return;
    }

    this.filteredData = this.dismes.map((diaMes:any) => {
        return {
            ...diaMes,
            tecnicos: diaMes.tecnicos.filter((tecnico:any) => 
                tecnico.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
                tecnico.apellido.toLowerCase().includes(this.searchText.toLowerCase())
            )
        };
    });
  }

  filterByDay() {
    if (!this.selectedDay) {
        this.filteredData = this.dismes;
        return;
    }

    this.filteredData = this.dismes.filter((diaMes:any) =>
        diaMes.numero === this.selectedDay || 
        diaMes.dia === this.selectedDay
    );
  }


  
  listadetalleCronoUnit: any = [];
  modelUnitCronoDetalle: any = [];
  // resultadosFiltrados: any = [];
  codCrono:any;
  obtenerCronoUnit(codcrono:string, codagencia:string, mes:any, dia:any) {
    this.listaManetnimientoMaquinas = []
    this.codCrono = codcrono;

    this.crono.obtenerDetalleCronoUnit(2, codagencia, mes, dia).subscribe({
      next: (x) => {
        this.listadetalleCronoUnit = x;
        this.resultadosFiltrados = x;
        console.warn(this.listadetalleCronoUnit);
        this.modelUnitCronoDetalle = this.listadetalleCronoUnit[0];
        console.warn('============================');
        // console.warn('modelUnitCronoDetalle');
        console.warn(this.resultadosFiltrados);
        console.warn('============================');
      }, complete: () => {

        
        this.obtenerMaquinaAsignada(codagencia)
        this.obtenerMantenimiento();
        setTimeout(() => {
          this.encontrarMaquinasFaltantes();
          // this.encontrarMaquinasRepetidas();
        }, 1000);


      }
    })
  }

  listaMaquinariaAsignada:any = [];
  listaMaquinariaAsignadaGhost:any = [];
  obtenerMaquinaAsignada(codagencia: any) {
    this.client.obtenerMaquinaAgenciaAsignada(codagencia, this.ccia).subscribe({
      next: (maquinaAsignada) => {
        this.listaMaquinariaAsignada = maquinaAsignada;
        console.warn('NO ASIGNADOS');
        console.log(this.listaMaquinariaAsignada);
      },
      error: (e) => {
        console.error(e);
      }, complete: () => {

        this.listaMaquinariaAsignada.filter((element:any)=>{
          let array = {
            "codmaquina":   element.codmaquina,
            "nserie":       element.nserie,
            "tipomaquina":  element.tipomaquina,
            "nombremarca":  element.nombremarca,
            "nombremodelo": element.nombremodelo,
            "tecniconombre":  '',
            "fotoperfil": '',
            "show": false
          }

          this.listaMaquinariaAsignadaGhost = array;

        })

      }
    });
  }

  resmaquinas:any = [];
  encontrarMaquinasFaltantes() {
    const codMaquinasMantenimiento = new Set(
      this.listaMantenimientoMaquinaGhost.map((m: any) => m.codmaquina)
    );
  
    const maquinasFaltantes = this.listaMaquinariaAsignada.filter(
      (maquina: any) => !codMaquinasMantenimiento.has(maquina.codmaquina)
    );
  
    this.resmaquinas = maquinasFaltantes;
    console.log('Maquinas asignadas al mantenimiento:', this.resmaquinas);
    
    this.listaMaquinariaAsignadaGhost = this.resmaquinas;
    console.log('Maquinas Restantes para el mantenimiento:', this.listaMaquinariaAsignadaGhost);

  }

  maquinasEnviadasMantenimiento: any = [];
  encontrarMaquinasRepetidas() {
    const codMaquinasMantenimiento = new Set(
      this.listaMantenimientoMaquinaGhost.map((m: any) => m.codmaquina)
    );
  
    const codMaquinasAsignadas = new Set(
      this.listaMaquinariaAsignada.map((m: any) => m.codmaquina)
    );
  
    const codMaquinasRepetidas = Array.from(codMaquinasMantenimiento).filter(
      codMaquina => codMaquinasAsignadas.has(codMaquina)
    );

    this.maquinasEnviadasMantenimiento = codMaquinasRepetidas
    console.log('Máquinas que se repiten:', this.maquinasEnviadasMantenimiento);
  }
  
  


    listaMaquinaMantenimiento: any = [];
    listaMantenimientoMaquinaGhost:  any = [];
    obtenerMantenimiento() {    
      this.manteniminetocount = 0;
      this.mantenimineto.obtenerMantenimientos(this.codCrono).subscribe({
        next: (mantenimiento) => {
          this.listaMaquinaMantenimiento = mantenimiento; 
          this.listaMantenimientoMaquinaGhost = mantenimiento;
          console.warn('--------MANTENIMIENTO--------');
          console.warn(this.listaMaquinaMantenimiento);
        }
      });
    }
  
  
  obtenerCrono(mes:number) {

    this._show_spinner   = true;
    this.sumatoriaFilter = 0;
    this.filteredCronos  = [];
    this.crono.obtenerCronograma( this.ccia,
                                  this.anioactual,
                                  mes,
                                  this.idLocalidad,
                                  3 )
                                  .subscribe (
      {
        next: (x) => {
          this.filteredCronos = x;
          // console.warn('====CRONO====')
          // console.warn(this.filteredCronos)
          this.filteredCronos.filter( (cli:any) => {
            // console.warn(this.env + cli.imagen)
            cli.imagen = this.env + cli.imagen;
          })
        },
        error: (e) => {
          this._show_spinner = false;
          console.error(e);
        },
        complete: () => {
          this._show_spinner = false;
          this.unirDatos();
        }
      }
    )
  }

  obtenerUsuario() {
    this._show_spinner = true;
    this.listUsuarios = [];

    if (this.viewtecnicosform.controls['tecnicoLocal'].value) {
      this.us.obtenerUsuariosCronos(this.idLocalidad).subscribe({
        next: (usuarios) => {
          this.listUsuarios = usuarios;
        }, error: (e) => {
          console.error(e);
          this._show_spinner = false;
        }, complete: () => {
          this.lisTecnicos = [];
          this.listUsuarios.filter( (element:any) => {
              const arr = {
                  "imagenPerfil":  element.imagenPerfil,
                  "codusertecnic": element.coduser,
                  "email":         element.email,
                  "nombre":        element.nombre,
                  "apellido":      element.apellido,
                  "cedula":        element.cedula,
                  "cargo":         element.cargo,
                  "nombreCargo":   element.nombreCargo,
                  "contrasenia":   element.contrasenia,
                  "estado":        element.estado,
                  "nombreEstado": element.nombreEstado,
                  "edad": element.edad,
                  "tipo": element.tipo,
                  "movilidad": element.movilidad,
                  "nombreMovilidad": element.nombreMovilidad,
                  "codcaracteristicas": element.codcaracteristicas,
                  "nombreCapacidad": element.nombreCapacidad,
                  "valoracion": element.valoracion,
                  "codProvincia": element.codProvincia.trim(),
                  "nombreProvincia": element.nombreProvincia,
                  "codCanton": element.codCanton.trim(),
                  "nombreCanton": element.nombreCanton,
                  "codSexo": element.codSexo.trim(),
                  "nombreSexo": element.nombreSexo,
                  "codEstadoCivil": element.codEstadoCivil,
                  "nombreEstadoCivil": element.nombreEstadoCivil,
                  "codDepartamento": element.codDepartamento,
                  "nombreDepartamento": element.nombreDepartamento,
                  "codLicencia": element.codLicencia,
                  "nombreLicencia": element.nombreLicencia,
                  "telf": element.telf,
                  "direccion": element.direccion
              }
  
              this.lisTecnicos.push(arr);
              this._show_spinner = false;
  
          })
          
          this.obtenerCrono(this.mes);

        }

      })
    } else if ( !this.viewtecnicosform.controls['tecnicoLocal'].value ) {
      this.us.obtenerUsuarios(this.ccia).subscribe({
        next: (usuarios) => {
          this.listUsuarios = usuarios;
        }, error: (e) => {
          console.error(e);
          this._show_spinner = false;
        },complete: () => {
          this.lisTecnicos = [];
          this.listUsuarios.filter( (element:any) => {
            if( element.tipo == '003' ) {
  
              const arr = {
                  "imagenPerfil": element.imagenPerfil,
                  "codusertecnic": element.coduser,
                  "email": element.email,
                  "nombre": element.nombre,
                  "apellido": element.apellido,
                  "cedula": element.cedula,
                  "cargo": element.cargo,
                  "nombreCargo": element.nombreCargo,
                  "contrasenia": element.contrasenia,
                  "estado": element.estado,
                  "nombreEstado": element.nombreEstado,
                  "edad": element.edad,
                  "tipo": element.tipo,
                  "movilidad": element.movilidad,
                  "nombreMovilidad": element.nombreMovilidad,
                  "codcaracteristicas": element.codcaracteristicas,
                  "nombreCapacidad": element.nombreCapacidad,
                  "valoracion": element.valoracion,
                  "codProvincia": element.codProvincia.trim(),
                  "nombreProvincia": element.nombreProvincia,
                  "codCanton": element.codCanton.trim(),
                  "nombreCanton": element.nombreCanton,
                  "codSexo": element.codSexo.trim(),
                  "nombreSexo": element.nombreSexo,
                  "codEstadoCivil": element.codEstadoCivil,
                  "nombreEstadoCivil": element.nombreEstadoCivil,
                  "codDepartamento": element.codDepartamento,
                  "nombreDepartamento": element.nombreDepartamento,
                  "codLicencia": element.codLicencia,
                  "nombreLicencia": element.nombreLicencia,
                  "telf": element.telf,
                  "direccion": element.direccion
              }
              this.lisTecnicos.push(arr);
            }
            this._show_spinner = false;
  
          })
          this.obtenerCrono(this.mes);
        }
      })
    } 
  }

  draggedItem: any;
  dragStart = (data: any) => {
    this.draggedItem = data;
  }
  
  modelCrono: any = [];
  listaCronoGenerada:any = [];
  drop = (diames:any, tecnico:any) => {
    if (this.draggedItem) {

      let xuser: any = sessionStorage.getItem('UserCod');

      let anio = new Date().getFullYear();
      let mes  = new Date().getMonth();
      let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+mes.toString()+anio.toString();
      
      this.modelCrono = 
      {
        "codcrono":           codigoCrono,
        "codusertecnic":      tecnico.codusertecnic,
        "codagencia":         this.draggedItem.codagencia,
        "observacion":        null,
        "feccrea":            new Date(),
        "codusercreacrono":   xuser,
        "semanainicio":       0,
        "dia":                Number(diames.numero),
        "mes":                this.mes,
        "anio":               this.anioactual,
        "fechamantenimiento": (this.mes)+'-'+1+'-'+this.anioactual,
        "maquinasmanuales":   this.draggedItem.cantidadMaqIngre,
        "Codlocalidad":       this.idLocalidad,
        "Estado":             0
      }

      const dia = diames.numero;
      const diaMes = this.dismes.find((d: any) => d.numero === dia);
      if (diaMes) {
        const tecnicoEnDia = diaMes.tecnicos.find((t: any) => t.codusertecnic === tecnico.codusertecnic);
        if (tecnicoEnDia) {
          tecnicoEnDia.cronograma.push(this.draggedItem);
        }
      }
      this.guardarCrono( this.modelCrono, tecnico.nombre + ' ' + tecnico.apellido );
    }
  }  

  guardarCrono( modelCrono:any [], tecnico:string ) {
    this._show_spinner = true;
    this.crono.guardarCronos(modelCrono).subscribe (
      {
        next: (x) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'success',
                       title: 'Trabajo asignado al técnico: ' + tecnico+'.',
                       text: 'Esperando la confirmación del trabajo para cambiar de estado.',
                       timer: 2500  });
        }, error: (e) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'error',
                       title: 'No se ha podido agregar este trabajo al ' + tecnico+'.' });
        }, complete: () => { 
          this._show_spinner = false;
        }
      }
    )
  }
  
  dragEnd = () => {
    /* Limpia el elemento arrastrado 
    después de agregarlo al cronograma */
    this.draggedItem = null;
  }
  
}




@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.dia === filter.dia);
  }
}


