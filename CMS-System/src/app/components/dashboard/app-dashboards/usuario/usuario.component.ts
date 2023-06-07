import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from './services/user.service';
import Swal from 'sweetalert2'
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

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
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})
export class UsuarioComponent implements OnInit {
  _delete_show:             boolean = true;
  public sexoLista:             any = [];
  public provinciaLista:        any = [];
  public estadoCivilLista:      any = [];
  public tipoPersonaLista:      any = [];
  public carrerasLista:         any = [];
  public facultadLista:         any = [];
  public capacidadesLista:      any = [];
  public estadoTrabajadorLista: any = [];
  public cantonLista:           any = [];
  public departamentoLista:     any = [];
  public tipoLista:             any = [];
  public moviLista:             any = [];
  public licenciaLista:         any = [];
  public cargoLista:            any = [];
  _action_butto = 'Crear';
  _show_spinner: boolean = false;
  _icon_button: string = 'add';
  _cancel_button: boolean = false;

  columnHead: any = [ 'edit', 'nombre', 'apellido', 'Cédula', 'Dirección', 'nombreDepartamento', 'nombreCargo', 'nombreProvincia', 'nombreCanton' ];
  public dataSource!: MatTableDataSource<any>;

  @Input() modulo: any = [];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public userForm = new FormGroup({
    Email:              new FormControl(''), 
    Nombre:             new FormControl(''), 
    Apellido:           new FormControl(''), 
    Cedula:             new FormControl(''), 
    Cargo:              new FormControl(''), 
    Contrasenia:        new FormControl(''), 
    Estado:             new FormControl(''), 
    Edad:               new FormControl(''), 
    Tipo:               new FormControl(''), 
    Movilidad:          new FormControl(''), 
    Codcaracteristicas: new FormControl(''), 
    CodProvincia:       new FormControl(''), 
    CodCanton:          new FormControl(''),
    CodSexo :           new FormControl(''),
    CodEstadoCivil:     new FormControl(''),
    CodDepartamento:    new FormControl(''),
    CodLicencia:        new FormControl(''),
    Telf:               new FormControl(''),
    Direccion:          new FormControl(''),
  });

