import { Component, OnInit } from '@angular/core';


import Swal from 'sweetalert2'
import { MaquinariaService } from '../../maquinaria/services/maquinaria.service';
import { CrearBodegasService } from '../crear-bodegas/services/crear-bodegas.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductosBodegaService } from './services/productos-bodega.service';

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

  ccia:               any;
  _show_spinner:      boolean = false;
  _cancel_button:     boolean = false;
  _icon_button:       string  = 'add';
  _action_butto:      string  = 'Crear';
  maquinariaLista:    any = [];
  filteredBodegas:    any = [];
  searchTerm: string = '';
  listBodegas: any = [];
  _IMGE:any;

  maquinabodegaForm = new FormGroup({
    nombre: new FormControl(''),    
  })

  constructor( private maqbodega: ProductosBodegaService, private maquinaria: MaquinariaService, private bodega: CrearBodegasService) { }

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerMaquinaria();
    this.obtenerBodegas();
  }

  obtenerBodegas() {
    this.bodega.obtenerBodegas(this.ccia).subscribe({
      next:(bodegas) => {
        this.listBodegas = bodegas;
        this.filteredBodegas = bodegas;
        console.log(this.listBodegas);
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

  obtenerMaquinaria() {
    this._show_spinner = true;
    this.maquinaria.obtenerMaquinariaIMG().subscribe({
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
        // this.dataSource = new MatTableDataSource(this.maquinariaLista);
        // this.dataSource.paginator = this.paginator;
      }
    })
  }
  _btn_add: boolean = true;
  validationBodehaExist() {
    this.codBodega = this.maquinabodegaForm.controls['nombre'].value;
    console.log(this.codBodega);
    this.obtenerItems(this.codBodega);
    this._btn_add = false;
  }

  modelItemBodega: any = [];
  codBodega: number = 0;
  guardarAgnacion(data:any) {
    let xuser: any = sessionStorage.getItem('UserCod');
    this.modelItemBodega = {
      codmaquinaria: data.codmaquina,
      codbodega:     this.codBodega,
      fecrea:        new Date(),
      coduser:       xuser
    }

    this.maqbodega.guardarItemBodega(this.modelItemBodega).subscribe({
      next: (x) => {
        Swal.fire(
          'Item: '+data.nombremaquina+' agregada',
          'El item se ha guardado con éxito',
          'success'
        )
      },error: (e) => {
        console.error(e);
        Swal.fire(
          'Opps!',
          'El item no se ha podido guardar',
          'error'
        )
      },complete: () => {
        this.obtenerItems(this.codBodega);
      }
    })

  }

  eliminarItemBodega(data:any) {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible u podría provocar perdida de datos en otros procesos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;  
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
            this.obtenerItems(this.codBodega);
          } 
        })
      }
    })
  }

  listaMaquinaBodegas: any = [];
  obtenerItems(id:number) {
    this.maqbodega.obtenerItemsBodega(id).subscribe({
      next: (itemsBodega) => {
        this.listaMaquinaBodegas = itemsBodega;
        console.warn(this.listaMaquinaBodegas);
      }
    })
  }

  onSubmit() {}

}
