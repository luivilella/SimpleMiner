import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IFilter, IField } from './miner';

import { MinerService } from './miner.service';
import { MinerUtilsService } from './miner-utils.service';

import { MinerTableComponent } from './table/miner-table.component';
import { MinerSearchComponent } from './search/miner-search.component';

@Component({
    selector: 'sm-miner',
    templateUrl: 'app/miners/miner/miner.component.html',
    directives: [
        MinerTableComponent,
        MinerSearchComponent,

    ],
    providers: [
        MinerUtilsService
    ]
})
export class MinerComponent implements OnChanges {
    @Input() miner_to_find: string;

    miner: IMiner;
    minerRows: any[];
    errorMessage: string;
    filters: IField[];

    constructor(private _minerService: MinerService) {
    }

    ngOnChanges(): void {
        this.getMiner();
    }

    getMiner(): void {
        this.miner = null;

        this._minerService.getMiner(
            this.miner_to_find
        ).subscribe(
            miner => this.miner = miner,
            error =>  this.errorMessage = <any>error,
            () => this.getMinerComplete()
        );
    }

    getMinerComplete(): void{
        this.getRows();
    }

    getRows(): void{
        this._minerService.filterMiner(
            this.getSearchParams()
        ).subscribe(
            rows => this.minerRows = rows,
            error =>  this.errorMessage = <any>error
        );
    }

    getSearchParams(): IFilter{
        let searchParams: IFilter = <IFilter>{};
        // searchParams.filters = this.filters;
        return searchParams;
    }

    search(filters: IField[]): void{
        this.filters = filters;
        this.getRows();
    }
}
