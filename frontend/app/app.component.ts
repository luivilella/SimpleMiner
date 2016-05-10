import { Component } from 'angular2/core';
import { HTTP_PROVIDERS } from 'angular2/http';
import 'rxjs/Rx';   // Load all features
import { ROUTER_PROVIDERS, RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';

import { MinerDetailComponent } from './miners/miner-detail.component';
import { MenuComponent } from './menu/menu.component';

@Component({
    selector: 'sm-app',
    templateUrl: 'app/app.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        MinerDetailComponent,
        MenuComponent,
    ],
    providers: [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
    ],
})
@RouteConfig([
    { path: '/miner/', name: 'MinerDetail', component: MinerDetailComponent, useAsDefault: true },
    // { path: '/miner/:miner', name: 'MinerDetail', component: MinerDetailComponent },
])
export class AppComponent {
    pageTitle: string = 'Simple Miner';
}