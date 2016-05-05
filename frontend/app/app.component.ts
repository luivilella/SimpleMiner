import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/Rx';   // Load all features

import { MinerDetailComponent } from './miners/miner-detail.component';
import { MinerService } from './miners/miner.service';

@Component({
    selector: 'sm-app',
    templateUrl: 'app/app.component.html',
    directives: [
        MinerDetailComponent,
    ],
    providers: [
        HTTP_PROVIDERS,
        MinerService,
    ],
})
export class AppComponent {
    pageTitle: string = 'Simple Miner';
}