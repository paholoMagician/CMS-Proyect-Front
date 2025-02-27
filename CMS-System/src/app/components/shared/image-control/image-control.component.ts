import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ImagecontrolService } from './services/imagecontrol.service';
import Swal from 'sweetalert2'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SharedService } from '../services/shared.service';

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
  selector: 'app-image-control',
  templateUrl: './image-control.component.html',
  styleUrls: ['./image-control.component.scss']
})
export class ImageControlComponent implements OnInit, OnChanges  {
  public _IMGE:       any;
  public imagenLista: any = [];
  public imagenModel: any = [];
  public file!: File;
  _show_spinner: boolean = false;
  constructor( private fileserv: ImagecontrolService, private DataMaster: SharedService, private sanitizer: DomSanitizer ) { }
  @Input() datalisten: any = [];
  @Input() modulo: any = [];
  
  ngOnInit(): void {
    if( this.datalisten.modulo == 'Perfil' ) {
      let xcoduser: any = sessionStorage.getItem('UserCod');
      this.obtenerImagen( 'IMG-'+xcoduser, 'Perfil');
    }
  }

  showbtnperfil: boolean = false
  tipomaquina: string = '';
  codigoMaquina: string = '';

  disbtnimg: boolean = true;

  ngOnChanges(changes: SimpleChanges) {

    console.warn('DATA EMITTER')
    console.warn(this.datalisten)

    if( changes['datalisten'] ) {
      switch( this.datalisten.modulo ) {
        case 'Maquinaria':
          // alert('Estas accediendo desde Maquinaria');
          if( this.datalisten.state == 1 ) {
            console.warn('Va a guardar la imagen');
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen(this.codigoMaquina, this.tipomaquina );
            this.validateaccion(this.datalisten.accion);
          }
          else if ( this.datalisten.state == 2 ) {
            console.log('Va a leer la imagen');
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen(this.codigoMaquina, this.tipomaquina );
          }
          break;
        case 'Perfil':
          this.showbtnperfil = true;
          if( this.datalisten.state == 1 ) {
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen( this.codigoMaquina, this.tipomaquina );
            this.validateaccion(this.datalisten.accion);
          }
          else if ( this.datalisten.state == 2 ) {
            let xcoduser: any = sessionStorage.getItem('UserCod');
            this.obtenerImagen( xcoduser, 'Perfil' );
          }
          break;
      }
    } 
  }

  validacionHayImagen() {
    if( this.datalisten.modulo == 'Perfil' ) {
      if( this._IMGE == undefined || this._IMGE == null || this._IMGE == ''  ) {
        this.disbtnimg = true;
      }
      else {
        this.disbtnimg = false;
      }
    }
  }


  validateaccion(state:number) {
    switch(state) {
      case 1:
        this.guardarImgFileDB();
        break;
      case 2:
        this.editarImgFileDB();
        break;
      case 3:

        if( this.imgList.length == 0 ) {
          // alert('No hay imagen de perfil de usuario');
          this.guardarImgFileDB();
        } else {
          // alert('Si hay imagen de perfil de usuario');
          this.editarImgFileDB();
        }

        break;
    }
  }

