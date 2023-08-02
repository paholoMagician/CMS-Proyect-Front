import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../usuario/services/user.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { CronogramaService } from '../cronograma/services/cronograma.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog';
import { ModalDetalleCronoComponent } from './modal-detalle-crono/modal-detalle-crono.component';

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


interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-crono-grid',
  templateUrl: './crono-grid.component.html',
  styleUrls: ['./crono-grid.component.scss']
})
export class CronoGridComponent implements OnInit {
  _showMes: boolean = false;
  rep: boolean = false;
  meses: string[] = [ 'enero', 'febrero', 'marzo', 
                      'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 
                      'octubre', 'noviembre', 'diciembre' ];
  _class_btn = 'btn btn-outline-warning';
  _class_btn_2 = 'btn btn-outline-primary';
  filteredCronos: any = []; 
  _data_crono_section: string = 'd-flex flex-column table-responsive w-100 m-2';

  modelCronoBack:  any = [];
  observacion:     string = '';
  opacity_tots: number = 0.8;
  semanainicial:any;
  mes:any;
  dia:any;
  anio:any;
  _multi_agen:boolean = true;
  _multi_tecnic:boolean = false;

  _dis_btn_setts:boolean = true;

  listaClientes:any = [];
  _show_spinner:boolean = false;
  cities: any =[];
  agencia: any = [];
  UsuarioTecnico:any = [];

  filteredusers: any[] = [];
  filteredlocalidad: any[] = [];
  filteredcliente: any[] = [];

  ccia:               any;
  public agenciaForm = new FormGroup({
    codusertecnico:         new FormControl([]),
    codcliente:             new FormControl(''),
    localidad:              new FormControl(''),
    fechamantenimiento:     new FormControl(''),
    observacion:            new FormControl(''),
    codagencia:             new FormControl([]),
    selectedCities:         new FormControl([])
  }
  )

  
  public reporCrono = new FormGroup({
    mantenimientoCompletados:   new FormControl(0),
    tecnicosAsignados:         new FormControl(0)
  })
 
  public diaform = new FormGroup({
    diaCrono:   new FormControl(),
  })
 
  public activateForm = new FormGroup({
    activateCheckAgencia:   new FormControl(),
    activateCheckTecnico:   new FormControl(),
  })

  public valoresform = new FormGroup({
    cantidadCrono:   new FormControl(),
  })
  countries: any[] | undefined;

  selectedCountry: any;

  filteredAgencias: any | undefined;

  constructor(private us: UserService,
    public dialog: MatDialog,
    private client: ClienteService, private crono: CronogramaService,
    private DataMaster: SharedService) { }


  users: any[] = [];
  local: any[] = [];
  clientes: any[] = [];
  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');   
    this.reporCrono.controls['mantenimientoCompletados'].setValue(30);
    this.reporCrono.controls['tecnicosAsignados'].setValue(17);

    this.obtenerLocalidades();

    this.us.obtenerUsuarios(this.ccia).subscribe(
      {
        next: (x: any) => {
          if (Array.isArray(x)) {
            this.UsuarioTecnico = x;
            console.log(this.UsuarioTecnico);

            this.UsuarioTecnico.filter((element:any) => {
              if ( element.tipo == '003' ) {
                let arr = {
                  name: element.nombre + ' ' + element.apellido, code: element.coduser
                }
                this.users.push(arr);
              }
            })
            console.warn(this.users);
          }
        }
      }
    );

