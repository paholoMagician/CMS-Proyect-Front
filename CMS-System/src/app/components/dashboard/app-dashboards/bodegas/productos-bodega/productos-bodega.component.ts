import { Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';


import Swal from 'sweetalert2'
import { MaquinariaService } from '../../maquinaria/services/maquinaria.service';
import { CrearBodegasService } from '../crear-bodegas/services/crear-bodegas.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductosBodegaService } from './services/productos-bodega.service';
import { MatMenuTrigger } from '@angular/material/menu';

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
  selector: 'app-productos-bodega',
  templateUrl: './productos-bodega.component.html',
  styleUrls: ['./productos-bodega.component.scss']
})


export class ProductosBodegaComponent implements OnInit {
  selectedOption: any;
  ccia:               any;
  _show_spinner:      boolean = false;
  _cancel_button:     boolean = false;
  _icon_button:       string  = 'add';
  _action_butto:      string  = 'Crear';
  maquinariaLista:    any = [];
  filteredBodegas:    any = [];
  searchTerm: string = '';
  searchMaqTerm: string = '';
  listBodegas: any = [];
  _IMGE:any;
  _boxa: boolean = true;
  _view_details_palets: boolean = false;

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  @ViewChild('myMenu')
  myMenu!: ElementRef;

  @ViewChild('myTriggers')
  myTriggers!: QueryList<MatMenuTrigger>;


  maquinabodegaForm = new FormGroup({
    nombre: new FormControl(''),    
  })

