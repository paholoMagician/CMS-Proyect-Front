import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BodegasService } from './services/bodegas.service';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.scss']
})
export class BodegasComponent implements OnInit {
  @Input() modulo: any = [];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  _delete_show:       boolean = true;
  ccia:               any;
  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  tipoEmpresaLista:   any = [];
  _show_spinner:      boolean = false; 
  columnHead:         any = [ 'edit', 'N.Agen.', 'nombre', 'R.U.C.', 'replegal', 'descripcion', 'fechas' ];
  public dataSource!: MatTableDataSource<any>;

  constructor(private bodega: BodegasService) { }

  ngOnInit(): void {
  }



}
