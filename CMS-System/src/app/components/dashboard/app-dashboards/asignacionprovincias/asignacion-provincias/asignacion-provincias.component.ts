import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../usuario/services/user.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog';
import { ModalProvicComponent } from '../modal/modal-provic/modal-provic.component';
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
  selector: 'app-asignacion-provincias',
  templateUrl: './asignacion-provincias.component.html',
  styleUrls: ['./asignacion-provincias.component.scss']
})
export class AsignacionProvinciasComponent implements OnInit {
  _show_spinner: boolean = false;
  @Input() modulo: any = [];
  public ccia:any;
  lisTecnicos: any = [];

  columnHead: any = [ 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia', 'provincia' ];
  public dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerUsuario();
  }

  constructor( private DataMaster: SharedService, private us: UserService, public dialog: MatDialog ) {  }

  listUsuarios:any = [];
  obtenerUsuario() {
    this.us.obtenerUsuarios(this.ccia).subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
      }, error: (e) => {
        console.error(e);
      },complete: () => {
        this.listUsuarios.find( (element:any) => {

          if( element.tipo == '003' ) {
            console.warn(element);
            this.lisTecnicos.push(element);
            this.dataSource = new MatTableDataSource(this.lisTecnicos);
            this.dataSource.paginator = this.paginator;
          }

        })
      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(data:any): void {

    const dialogRef = this.dialog.open( ModalProvicComponent, {
      height: '600px',
      width: '80%',
      data: data, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( result );

      // this.obtenerConvenioMacro();

    });


  }


}