import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IColumnConf, IFilterConf, IFieldFilter, IFilter, IField } from './miner';
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
    filters: IFieldFilter[];

    private _searchParams: IFilter = <IFilter>{};
    private _filters: { [id: string]: IFieldFilter } = {};
    private _loadedSavedFilters: boolean = false;

    constructor(private _minerService: MinerService) {
    }

    getMiner(): void {
        this._loadedSavedFilters = false;
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

    getColumnConf(fieldId: string): IColumnConf{
        return this.miner.minerColumns.columnsConf[fieldId];
    }

    getTableColumns(): string[]{
        return this.miner.minerColumns.columnsOrder;
    }

    prepareSearchParams(): void{
        this._searchParams.filters = this.filters;
    }

    getTableRows(): void{
        this.prepareSearchParams();
        this._minerService.filterMiner(
            this._searchParams
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

    getField(fieldId: string): IField{
        let ret: IField = <IField>{};
        let conf = this.getColumnConf(fieldId);

        ret.fieldId = conf.fieldId;
        return ret;
    }

    loadSavedFilter(): void{
        if(!this.miner){
            return;
        }
        if(this._loadedSavedFilters){
            return;
        }

        let f_list = this.miner.savedFilters;
        for (let key in f_list) {
            let f = f_list[key];
        }

        this._loadedSavedFilters = true;
    }
    getSavedFilters2(): IField[]{
        let ret: IField[] = <IField[]>[];
        ret.push(this.getField('@m1.client_id'));
        return ret;
    }


    getAvaliableFilters(): string[]{
        return this.miner.avaliableFilters;
    }

    setFilter(filter: IFieldFilter): void{
        let key = filter.fieldId + filter.operator;
        this._filters[key] = filter;
        this.refreshFilters();
    }

    refreshFilters(): void{
        let ret: IFieldFilter[] = [];
        for (let key in this._filters) {
            let f = this._filters[key];
            if (f.value){
                ret.push(f);
            }
        }
        this.filters = ret;
    }

}
