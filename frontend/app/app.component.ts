import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/Rx';   // Load all features

import { MinerComponent } from './miners/miner/miner.component';
import { MinerService } from './miners/miner/miner.service';

@Component({
    selector: 'sm-app',
    templateUrl: 'app/app.component.html',
    directives: [
        MinerComponent,
    ],
    providers: [
        HTTP_PROVIDERS,
        MinerService,
    ],
})
export class AppComponent {
    pageTitle: string = 'Simple Miner';
}