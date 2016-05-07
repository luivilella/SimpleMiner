import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IColumnConf, IFilterConf, IFieldFilter, IFilter, IField } from './miner';
import { MinerService } from './miner.service';
import { FieldFilterComponent } from './field-filter.component';
import { MinerTableComponent } from './table/miner-table.component';

@Component({
    selector: 'sm-miner-detail',
    templateUrl: 'app/miners/miner/miner.component.html',
    directives: [
        MinerTableComponent,
        FieldFilterComponent,
    ]
})
export class MinerDetailComponent implements OnChanges {
    @Input() miner_to_find: string;

    miner: IMiner;
    minerRows: any[];
    errorMessage: string;
    filters: IField[];

    private _filters: { [id: string]: IField } = {};
    private _loadedSavedFilters: boolean = false;

    constructor(private _minerService: MinerService) {
    }


    ngOnChanges(): void {
        this.getMiner();
    }

    getMiner(): void {
        this.miner = null;
        this._loadedSavedFilters = false;
        this._minerService.getMiner(
            this.miner_to_find
        ).subscribe(
            miner => this.miner = miner,
            error =>  this.errorMessage = <any>error,
            () => this.getMinerComplete()
        );
    }

    getMinerComplete(): void{
        this.loadSavedFilters();
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

    getColumnConf(fieldId: string): IColumnConf{
        return this.miner.minerColumns.columnsConf[fieldId];
    }


    getSearchParams(): IFilter{
        let searchParams: IFilter = <IFilter>{};
        searchParams.filters = this.filters;
        return searchParams;
    }

    getField(fieldId: string): IField{
        let conf = this.getColumnConf(fieldId);

        let ret: IField = <IField>{};
        ret.exhibitionName = conf.exhibitionName;
        ret.helpText = conf.helpText;
        ret.fieldId = conf.fieldId;
        ret.type = conf.type;
        ret.name = conf.name;
        return ret;
    }

    loadSavedFilters(): void{
        if(!this.miner){
            return;
        }
        if(this._loadedSavedFilters){
            return;
        }

        let f_list = this.miner.savedFilters;
        for (let key in f_list) {
            let f = f_list[key];
            let field = this.getField(f.fieldId);
            field.operator = f.operator;
            this._setFilter(field);
        }

        this._loadedSavedFilters = true;
        this.refreshFilters();
    }

    getAvaliableFilters(): string[]{
        return this.miner.avaliableFilters;
    }

    _setFilter(filter: IField): void{
        let key = filter.fieldId + filter.operator;
        this._filters[key] = filter;
    }

    setFilter(filter: IField): void{
        this._setFilter(filter);
        this.refreshFilters();
    }

    refreshFilters(): void{
        let ret: IField[] = <IField[]>[];
        for (let key in this._filters) {
            ret.push(this._filters[key]);
        }
        this.filters = ret;
    }

}