  nameFile: string = '';
  public fileId: any;
  encodeImageFileAsURL() {
    this._show_spinner = true;
    const filesSelected: any = document.getElementById('fileUp') as HTMLInputElement;
    this.fileId = filesSelected.files;
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0];
    let base;
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
      };
      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
        this.validacionHayImagen();
      };
      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
    }

  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  recibirModulo(modulo: any) {}

  uploadServerFile() {
    this.guardarImgFileDB();
    this.fileserv.uploadFile(this.file, this.nameFile).subscribe({
      next: (x) => {
        console.log(x);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
      }
    })  
  
  }

  imgList: any = [];
  url: any;
  // obtenerUrlImagenServer() {
  //   this.fileserv.getImageControl('maquina1').subscribe({
  //     next: (url:any) => {        
  //       this.urlList = url;
  //       this.url = this.sanitizer.bypassSecurityTrustUrl(this.urlList.url+'/maquina1.jpg');        
  //     }
  //   })
  // }
  codEditarImagen: string = '';
  obtenerImagen(codBinding:string, tipo:string) {
    this._show_spinner = true;
    let codm : any = codBinding;
    if( this.datalisten.modulo == 'Maquinaria' ) codm = codBinding.replace('MAQ-','IMG-MAQ-')
    this.fileserv.obtenerImagenCodBinding(codm, tipo).subscribe({
      next: (img) => {
        this.imgList = img;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {        
        this.imgList.filter( (element:any) => {
          if(element.codentidad == codm) {
            this._IMGE = element.imagen;
            this.codEditarImagen = element.codentidad;
          }
        })
        this._show_spinner = false; 
      }
    })
  }


  guardarImgFileDB() {
    this._show_spinner = true;    
    let token: string = '';
    switch(this.datalisten.modulo) {

      case 'Maquinaria':
        // alert('Estas enviando una imagen de maquinaria')
        token = 'IMG-'+this.codigoMaquina.trim();
        this.imagenModel = {
          codentidad: token,
          imagen:    this._IMGE,
          tipo:       this.datalisten.modulo
        }

        // console.log('ESTE ES EL MODELO A GUARDAR');
        console.log(this.imagenModel);

        break;
      case 'Perfil':
        let xcoduser: any = sessionStorage.getItem('UserCod');
        token = 'IMG-'+ xcoduser.trim();
        // alert('Estas enviando una imagen de perfil')
        this.imagenModel = {
          codentidad: token,
          imagen:     this._IMGE,
          tipo:       'Perfil'
        }
        break;

    }
    
    this.fileserv.guardarImgFile( this.imagenModel ).subscribe({
      next: (x) => {
        // console.log('LA IMAGEN GUARDADO')
        this._show_spinner = false;
        Swal.fire(
          'Imagen agregada',
          'Imagen de La máquina se ha guardado con éxito',
          'success'
        ) 
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        if(this.datalisten.modulo == 'Maquinaria') {
          this._IMGE = '';
        } else { 
          let xuser: any = sessionStorage.getItem('UserCod')
          this.obtenerImagen( xuser, 'Perfil' );
          localStorage.setItem('imgperfil', this._IMGE);
          this.disbtnimg = true;
          this._IMGE = localStorage.getItem('imgperfil');
        }
      }
    })
  }


  editarImgFileDB() {
    this._show_spinner = true;

    switch(this.datalisten.modulo) {

      case 'Maquinaria':
        // alert('Estas enviando una imagen de maquinaria')
        this.imagenModel = {
          codentidad: this.codEditarImagen,
          imagen:     this._IMGE,
          tipo:       this.datalisten.modulo
        }
        // console.log('ESTE ES EL MODELO A EDITAR');
        console.log(this.imagenModel);
        break;
        case 'Perfil':
          // alert('Estas enviando una imagen de Perfil')
          this.imagenModel = {
            codentidad: this.codEditarImagen,
            imagen:     this._IMGE,
            tipo:       this.datalisten.modulo
          }
          console.log(this.imagenModel);
        break;

    }

    this.fileserv.editarImagen( this.codEditarImagen, this.imagenModel ).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Imagen agregada',
          'Imagen de La máquina se ha actualizado con éxito',
          'success'
        ) 
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        if(this.datalisten.modulo == 'Maquinaria') {
          this._IMGE = '';
        } else { 
          let xuser: any = sessionStorage.getItem('UserCod');
          // this.obtenerImagen( xuser, 'Perfil' );
          localStorage.setItem('imgperfil', this._IMGE);
          this.disbtnimg = true;
          this._IMGE = localStorage.getItem('imgperfil');
        }
      }
    })
  }

}
