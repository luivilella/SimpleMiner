import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/Rx';   // Load all features
import { ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';

import { MinerDetailComponent } from './miners/miner-detail.component';
import { MinerService } from './miners/miner/miner.service';

@Component({
    selector: 'sm-app',
    templateUrl: 'app/app.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        MinerDetailComponent,
    ],
    providers: [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        MinerService,
    ],
})
@RouteConfig([
    { path: '/miner/1', name: 'MinerDetail', component: MinerDetailComponent, useAsDefault: true },
    // { path: '/miner/:miner', name: 'MinerDetail', component: MinerDetailComponent },
])
export class AppComponent {
    pageTitle: string = 'Simple Miner';
}