  constructor( private maqbodega: ProductosBodegaService, private maquinaria: MaquinariaService, private bodega: CrearBodegasService) { }

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerMaquinaria(1);
    this.obtenerBodegas();
  }

  selectViewState: number = 1;
  selectTypeVieew(select:number) {
    this.selectViewState = select;
    this.obtenerMaquinaria(this.selectViewState);
  }

  url_img: string = '../../../../../../assets/bodega.png';

  
  obtenerBodegas() {   

    this.bodega.obtenerBodegas(this.ccia).subscribe({
      next:(bodegas) => {
        this.listBodegas = bodegas;
        // console.log(this.listBodegas);
        this.listBodegas.filter((element:any)=>{
          const array = {
              "cantidadItems": element.cantidadItems,
              "id": element.id,
              "nombrebodega": element.nombrebodega,
              "descripcion": element.descripcion,
              "fecrea": element.fecrea,
              "codusercrea": element.codusercrea,
              "ccia": element.ccia,
              "url": '../../../../../../assets/bodega_full.png'
          }

          if( element.cantidadItems == 0 ) {
            element.url = '../../../../../../assets/bodega_vacia.png';
          }

          this.filteredBodegas.push(array);

        })

        console.log( this.filteredBodegas )

        // this.filteredBodegas = bodegas;
      }
    })
  }

  limpiar() {;
    // this.maquinabodegaForm.controls['nombre'].setValue(0);
  }

  actualizarCantidadItems(codbodega:number) {

    this.filteredBodegas.filter( (element:any) => {

        if( element.id == codbodega ) {
          element.cantidadItems += 1;
        }
        else if ( element.id != codbodega ) {
          element.cantidadItems -= 1;
        }

    })

  }


  filterBodegas() {
    if (this.searchTerm) {
      this.filteredBodegas = this.listBodegas.filter((bodega:any) =>
        bodega.nombrebodega.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bodega.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredBodegas = this.listBodegas;
    }
  }



  _show_img: boolean = false;
  _show_table: boolean = false;
  obtenerMaquinaria(option:number) {
    this._show_spinner = true;

    if( option == 0 ) {
      this._show_table = false;
      this._show_img = true
    }
    else {
      this._show_table = true;
      this._show_img = false
    };

    this.maquinaria.ObtenerMaquinasSinBodega(this.ccia, option).subscribe({
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
        if (this.maquinariaLista.length == 0) this.detalle = 'Actualmente todos los items estan asignados a sus respectivas bodegas';
        else this.detalle = 'Items restantes por asignar: ' + (this.maquinariaLista.length).toString()
      }
    })
  }
  _btn_add: boolean = true;
  nombodega: string = '';
  validationBodehaExist() {
    let data = this.maquinabodegaForm.controls['nombre'].value;
    this.codBodega = data.id;
    this.nombodega = data.nombrebodega;
    this._btn_add = false;
  }
  

  modelItemBodega: any = [];
  codBodega: number = 0;
  detalle: string = '';
  guardarAsignacion(data:any) {

    if ( this.codBodega == 0 ) {
      Swal.fire(
        'Bodega sin seleccionar',
        'El item se puede agregar por que no has seleccionado una bodega a donde transferir.',
        'warning'
      )
    }
    else {
      let xuser: any = sessionStorage.getItem('UserCod');
      this.modelItemBodega = {
        codmaquinaria: data.codmaquina,
        codbodega:     this.codBodega,
        fecrea:        new Date(),
        coduser:       xuser
      }

      setTimeout(()=>{
        this.obtenerAnimacion('contain'+this.codBodega);
      },500);

      this.maqbodega.guardarItemBodega(this.modelItemBodega).subscribe({
        next: (x) => {

          Toast.fire({
            icon: 'success',
            title: 'Item: '+data.nombremaquina+' agregada'
          })

        },error: (e) => {
          console.error(e);
          Swal.fire(
            'Opps!',
            'El item no se ha podido guardar',
            'error'
          )
        },complete: () => { 
          this.obtenerMaquinaria(this.selectViewState);
          this.obtenerBodegas();
          this.limpiar();
        }
      })
    }
  }

  filterMaquinariasBodegas() {
    
    console.warn(this.searchMaqTerm);

    if (this.searchMaqTerm) {
      this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost.filter((maquina:any) =>
          maquina.nombremaquina.toLowerCase()
                 .includes(this.searchMaqTerm.toLowerCase()) ||
          maquina.modelo.toLowerCase()
                 .includes(this.searchMaqTerm.toLowerCase()) ||
          maquina.nserie.toLowerCase()
                 .includes(this.searchMaqTerm.toLowerCase()) ||
          maquina.tipoMaquinas.toLowerCase().includes(this.searchMaqTerm.toLowerCase())
      );
    } else {
      this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost;
    }
  }

  eliminarItemBodega(data:any) {
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
        // this.listaMaquinaBodegasGhost = [];
        // this.listaMaquinaBodegas = [];
        this.maqbodega.eliminarItemBodega( data.codmaquinariabodega ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Item: '+ data.nombremaquina +' eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar este item',
              'error'
            )
          }, complete: () => {
            this.obtenerItems();
            // this.actualizarCantidadItems(this.codBodega)
            this.obtenerMaquinaria(this.selectViewState);
            this.obtenerBodegas();
            this.limpiar();
          } 
        })
      }
    })
  }

  obtenerAnimacion(id:any) {
    let a = <HTMLDivElement> document.getElementById(id) ;
    // console.warn(a);

    const c: any = document.createElement('div');
    c.setAttribute('class', 'img-caja');
    c.style.width     = '60px';
    c.style.height    = '60px';
    c.style.animation = 'ease-in 1.5s 1';
    c.style.animationName = 'animatedcaja';
    c.style.position = 'absolute';
    c.style.transform = 'translateX(40px)';
    c.style.transform = 'scale(0)';
    c.style.top = '158px';
    c.style.left = '60px';
    
    a.appendChild(c);
    const i: any = document.createElement('img');
    i.setAttribute('src', '../../../../../../assets/palets.png');
    i.setAttribute('width', '100%');
    c.appendChild(i);
    setTimeout(() => {
      c.transform = 'translateX(40px)';
      c.transform = 'scale(0)';
      c.opacity   = '0';
      c.removeChild(i);
      a.removeChild(c);
    }, 1500);


  }

  listaMaquinaBodegasGhost: any = [];
  listaMaquinaBodegas: any = [];
  _width_boxb: string = '50%';
  _img_bodegas: boolean = true;
  _view_palets: boolean = false;
  obtenerItems() {

    this._boxa                    = false;
    this._width_boxb              = 'w-100';
    this._img_bodegas             = false;
    this._view_palets             = true;
    this.listaMaquinaBodegasGhost = [];
    this.listaMaquinaBodegas      = [];
    let data = this.maquinabodegaForm.controls['nombre'].value
    this.maqbodega.obtenerItemsBodega( data.id ).subscribe({
      
      next: (itemsBodega) => {        
        this.listaMaquinaBodegasGhost = itemsBodega;
        console.warn('listaMaquinaBodegasGhost');
        console.warn(this.listaMaquinaBodegasGhost);
        this.listaMaquinaBodegasGhost.filter( (element:any) => {

          let array = {            
              "nserie":               element.nserie,
              "modelo":               element.modelo,
              "nombremaquina":        element.nombremaquina,
              "tipoMaquinas":         element.tipoMaquinas,
              "codmaquinaria":        element.codmaquinaria,
              "codbodega":            element.codbodega,
              "fecrea":               element.fecre,
              "codmaquinariabodega":  element.codmaquinariabodega,
              "coduser":              element.coduser,
              "menuAbierto":          false
          }

          this.listaMaquinaBodegas.push(array);

        }) 

        console.warn(this.listaMaquinaBodegas);

      }
    })
  }

  codmaquinaria: string = '';
  openMenu(event: MouseEvent, item: any): void {
    event.preventDefault();
    
    console.log( item )
    this.codmaquinaria = item.codmaquinaria
    console.log( this.codmaquinaria );
    // Cerrar los menús desplegables de los demás elementos
    this.listaMaquinaBodegas.forEach((elemento:any) => {

      if (elemento !== item) {
        elemento.menuAbierto = false;
      }

    });
    
    item.menuAbierto = true;
    this.contextMenu.openMenu();

  }

  listMaquinaUnit: any = [];
  verDetallePalets(option:number) {

    switch(option) {
      case 1:
        this._view_details_palets = true;
        this.maquinaria.ObtenerMaquinaUnit( this.codmaquinaria, this.ccia ).subscribe({
          next:(maquina) => {
            this.listMaquinaUnit = maquina;
            console.log(this.listMaquinaUnit);
          }
        })
        break;
      case 2:
        console.log('Cerrando')
        this._view_details_palets = false;
        break;
    }
  }

  onSubmit() {}

}
