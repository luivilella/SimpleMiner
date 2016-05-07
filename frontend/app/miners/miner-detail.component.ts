import { Component, OnInit } from 'angular2/core';
import { RouteParams } from 'angular2/router';

import { MinerComponent } from './miner/miner.component';

@Component({
    templateUrl: 'app/miners/miner-detail.component.html',
    directives: [
        MinerComponent,
    ],
})
export class MinerDetailComponent implements OnInit{

    miner_to_find: string;
    pageTitle: string = 'Miner Detail';

    constructor(private _routeParams: RouteParams) {
    }

    ngOnInit() {
        if (!this.miner_to_find) {
            this.miner_to_find = this._routeParams.get('miner');
        }
    }

}
