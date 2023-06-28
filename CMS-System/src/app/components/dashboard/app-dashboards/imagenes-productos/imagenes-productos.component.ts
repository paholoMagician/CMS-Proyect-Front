import { Component, Input, OnInit } from '@angular/core';
import { ImagecontrolService } from 'src/app/components/shared/image-control/services/imagecontrol.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import Swal from 'sweetalert2'
import { MaquinariaService } from '../maquinaria/services/maquinaria.service';

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
  selector: 'app-imagenes-productos',
  templateUrl: './imagenes-productos.component.html',
  styleUrls: ['./imagenes-productos.component.scss']
})
export class ImagenesProductosComponent implements OnInit {
  _IMGE:any;
  _show_spinner: boolean = false;
  @Input() modulo: any = [];
  tipoMaquinaLista: any = [];
  maquinariaModel: any = [];
  _view_grupo: boolean= false;
  elementoActivo: any = null;
  modeloActivo:   any = null;
  marcaActiva:    any = null;
  grupolista: any = []
  public file!: File;
  constructor( private DataMaster: SharedService, 
               private fileserv: ImagecontrolService,
               private maq: MaquinariaService ) { }

  ngOnInit(): void {   
    this.getDataMaster('MQT');
  }

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

  imagenModel: any = [];
  codigoMaquina: string = '';
  guardarImagen() {

    let token = 'IMG-'+this.codigoMaquina.trim();

    this.imagenModel = {
      codentidad: token,
      imagen:    this._IMGE,
      tipo:      'Maquinaria'
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
      // if(this.datalisten.modulo == 'Maquinaria') {
      //   this._IMGE = '';
      // } else { 
      //   let xuser: any = sessionStorage.getItem('UserCod')
      //   // this.obtenerImagen( xuser, 'Perfil' );
      //   localStorage.setItem('imgperfil', this._IMGE);
      //   this.disbtnimg = true;
      //   this._IMGE = localStorage.getItem('imgperfil');
      // }
    }
  })
}

obtenerImagen() {

  this.fileserv.obtenerImagenCodBinding(this.codec, 'Maquinaria').subscribe({
    next: (imagen:any) => {
      this._IMGE = imagen[0].imagen;
    }
  })

}

  maquimg: any = [];
  guardarImagenProdcuto() {

    this.maquimg = {
      
        "codmaquina": this.codec,
        "img": this._IMGE
      
    }

    this.maq.guardarImagenMaquinaria(this.maquimg).subscribe({
      next: (x) => {
        console.log(x);
        Toast.fire({ icon: 'success', title: 'Imagen generada exitosamente' })
      },
      error: (e) => {
        console.error(e)
        Toast.fire({ icon: 'error', title: 'No se ha podido generar esta imagen' })
      }, complete: () => {

      }
    })

  }

  _validate_img: boolean = true;
  validarImagen() {
    
    if( this._IMGE == '' || this._IMGE == undefined || this._IMGE == null ) this._validate_img = true;
    else this._validate_img = false;

  }

  nameFile: string = '';
  public fileId: any;
  encodeImageFileAsURL() {
    this._show_spinner = true;
    const filesSelected: any = document.getElementById('fileUp2') as HTMLInputElement;
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
        console.log(this._IMGE)
        this.validarImagen()
      };
      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
    }

  }

maquina: string = '';
enviarAlDataListen(data:any) {

  this.maquinariaModel = {
    codtipomaquina: data.codigo.trim(),
    codmaquina: data.nombre,
    modulo: 'maquinaria',
    state: 2
  };

  this.maquina = data.nombre;
  this.codigoMaquina = data.codigo.trim();
  this.getGrupos(this.codigoMaquina);

}


  getGrupos(grupo:string) {
    this.grupolista = [];
    this.sgrupolista = [];
    this._view_grupo = true;
    this.DataMaster.getDataMasterGrupo(grupo.trim()).subscribe(
    {
      next:( grupo ) => {
        this.grupolista = grupo;
        // console.warn(this.grupolista);
      }
    })
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  sgrupolista: any = []
  modelo: string = '';
  getSubgrupos(subgrupo:string) {
    this.modelo = subgrupo;
    this.DataMaster.getDataMasterSubGrupo(this.codigoMaquina, subgrupo.trim()).subscribe({
        next:( sgrupo ) => {
          this.sgrupolista = sgrupo;
          // console.warn(this.sgrupolista);
        }
      }
    )
  }

  codecEntidadImagen: string = '';
  codmarca:any;
  codmodelo:any;
  nombreModelo: any;
  codtipomaquina:any;
  codec: any;
  obtenerCodigos(data:any) {
    this.codtipomaquina = data.codigotipomaq;
    this.codmarca       = data.codmarca;
    this.codmodelo      = data.codmodelo;
    this.nombreModelo   = data.modelo;
    console.log(this.codtipomaquina+'-'+this.codmarca)
    this.codec = this.codtipomaquina.trim()+'-'+this.codmarca.trim()+'-'+this.codmodelo.trim();
    console.log(this.codec)
    return this.codec;
  }

}
