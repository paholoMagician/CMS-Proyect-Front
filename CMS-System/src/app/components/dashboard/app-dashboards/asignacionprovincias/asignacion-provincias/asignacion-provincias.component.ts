import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asignacion-provincias',
  templateUrl: './asignacion-provincias.component.html',
  styleUrls: ['./asignacion-provincias.component.scss']
})
export class AsignacionProvinciasComponent implements OnInit {
  _show_spinner: boolean = false;
  @Input() modulo: any = [];

  constructor() { }

  ngOnInit(): void {
  }



}
