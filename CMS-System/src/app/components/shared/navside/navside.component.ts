import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import Swal from 'sweetalert2'
import { LoginService } from '../../login/services/login.service';
import { NavsideService } from './services/navside.service';
import { ImagecontrolService } from '../image-control/services/imagecontrol.service';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export interface Modulo {
  nombre: string;
  icono: string;
  permiso: string;
}

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrls: ['./navside.component.scss']
})
export class NavsideComponent implements OnInit {
  _show_spinner:      boolean = false; 
  public modulosLista: any        = [];
  public _username:    any        = '';
  public _IMGE:        any;
  public codUser:      any        = '';
  _tipo_persona:       string     = '';
  moduleName: boolean = true;
  _fontSize: string = '15pt';
  _width: string = '290px';
  _width_navside: string = '300px';
  _user: boolean = true;
  _icon: string = 'chevron_left';

  @Output() modulo: EventEmitter<Modulo> = new EventEmitter<Modulo>();

  constructor( private validate: LoginService, public Shared: NavsideService, private fileserv: ImagecontrolService ) { }
  
  ngOnInit(): void {
    this.getModulos();  
  }

  getModulos() {    
    this._show_spinner = true;
    this._username = sessionStorage.getItem('UserName')?.toUpperCase();
    this.codUser = sessionStorage.getItem('UserCod');
    this.Shared.getModulos( this.codUser ).subscribe(
      {
        next: (modulos) => {
          this.modulosLista = modulos;
        },
        error: (e) => {
          console.error(e)
          this._show_spinner = false;
        },
        complete: () => {
          // console.log(this.modulosLista);
          // this.getUser(this.codUser);
          let x: any = localStorage.getItem('imgperfil'); 
          if( x == undefined || x == null || x == '' ) {
            // alert('consumiremos la api')
            this.obtenerImagen(this.codUser, 'Perfil'); 
          }
          else {
            // alert('ya tienes una imagen yano consumiremos la api')
            this._IMGE = localStorage.getItem('imgperfil');
          }
          
          this._show_spinner = false;
        }
      }
    )
  }

  data: boolean = true;
  constrolNavside() {
    let x = document.getElementById('btnsplit') as HTMLDivElement;
    switch( this.data ) {
      case true:
        this.data = false;
        this.moduleName = false;
        this._fontSize = '20pt';
        this._width = '40px';
        this._width_navside = '100px';
        this._user = false; 
        this._icon = 'chevron_right';
        x.style.animationName = 'btnMoveLeft';
        x.style.transform = 'translate(-200px)'
        break;
      case false:
        this.data = true;
        this.moduleName = true;
        this._fontSize = '14pt';
        this._width = '';
        this._width_navside = '300px';
        this._user = true; 
        this._icon = 'chevron_left';
        x.style.animationName = 'btnMoveRight';
        x.style.transform = 'translate(0px)'
        break;
    }

  }
  closeSession() {
    this.validate.closeSession();
  }

  botonClick(data: any) {

    let modulo: Modulo = {
      nombre: data.moduleName,
      icono: data.icon,
      permiso: data.permisos
    }

    console.log('Desde navside: ' + data.moduleName)
    this.modulo.emit(modulo)
  }


  
  imgList: any = [];
  obtenerImagen(codBinding:string, tipo:string) {
    this._show_spinner = true;
    let codm : any = codBinding;

    console.warn(codm)

    this.fileserv.obtenerImagenCodBinding('IMG-'+codm, tipo).subscribe({
      next: (img) => {
        this.imgList = img;
        // console.log('this.imgList visto desde los modulos')
        // console.log(this.imgList)
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {        
        this.imgList.filter( (element:any) => {
          if(element.codentidad == 'IMG-'+codm) {
            this._IMGE = element.imagen;
            localStorage.setItem('imgperfil', this._IMGE);
          }
        })
        this._show_spinner = false; 
      }
    })
  }

}
