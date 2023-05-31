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
  public _IMGE:        string     = '';
  public imagenLista: any = [];
  public imagenModel: any = [];
  public file!: File;
  _show_spinner: boolean = false;
  constructor( private fileserv: ImagecontrolService, private DataMaster: SharedService, private sanitizer: DomSanitizer ) { }
  @Input() maquinariaDatos: any = [];
  ngOnInit(): void {
    // this.obtenerUrlImagenServer();
    console.warn(this.maquinariaDatos);
  }


  ngOnChanges(changes: SimpleChanges) {
    if( changes['maquinariaDatos'] ) console.log(this.maquinariaDatos); 
  }

  mostrarDatosEnConsola() {
    console.log(this.maquinariaDatos);
  }

  nameFile: string = '';
  public fileId: any;
  encodeImageFileAsURL() {
    this._show_spinner = true;
    //console.log('Cargando imagenes');
    const filesSelected: any = document.getElementById('fileUp') as HTMLInputElement;
    this.fileId = filesSelected.files;
    let s = this.fileId[0].name.split('.');

    this.nameFile = s[0];
    console.log(this.nameFile);
    let base;
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
        // console.log('esta es la base')
        // console.log(base)
      };
      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
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

  urlList: any = [];
  url: any;
  obtenerUrlImagenServer() {

    this.fileserv.getImageControl('maquina1').subscribe({
      next: (url:any) => {        
        this.urlList = url;
        this.url = this.sanitizer.bypassSecurityTrustUrl(this.urlList.url+'/maquina1.jpg');        
      }
    })

  }

  guardarImgFileDB() {
    this._show_spinner = true;
    let tipo: string = 'MAQUINA'

    const token: string = 'IMG-'+tipo.replace(' ', '_')+'-'+this.DataMaster.generateRandomString(15);
    this.imagenModel = {
      codentidad: token,
      imagen:    this._IMGE,
      tipo:       tipo
    }

    this.fileserv.guardarImgFile( this.imagenModel ).subscribe({
      next: (x) => {
        console.log('LA IMAGEN GUARDADO')
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

      }
    })
  }

}
