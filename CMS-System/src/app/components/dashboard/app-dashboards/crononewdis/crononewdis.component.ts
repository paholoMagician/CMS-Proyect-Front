import { Component, OnInit } from '@angular/core';
import { CrononewdisService } from './services/crononewdis.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from '../usuario/services/user.service';
import { MatDialog } from '@angular/material/dialog';


import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-crononewdis',
  templateUrl: './crononewdis.component.html',
  styleUrls: ['./crononewdis.component.scss']
})
export class CrononewdisComponent implements OnInit {
  clientesel: string = 'Escoge un cliente a visualizar'
  listaAgenciasRes: any = [];
  resultadosFiltrados: any = [];
  public ccia:any;
  _IMGE: any;
  resultadosFiltradosNorte:any = [];
  resultadosFiltradosCentro:any = [];
  resultadosFiltradosSur:any = [];
  resultadosFiltradosGeneral:any = [];

  zlist1:any = [];
  zlist2:any = [];
  zlist3:any = [];
  zlist4:any = [];
  zlist5:any = [];
  zlist6:any = [];
  zlist7:any = [];

  N:string='';
  S:string='';
  C:string='';
  G:string='';

  codeZone:string = '';
  _show_spinner: boolean = false;
  constructor( private crone: CrononewdisService,private client: ClienteService, 
    private DataMaster: SharedService,
    private us: UserService ) { }

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('ZNF');
    this.asignarColores();  
  }

  listaZonificacion: any = [];
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'ZNF':
            this.listaZonificacion = data;
            console.log(this.listaZonificacion);
            break;
        }
      }, complete: () => {

        this.listaZonificacion.filter((element:any)=>{
          this.obtenerZonaAgencia(element.codigo);
        })

      }
    }) 
  }

  obtenerZonaAgencia(codec:string) {
    this.resultadosFiltradosNorte   = []
    this.resultadosFiltradosCentro  = []
    this.resultadosFiltradosSur     = []
    this.resultadosFiltradosGeneral = []

    this.crone.obtenerZonificacion(codec, 'void').subscribe({
      next:(x:any) => {        
        if( codec == '001' ) {
          this.zlist1 = x;
          this.resultadosFiltradosNorte = x;
          console.warn('Norte');
          console.warn(this.resultadosFiltradosNorte);
        }      
        else if (codec == '002') {
          this.zlist2 = x;
          this.resultadosFiltradosSur = x;
          console.warn('SUR');
          console.warn(this.resultadosFiltradosSur);
        } 
        else if (codec == '003') {
          this.zlist3 = x;
          this.resultadosFiltradosCentro = x;
          console.warn('CENTRO');
          console.warn(this.resultadosFiltradosCentro);
        }
        else if (codec == '004') {
          this.zlist4 = x;
          this.resultadosFiltradosGeneral = x;
        }
        else if (codec == '005') {
          this.zlist5 = x;
        }
        else if (codec == '006') {
          this.zlist6 = x;
        }
        else if (codec == '007') {
          this.zlist7 = x;
        }



      }
    })
  }

  getColorForInitial(initial: string): string {
    
    const colors: { [key: string]: string } = {
      N: 'red',
      C: 'green',
      S: 'blue',
      G: 'orange'
    };
    
    return colors[initial] || 'gray';

  }

  asignarColores() {
    this.N = this.getColorForInitial('N');
    this.S = this.getColorForInitial('S');
    this.C = this.getColorForInitial('C');
    this.G = this.getColorForInitial('G');
  }

  filtroTextoNorte: string = '';
  filtrarElementosNorte() {
    this.resultadosFiltradosNorte = this.zlist1.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase())
    );
  }

  filtroTextoCentro: string = '';
  filtrarElementosCentro() {

    console.log(this.filtroTextoCentro)

    this.resultadosFiltradosCentro = this.zlist3.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase())
    );
  }

  filtroTextoSur: string = '';
  filtrarElementosSur() {
    this.resultadosFiltradosSur = this.zlist2.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoSur.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoSur.toLowerCase())
    );
  }
  
  filtroTextoGeneral: string = '';
  filtrarElementosGeneral() {
    this.resultadosFiltradosGeneral = this.zlist4.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoGeneral.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoGeneral.toLowerCase())
    );
  }

  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }


}