    this.obtnClientes();
  

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
        "dia": data.dia,
        "anio": data.anio,
        "fechamantenimiento": data.fechamantenimiento,
        "maquinasmanuales": data.maquinasmanuales,
        "localidad": this.idLocalidad
    }
    
    console.warn(reasignData);

    const dialogRef = this.dialog.open( ModalDetalleCronoComponent, {
      height: '600px',
      width:  '50%',
      data: reasignData, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( result );
      this.obtenerCrono(result.anio, result.mes);

    });


  }


  obtnClientes () {
    
    this.client.obtenerClientes(this.ccia).subscribe({
      next: (x) => {
        if (Array.isArray(x)) {
          this.listaClientes = x;
          console.log(this.listaClientes);

          this.listaClientes.filter((element:any)=>{            
              let arr = {
                name: element.nombre, code: element.codcliente
              }
              this.clientes.push(arr);            
          })
          console.warn(this.clientes);
        }

      }, complete: () => {
        // console.log(this.agenciaForm.controls['codagencia'].value);
      }
    })
  }

  limpiarAgencias() {
    // alert('LIMPIANDO')
    this.agenciaForm.controls['codagencia'].setValue([]);
    // console.warn(this.agenciaForm.controls['codagencia'].value);
  }

  validatesettings() {

    console.log(this.idLocalidad);
    console.log(this.mes);

    if ( (this.idLocalidad == undefined || this.idLocalidad == null) || (this.mes == undefined || this.mes == null) ) {
      this._dis_btn_setts = true;
      // alert('No has seleccionado una localidad');
    }
    else {
      this._dis_btn_setts = false;
    }

  }

  onSubmitTypeCheck(){}

  selectDate( mes:any ) {
    this.mes = mes;
    this.anio = new Date().getFullYear();

    this.validatesettings();

    this.diasdelMes(this.mes+1, this.anio)

    this.obtenerCrono(this.anio, mes+1);
  }

  resultado:any = [];  
  diasdelMes(mes: number, anio: number): any[] {
    // Verifica si el número de mes es válido (entre 1 y 12)
    if (mes < 1 || mes > 12) {
      throw new Error('Número de mes inválido. Debe estar entre 1 y 12.');
    }

    // Validar si el año es bisiesto para febrero
    const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    const diasEnFebrero = esBisiesto ? 29 : 28;

    // Crea una fecha usando el año y el número de mes proporcionados
    const fecha = new Date(anio, mes - 1, 1);

    // Obtiene el número de días en el mes
    let diasEnMes = 31;
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
      diasEnMes = 30;
    } else if (mes === 2) {
      diasEnMes = diasEnFebrero;
    }

    // Crea un arreglo para almacenar los objetos con el formato deseado
    this.resultado = [];

    // Itera por cada día del mes y crea el objeto con el día de la semana y el número del día
    for (let i = 1; i <= diasEnMes; i++) {
      const fechaDia = new Date(anio, mes - 1, i);
      const diaDeSemana = format(fechaDia, 'eeee', { locale: es }); // eeee representa el nombre completo del día de la semana
      const numeroDia = format(fechaDia, 'dd', { locale: es }); // dd representa el día del mes con dos dígitos
      this.resultado.push({ dia: diaDeSemana, numero: numeroDia });
    }

    return this.resultado;
  }


  public valoresSeleccionados: string[] = [];
  _bol_check:boolean= false;
  public onCheckboxChange(numero: number): void {
    const index = this.valoresSeleccionados.indexOf(numero.toString());

    if (index === -1) {
      this.valoresSeleccionados.push(numero.toString());
    } else {
      this.valoresSeleccionados.splice(index, 1);
    }

  }

  codCrono:any;
  modelUnitCrono:any = [];
  capturarIdCrono( model:any ) {

    this.codCrono = model.codcrono;
    let arr = {
      "codcrono":           this.codCrono,
      "codusertecnic":      model.codusertecnic,
      "codagencia":         model.codagencia,
      "observacion":        model.observacion,
      "feccrea":            model.feccrea,
      "codusercreacrono":   model.codusercreacrono,
      "semanainicio":       model.semanainicio,
      "dia":                this.diaform.controls['diaCrono'].value,
      "mes":                model.mes,
      "anio":               model.anio,
      "fechamantenimiento": model.mes+'-' + this.diaform.controls['diaCrono'].value + '-' + model.anio,
      "maquinasmanuales":   model.maquinasmanuales,
      "Codlocalidad":       this.idLocalidad,
      "Estado":             1
    }

    this.modelUnitCrono = arr;

  }

  capturarValorCrono(model:any) {
    this.codCrono = model.codcrono;
    let arr = {
      "codcrono":           this.codCrono,
      "codusertecnic":      model.codusertecnic,
      "codagencia":         model.codagencia,
      "observacion":        model.observacion,
      "feccrea":            model.feccrea,
      "codusercreacrono":   model.codusercreacrono,
      "semanainicio":       model.semanainicio,
      "dia":                model.dia,
      "mes":                model.mes,
      "anio":               model.anio,
      "fechamantenimiento": model.fechamantenimiento,
      "maquinasmanuales":   this.valoresform.controls['cantidadCrono'].value,
      "Codlocalidad":       this.idLocalidad,
      "Estado":             1
    }

    this.modelUnitCrono = arr;

  }

  clean(){
    
    this.diaform    .controls['diaCrono']      .setValue('');
    this.agenciaForm.controls['codcliente']    .setValue('');
    this.agenciaForm.controls['codagencia']    .setValue([]);
    this.agenciaForm.controls['codusertecnico'].setValue([]);
    this.valoresform.controls['cantidadCrono'] .setValue('');
    this.agenciaForm.controls['observacion']   .setValue('');
    this._bol_check           = false;
    this.valoresSeleccionados = [];

  }

  searchTerm: any;
  _sum_filter:boolean = false;
  filterCronos() {
    const searchTerm = this.searchTerm.toLowerCase().trim();  
    // Establecer this.sumatoriaFilter en 0 si searchTerm está vacío
    if (!searchTerm) {
      this.sumatoriaFilter = 0;
      this.filteredCronos = [...this.modelCronoBack];
      this._sum_filter = true;
    } else {
      const searchPrefix = searchTerm.charAt(0);
  
      if (searchPrefix === 'd') {
        const searchValue = searchTerm.substring(1).trim();
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const dia = crono.dia.toString().toLowerCase();
          return dia.includes(searchValue);
        });
      } else if (searchPrefix === 'm') {
        // Filtrar por el campo "maquinasmanuales"
        const searchValue = searchTerm.substring(1).trim();
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const nmaquinas = crono.maquinasmanuales.toString().toLowerCase();
          return nmaquinas.includes(searchValue);
        });
      } else {
        // Filtrar por los campos originales
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const nombreTecnico = crono.nombreTecnico.toLowerCase();
          const codfrecuencia = crono.codfrecuencia.toLowerCase();
          const frecuencia = crono.frecuencia.toLowerCase();
          const nombreCliente = crono.nombreCliente.toLowerCase();
          const nombreAgencia = crono.nombreAgencia.toLowerCase();
  
          return (
            nombreTecnico.includes(searchTerm) || codfrecuencia.includes(searchTerm) ||
            frecuencia.includes(searchTerm)    || nombreCliente.includes(searchTerm) ||
            nombreAgencia.includes(searchTerm)
          );
        });
      }
    }
  
    // Calcular la sumatoria después de aplicar todos los filtros
    this.sumatoriaCronoMaquinasFilter();
  }
  


  ordenarPorDia() {
    this.filteredCronos.sort((a:any, b:any) => a.dia - b.dia);
  }
  
  ordenarAlfabeticamente() {
    this.filteredCronos.sort((a:any, b:any) => a.nombreTecnico.localeCompare(b.nombreTecnico));
  }
  
  restaurarOrdenOriginal() {
    this.filteredCronos = [...this.modelCronoBack];
    this.searchTerm = '';
    this.valoresSeleccionados = [];
  }

  obtenerCrono(anio:any, mes:number) {
    let x = Number(this.idLocalidad.trim());
    this.sumatoriaFilter = 0;
    this.filteredCronos = [];
    // this.agencia = [];
    this.crono.obtenerCronograma(this.ccia, anio, mes, x).subscribe({
        next: (x) => {        
          this.modelCronoBack = x;
          this.filteredCronos = x;
          // console.warn(this.filteredCronos);
        },
        complete: () => {
          this.sumatoriaCronoMaquinas();
          this.clean();
        }
      }
    )
  }

  actualizarCrono() {
    this.crono.editarCrnograma(this.codCrono, this.modelUnitCrono).subscribe({
      next: (x) => {
        console.log('SE ESTA EDITANDO')
        console.log(x)
      },
      error: (e) => {
        // console.error(e)
      },
      complete: () => {
        this.obtenerCrono(this.anio, this.mes+1);
        this.clean();
      }
    })
  }

  idLocalidad: any;
  obtenerLocalidadId(data:any) {
      this.idLocalidad = data;
      console.warn(this.idLocalidad);
      this.validatesettings();
  }

  obtenerCliente() {

    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia).subscribe(
      {

        next: (clientes) => {
          this.listaClientes = clientes;
        },

        error: (e) => {
          console.error(e);
          this._show_spinner = false;
        },

        complete: () => {
          this._show_spinner = false;
        }

      }
    )

  }

  listAgencias: any = [];
  obtenerAgencias() {
      this.client.obtenerAgencias( this.ccia, this.agenciaForm.controls['codcliente'].value.code.trim(),
                                   this.idLocalidad )
                 .subscribe((x) => {
        if (Array.isArray(x)) {
          this.agencia = [];
          this.listAgencias = x;
          this.listAgencias.filter((element:any)=>{            
              let arr = {
                name: element.nombre, code: element.codagencia, nmaquinas: element.cantidadMaquinaAgencia
              }
              this.agencia.push(arr);
          });
        }
      });
  }

  filterAgencia(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.agencia as any[]).length; i++) {
        let agencies = (this.agencia as any[])[i];
        if (agencies.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(agencies);
        }
    }

    this.filteredAgencias = filtered;

    console.log(filtered);
    console.log(this.filteredAgencias);

}

  filterUsuario(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < (this.users as any[]).length; i++) {
      let usuario = (this.users as any[])[i];
      if (usuario.name.toLowerCase().includes(query)) {
        filtered.push(usuario);
      }
    }

    this.filteredusers = filtered;

    console.log(this.filteredusers)

  }



  _conf_crono:boolean  =false;
  x:boolean = true;
  configuracionOn() {

    switch(this.x) {
      case true:
        this._conf_crono = true;
        this._data_crono_section = 'd-flex flex-column table-responsive w-75 m-2'
        this.x = false;
        break;  
      case false:
        this.x = true;
        this._conf_crono = false;
        this._data_crono_section = 'd-flex flex-column table-responsive w-100 m-2'
        break;
    }

  }


  filterLocalidad(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < (this.local as any[]).length; i++) {
      let Localidad = (this.local as any[])[i];
      if (Localidad.name.toLowerCase().includes(query)) {
        filtered.push(Localidad);
      }
    }

    this.filteredlocalidad = filtered;

    console.log(this.filteredlocalidad)

  }


  filterCliente(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query.toLowerCase();
  
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i];
      if (cliente.name.toLowerCase().includes(query)) {
        filtered.push(cliente);
      }
    }
  
    this.filteredcliente = filtered;
    // console.log(this.filteredcliente);
  }


  sumatoria = 0;
  sumatoriaFilter = 0;
  onSubmit() {

    this.guardarCronograma();

  }

  //element.sumatoria
  sumatoriaCronoMaquinas() {

    const agencias:   any = {};
    const duplicados: any = [];
    const unicos:     any = [];
  
    this.modelCronoBack.forEach((element: any) => {
      const codAgencia = element.codagencia;
  
      if (agencias[codAgencia]) {
        console.warn("Duplicado:", element);
        duplicados.push(element);
      } else {
        agencias[codAgencia] = 1;
        unicos.push(element);
      }
    });
  
    this.sumatoria = 0;
    unicos.filter((element:any)=>{
      this.sumatoria += element.maquinasmanuales
    })
    
  }

  sumatoriaCronoMaquinasFilter() {

    let agencias:   any = {};
    let duplicados: any = [];
    let unicos:     any = [];
  
    this.filteredCronos.forEach((element: any) => {
      const codAgencia = element.codagencia;  
      if (agencias[codAgencia]) {
        console.warn("Duplicado:", element);
        duplicados.push(element);
      } else {
        agencias[codAgencia] = 1;
        unicos.push(element);
      }
    });
  
    this.sumatoriaFilter = 0;
    unicos.filter((element:any)=>{
      this.sumatoriaFilter += element.maquinasmanuales
    })
    
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

  modelBack:any = [];
  tecnicoslista:any=[];
  guardarCronograma() {
    const usercrono: any = sessionStorage.getItem('UserCod');
    if ( this.agenciaForm.controls['codcliente'].value == '' || 
         this.agenciaForm.controls['codcliente'].value == undefined || 
         this.agenciaForm.controls['codcliente'].value == null) Toast.fire({ icon: 'warning', title: 'Necesitas escoger un cliente' })
    else if ( this.agenciaForm.controls['codagencia'].value == null ||
              this.agenciaForm.controls['codagencia'].value.length == 0 ||
              this.agenciaForm.controls['codagencia'].value == undefined ) Toast.fire({ icon: 'warning', title: 'Necesitas escoger uan o varias agencias' })
    else if ( this.agenciaForm.controls['codusertecnico'].value.length == 0 ||
              this.agenciaForm.controls['codusertecnico'].value == null ||
              this.agenciaForm.controls['codusertecnico'].value == undefined  ) Toast.fire({ icon: 'warning', title: 'Necesitas escoger un técnico para cubrir esta agencia ' })
    else {

      if( this.activateForm.controls['activateCheckAgencia'].value == null || 
          this.activateForm.controls['activateCheckAgencia'].value == false ) {
        this._show_spinner = true;
        this.modelBack = [];
        let anio = new Date().getFullYear();
        let codUserTecnico = this.agenciaForm.controls['codusertecnico'].value.code;
        let agencias:any[] = this.agenciaForm.controls['codagencia'].value;
        for ( let i = 0; i < this.valoresSeleccionados.length; i++ ) {

            agencias.filter((eleback:any) => {
              let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+anio;
              let arr = {
                "codcrono":           codigoCrono,
                "codusertecnic":      codUserTecnico,
                "codagencia":         eleback.code,
                "observacion":        this.agenciaForm.controls['observacion'].value,
                "feccrea":            new Date(),
                "codusercreacrono":   usercrono,
                "semanainicio":       this.semanainicial,
                "dia":                Number(this.valoresSeleccionados[i]),
                "mes":                this.mes+1,
                "anio":               this.anio,
                "fechamantenimiento": (this.mes+1)+'-'+1+'-'+this.anio,
                "maquinasmanuales":   eleback.nmaquinas,
                "Codlocalidad":       this.idLocalidad,
                "Estado":             1
              }
            
              this.modelBack.push(arr);
            
            })
          }

          this.modelBack.filter((element:any) => {

            this.crono.guardarCronos(element).subscribe({
              next: (x) => {
                this._show_spinner = false;
                Swal.fire(
                  'Guardado con éxito!',
                  'El cronograma ha sido guardado',
                  'success'
                )
              }, error: (e) => {
                this._show_spinner = false;
                Swal.fire(
                  'Oops!',
                  'No se ha podido guardar',
                  'error'
                )
              }, complete: () => {            
                this.obtenerCrono(this.anio, this.mes+1);
                this._bol_check = false;
                this._conf_crono = false;
                this.clean()
              }
            })
          })    
        } else if ( this.activateForm.controls['activateCheckAgencia'].value == true ) {
          let anio = new Date().getFullYear();
          for ( let i = 0; i < this.valoresSeleccionados.length; i++ ) { 
            this.tecnicoslista = this.agenciaForm.controls['codusertecnico'].value;
            this.tecnicoslista.filter( (element:any) => {

              let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+anio.toString();
              let arr = {
                "codcrono":           codigoCrono,
                "codusertecnic":      element.code,
                "codagencia":         this.agenciaForm.controls['codagencia'].value.code,
                "observacion":        this.agenciaForm.controls['observacion'].value,
                "feccrea":            new Date(),
                "codusercreacrono":   usercrono,
                "semanainicio":       this.semanainicial,
                "dia":                Number(this.valoresSeleccionados[i]),
                "mes":                this.mes+1,
                "anio":               this.anio,
                "fechamantenimiento": (this.mes+1)+'-'+1+'-'+this.anio,
                "maquinasmanuales":   this.agenciaForm.controls['codagencia'].value.nmaquinas,
                "Codlocalidad":       this.idLocalidad,
                "Estado":             1
              }

              this.modelBack.push(arr);

            })

        }

        this.modelBack.filter((back:any)=>{
          this.crono.guardarCronos(back).subscribe({
            next: (x) => {
              this._show_spinner = false;
              Swal.fire(
                'Guardado con éxito!',
                'El cronograma ha sido guardado',
                'success'
              )
            }, error: (e) => {
              this._show_spinner = false;
              Swal.fire(
                'Oops!',
                'No se ha podido guardar',
                'error'
              )
            }, complete: () => {            
              this.obtenerCrono(this.anio, this.mes+1);
              this._conf_crono = false;
              this.clean();
            }
          })
        })

        }
      }    
  }

  listadetalleCronoUnit: any = [];
  modelUnitCronoDetalle: any = [];
  resultadosFiltrados: any = [];
  obtenerCronoUnit(codcrono:string) {
    this.crono.obtenerDetalleCronoUnit(1, codcrono).subscribe({
      next: (x) => {
        this.listadetalleCronoUnit = x;
        this.resultadosFiltrados = x;
        console.warn(this.listadetalleCronoUnit);
        this.modelUnitCronoDetalle = this.listadetalleCronoUnit[0];
        console.warn(this.modelUnitCronoDetalle);
      }
    })
  }

  filtroTexto: string = '';
  filtrarElementos() {
    this.resultadosFiltrados = this.listadetalleCronoUnit.filter((item:any) =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombreTipoMaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  kal:boolean = true;
  catchData() {
    
  }
  



}
