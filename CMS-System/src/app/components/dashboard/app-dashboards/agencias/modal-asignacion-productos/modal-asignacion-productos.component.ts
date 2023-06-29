import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgenciasComponent } from '../agencias.component';

@Component({
  selector: 'app-modal-asignacion-productos',
  templateUrl: './modal-asignacion-productos.component.html',
  styleUrls: ['./modal-asignacion-productos.component.scss']
})
export class ModalAsignacionProductosComponent implements OnInit {

  nombreagencia:string = '';
  nombrecliente:string = '';
  constructor(public dialogRef: MatDialogRef<AgenciasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit(): void {

    this.nombreagencia = this.data.nombre;
    this.nombrecliente = this.data.nombreCliente;
    console.warn(this.data);

  }

}
