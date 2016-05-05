import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IColumnConf, IFilterConf } from './miner';
import { MinerService } from './miner.service';
import { FieldFilterComponent } from './field-filter.component';

@Component({
    selector: 'sm-miner-detail',
    templateUrl: 'app/miners/miner-detail.component.html',
    directives: [
        FieldFilterComponent,
    ]     
})
export class MinerDetailComponent implements OnChanges {
    @Input() miner_to_find: string;

    miner: IMiner;
    tableRows: any[];
    errorMessage: string;

    constructor(private _minerService: MinerService) {
    }

    getMiner(): void {
        this._minerService.getMiner(
            this.miner_to_find
        ).subscribe(
            miner => this.miner = miner,
            error =>  this.errorMessage = <any>error
        );
    }

    showTable(): boolean{
        if(!this.miner.minerColumns){
            return false;
        }
        if(!this.miner.minerColumns.columnsOrder){
            return false;
        }
        if(!this.miner.minerColumns.columnsOrder.length){
            return false;
        }
        if(!this.tableRows){
            return false;
        }
        if(!this.tableRows.length){
            return false;
        }
        return true;
    }
    
    getColumnConf(fieldId): IColumnConf{
        return this.miner.minerColumns.columnsConf[fieldId];
    }

    getTableColumns(): string[]{
        return this.miner.minerColumns.columnsOrder;
    }

    getTableRows(): void{
        this._minerService.filterMiner(
        ).subscribe(
            rows => this.tableRows = rows,
            error =>  this.errorMessage = <any>error
        );        
    }

    getRowValue(row: any, fieldId: string): any{
        return row[fieldId];
    }

    ngOnChanges(): void {
        this.getMiner();
        this.getTableRows();
    }

    getSavedFilters(): IFilterConf[]{
        return this.miner.savedFilters;
    }

    getAvaliableFilters(): string[]{
        return this.miner.avaliableFilters;
    }

}
