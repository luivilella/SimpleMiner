import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IField, IColumnConf } from '../miner';
import { MinerUtilsService } from '../miner-utils.service';
import { FieldFilterComponent } from './field-filter.component';

@Component({
    selector: 'sm-miner-search',
    templateUrl: 'app/miners/miner/search/miner-search.component.html',
    directives: [
        FieldFilterComponent,
    ]
})
export class MinerSearchComponent implements OnChanges {

    @Input() miner: IMiner;

    filters: IField[];

    private _filters: { [id: string]: IField } = {};

    constructor(private _minerUtils: MinerUtilsService) {
    }

    ngOnChanges(): void {
        this._minerUtils.setMiner(this.miner);
        this.loadSavedFilters()
    }

    loadSavedFilters(): void{
        if(!this.miner){
            return;
        }

        let f_list = this.miner.savedFilters;
        for (let key in f_list) {
            let f = f_list[key];
            let field = this._minerUtils.getField(f.fieldId);
            field.operator = f.operator;
            this._setFilter(field);
        }

        this.refreshFilters();
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