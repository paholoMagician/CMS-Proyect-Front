import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asign-mod-user',
  templateUrl: './asign-mod-user.component.html',
  styleUrls: ['./asign-mod-user.component.scss']
})
export class AsignModUserComponent implements OnInit {

  @Input() data!: any [];

  constructor() { }

  ngOnInit(): void {
  }

  

}
