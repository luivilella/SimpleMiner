import { Component, OnChanges, Input } from '@angular/core';
import { MinerService } from '../shared/service';
import { IMiner, IFilter, IField } from '../shared/interfaces';

@Component({
  selector: 'sm-miner-component',
  templateUrl: './miner.component.html',
})
export class MinerComponent implements OnChanges { 
    @Input() minerSearch: string;
    miner: IMiner = null;
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

        this._minerService
          .getMiner(this.minerSearch)
          .subscribe(
            (miner) => this.miner = miner,
            () => null,
            () => this.getRows()
          );
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