  constructor( private DataMaster: SharedService, private us: UserService ) { }
  ccia: any;
  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerUsuario();
    this.validatePersonal();
        // Provincia  
        this.getDataMaster('PRV00');
        // Estado Civil
        this.getDataMaster('R02');
        // Estado del trabajador
        this.getDataMaster('R07');
        // Sexo
        this.getDataMaster('C04');
        // Tipo de persona
        this.getDataMaster('TP01');
        //capacidades
        this.getDataMaster('CPAD');
        //departamento
        this.getDataMaster('008');
        //cargo
        this.getDataMaster('R03');
        //tipo de cuenta
        this.getDataMaster('R20');
        //Movilidad
        this.getDataMaster('MOVI');
        //Licencia
        this.getDataMaster('LIC');
  }

  validatePersonal() {

    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }

  }

  onSubmit() {
    
    switch(this._action_butto) {
      case 'Crear':
        this.guardarUsuario();
        break;
      case 'Actualizar':
        this.editarUsuario();
        break;
    }

  }

    getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (Data) => {

        switch(cod) {
          case 'R02':
            this.estadoCivilLista = Data;
            break;
          case 'PRV00':
            this.provinciaLista = Data;
            console.warn(this.provinciaLista);
            break;
          case 'C04':
            this.sexoLista = Data;
            break;
          case 'TP01':
            this.tipoPersonaLista = Data;
            break;
          case 'UG01':
            this.carrerasLista = Data;
            break;
          case 'UG00':
            this.facultadLista = Data;
            break;
          case 'CPAD':
            this.capacidadesLista = Data;
            break;
          case 'R07':
            this.estadoTrabajadorLista = Data;
            console.warn(this.estadoTrabajadorLista);
            break;
          case '008':
            this.departamentoLista = Data;
            break;
          case 'R03':
            this.cargoLista = Data;
            break;
          case 'R20':
            this.tipoLista = Data;
            break;
          case 'MOVI':
            this.moviLista = Data;
            break;
          case 'LIC':
            this.licenciaLista = Data;
            break;
        }
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getCantones() {
    this.DataMaster.getDataMaster(this.userForm.controls['CodProvincia'].value).subscribe({
      next: (cantones) => {
        this.cantonLista = cantones;
        console.warn( this.cantonLista );
      }, 
      error: (e) => {
        console.error(e);
      }
    })
  }

  public modeluser: any = []
  guardarUsuario() {

    if( this.userForm.controls['Nombre'].value == '' || this.userForm.controls['Nombre'].value == undefined || this.userForm.controls['Nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.userForm.controls['Apellido'].value == '' || this.userForm.controls['Apellido'].value == undefined || this.userForm.controls['Apellido'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Apellido no puede ir vacío' })
    else if( this.userForm.controls['Contrasenia'].value == '' || this.userForm.controls['Contrasenia'].value == undefined || this.userForm.controls['Contrasenia'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Contrasenia no puede ir vacío' })
    else if( this.userForm.controls['Estado'].value == '' || this.userForm.controls['Estado'].value == undefined || this.userForm.controls['Estado'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Estado no puede ir vacío' })
    else if( this.userForm.controls['CodDepartamento'].value == '' || this.userForm.controls['CodDepartamento'].value == undefined || this.userForm.controls['CodDepartamento'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes ubicar el usuario al departamento que corresponde', timer: 3000 })
    else if( this.userForm.controls['Tipo'].value == '' || this.userForm.controls['Tipo'].value == undefined || this.userForm.controls['Tipo'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes proporcionar el tipo de cuenta que tendrá este usuario por temas de permisos', timer: 3000 })
    else {
    
    const name = this.userForm.controls['Nombre'].value.replace(' ', '_').slice(0,6);
    const token: string = 'US-'+name+'-'+this.DataMaster.generateRandomString(10);
    
    this.modeluser ={
      "Coduser": token, 
      "Email":              this.userForm.controls['Email'].value, 
      "Nombre":             this.userForm.controls['Nombre'].value, 
      "Apellido":           this.userForm.controls['Apellido'].value, 
      "Cedula":             this.userForm.controls['Cedula'].value, 
      "Cargo":              this.userForm.controls['Cargo'].value,
      "Contrasenia":        this.userForm.controls['Contrasenia'].value, 
      "Estado":             this.userForm.controls['Estado'].value, 
      "Edad":               this.userForm.controls['Edad'].value, 
      "Tipo":               this.userForm.controls['Tipo'].value, 
      "Movilidad":          this.userForm.controls['Movilidad'].value, 
      "Codcaracteristicas": this.userForm.controls['Codcaracteristicas'].value, 
      "Valoracion": 0,  
      "CodProvincia":       this.userForm.controls['CodProvincia'].value, 
      "CodCanton":          this.userForm.controls['CodCanton'].value, 
      "CodSexo":            this.userForm.controls['CodSexo'].value, 
      "CodEstadoCivil":     this.userForm.controls['CodEstadoCivil'].value, 
      "CodDepartamento":    this.userForm.controls['CodDepartamento'].value, 
      "CodLicencia":        this.userForm.controls['CodLicencia'].value, 
      "Telf":               this.userForm.controls['Telf'].value, 
      "Direccion":          this.userForm.controls['Direccion'].value,
      "CodCia": this.ccia
      
    }

    this._show_spinner = true;
    this.us.guardarUsuarios(this.modeluser).subscribe({
      next: (x) => {
        Toast.fire({
          icon: 'success',
          title: 'Usuario agregado correctamente',
          timer: 2000,
          position: 'center'          
        })
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No hemos podido guardar',
          timer: 1500,
          position: 'top-end'          
        })
        this._show_spinner = false;
      }, complete: () => {
        this.crearCuenta(token, this.userForm.controls['Tipo'].value);
        this.obtenerUsuario()
        this.limpiar();
      }
    })

  }
  }

  crearCuenta(coduser: string, tipo: string) {

    this.us.crearCuentas( coduser, this.ccia, tipo ).subscribe({
      next: (x) => {
        Toast.fire({
          icon: 'success',
          title: 'Cuenta creada',
          timer: 1500,
          position: 'top-end'          
        })
      }, error: (e) => {
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido crear la cuenta',
          timer: 1500,
          position: 'top-end'          
        })
      }
    })
  }

  listUsuarios:any = [];
  obtenerUsuario() {
    this._show_spinner = true;
    this.us.obtenerUsuarios(this.ccia).subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
        console.warn(this.listUsuarios);
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },complete: () => {
        this.dataSource = new MatTableDataSource(this.listUsuarios);
        this.dataSource.paginator = this.paginator;
        this._show_spinner = false;
      }
    })
  }
  
  codUserCatch: string = '';
  catchData(data: any) {

    console.warn(data);

    this.userForm.controls['Email'].setValue(data.email.trim());
    this.userForm.controls['Nombre'].setValue(data.nombre.trim());
    this.userForm.controls['Apellido'].setValue(data.apellido.trim());
    this.userForm.controls['Cedula'].setValue(data.cedula.trim());
    this.userForm.controls['Cargo'].setValue(data.cargo.trim());
    this.userForm.controls['Contrasenia'].setValue(data.contrasenia.trim());
    this.userForm.controls['Estado'].setValue(data.estado.trim());
    this.userForm.controls['Edad'].setValue(data.edad);
    this.userForm.controls['Tipo'].setValue(data.tipo.trim());
    this.userForm.controls['Movilidad'].setValue(data.movilidad.trim());
    this.userForm.controls['Codcaracteristicas'].setValue(data.codcaracteristicas.trim());
    this.userForm.controls['CodProvincia'].setValue(data.codProvincia.trim());
    this.getCantones();
    this.userForm.controls['CodCanton'].setValue(data.codCanton.trim());
    this.userForm.controls['CodSexo'].setValue(data.codSexo.trim());
    this.userForm.controls['CodEstadoCivil'].setValue(data.codEstadoCivil.trim());
    this.userForm.controls['CodDepartamento'].setValue(data.codDepartamento.trim());
    this.userForm.controls['CodLicencia'].setValue(data.codLicencia.trim());
    this.userForm.controls['Telf'].setValue(data.telf.trim());
    this.userForm.controls['Direccion'].setValue(data.direccion.trim());
    this._action_butto = 'Actualizar';
    this._icon_button = 'sync_alt';
    this._cancel_button = true; 
    this.codUserCatch = data.coduser;
  }

  editarUsuario() {

    if( this.userForm.controls['Nombre'].value == '' || this.userForm.controls['Nombre'].value == undefined || this.userForm.controls['Nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.userForm.controls['Apellido'].value == '' || this.userForm.controls['Apellido'].value == undefined || this.userForm.controls['Apellido'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Apellido no puede ir vacío' })
    else if( this.userForm.controls['Contrasenia'].value == '' || this.userForm.controls['Contrasenia'].value == undefined || this.userForm.controls['Contrasenia'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Contrasenia no puede ir vacío' })
    else if( this.userForm.controls['Estado'].value == '' || this.userForm.controls['Estado'].value == undefined || this.userForm.controls['Estado'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Estado no puede ir vacío' })
    else if( this.userForm.controls['CodDepartamento'].value == '' || this.userForm.controls['CodDepartamento'].value == undefined || this.userForm.controls['CodDepartamento'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes ubicar el usuario al departamento que corresponde', timer: 3000 })
    else if( this.userForm.controls['Tipo'].value == '' || this.userForm.controls['Tipo'].value == undefined || this.userForm.controls['Tipo'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes proporcionar el tipo de cuenta que tendrá este usuario por temas de permisos', timer: 3000 })
    else {
    
    
      this.modeluser ={
      "Coduser":            this.codUserCatch, 
      "Email":              this.userForm.controls['Email'].value, 
      "Nombre":             this.userForm.controls['Nombre'].value, 
      "Apellido":           this.userForm.controls['Apellido'].value, 
      "Cedula":             this.userForm.controls['Cedula'].value, 
      "Cargo":              this.userForm.controls['Cargo'].value,
      "Contrasenia":        this.userForm.controls['Contrasenia'].value, 
      "Estado":             this.userForm.controls['Estado'].value, 
      "Edad":               this.userForm.controls['Edad'].value, 
      "Tipo":               this.userForm.controls['Tipo'].value, 
      "Movilidad":          this.userForm.controls['Movilidad'].value, 
      "Codcaracteristicas": this.userForm.controls['Codcaracteristicas'].value, 
      "Valoracion": 0,  
      "CodProvincia":       this.userForm.controls['CodProvincia'].value, 
      "CodCanton":          this.userForm.controls['CodCanton'].value, 
      "CodSexo":            this.userForm.controls['CodSexo'].value, 
      "CodEstadoCivil":     this.userForm.controls['CodEstadoCivil'].value, 
      "CodDepartamento":    this.userForm.controls['CodDepartamento'].value, 
      "CodLicencia":        this.userForm.controls['CodLicencia'].value, 
      "Telf":               this.userForm.controls['Telf'].value, 
      "Direccion":          this.userForm.controls['Direccion'].value,
      "CodCia": this.ccia
      
    }
    
    this._show_spinner = true;
    this.us.editarUsuario( this.codUserCatch, this.modeluser).subscribe({
      next: (x) => {
        Toast.fire({
          icon: 'success',
          title: 'Usuario editado correctamente',
          timer: 2000,
          position: 'center'          
        })
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No hemos podido editar',
          timer: 1500,
          position: 'top-end'          
        })
        this._show_spinner = false;
      }, complete: () => {
        this.obtenerUsuario()
        this.limpiar();
        console.warn(this.userForm.controls['Tipo'].value);
        // this.crearCuenta();
      }
    })

  }

  }

  eliminarUsuario(data:any) {
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
        this.us.eliminarUsuario( data.coduser, this.ccia ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Usuario eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar el usuario',
              'error'
            )
          }, complete: () => {
            this.obtenerUsuario();
          } 
        })
      }
    })
    

  }

  limpiar() {
    this.userForm.controls['Email'].setValue('');
    this.userForm.controls['Nombre'].setValue('');
    this.userForm.controls['Apellido'].setValue('');
    this.userForm.controls['Cedula'].setValue('');
    this.userForm.controls['Cargo'].setValue('');
    this.userForm.controls['Contrasenia'].setValue('');
    this.userForm.controls['Estado'].setValue('');
    this.userForm.controls['Edad'].setValue('');
    this.userForm.controls['Tipo'].setValue('');
    this.userForm.controls['Movilidad'].setValue('');
    this.userForm.controls['Codcaracteristicas'].setValue('');
    this.userForm.controls['CodProvincia'].setValue('');
    this.userForm.controls['CodCanton'].setValue('');
    this.userForm.controls['CodSexo'].setValue('');
    this.userForm.controls['CodEstadoCivil'].setValue('');
    this.userForm.controls['CodDepartamento'].setValue('');
    this.userForm.controls['CodLicencia'].setValue('');
    this.userForm.controls['Telf'].setValue('');
    this.userForm.controls['Direccion'].setValue('');
    this._action_butto = 'Crear';
    this._icon_button = 'add';
    this._cancel_button = false;
  }

}
