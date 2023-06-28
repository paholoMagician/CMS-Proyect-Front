import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { HubService } from './components/shared/hub-services/hub.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'CMS-System';

  constructor(private hub: HubService) {}

  ngOnInit(): void {
    this.hub.startConnection();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.hubCanal();
    }, 503);
  }

  hubCanal() {
    console.log('Iniciando')

    this.hub.askServer();
    this.hub.askServerListener();
  }

  ngOnDestroy() {
    this.hub.hubConnection.off("askServerResponse");

  }

}
