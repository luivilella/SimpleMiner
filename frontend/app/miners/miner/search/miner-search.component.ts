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
    avaliableFilters: IField[];

    new_filter: {
        fieldId: string;
        operator: string;
        message: string;
        message_type: string;
    } = <any>{};

    private _filters: { [id: string]: IField } = {};

    constructor(private _minerUtils: MinerUtilsService) {
    }

    ngOnChanges(): void {
        this._minerUtils.setMiner(this.miner);
        this.loadSavedFilters();
        this.loadAvaliableFilters();
    }

    loadSavedFilters(): void{
        let f_list = this.miner.savedFilters;
        for (let key in f_list) {
            let f = f_list[key];
            this._addFilter(f.fieldId, f.operator);
        }

        this.refreshFilters();
    }

    loadAvaliableFilters(): void{
        let avaliableFilters: IField[] = <IField[]>[];

        let f_list = this.miner.avaliableFilters;
        for (let key in f_list) {
            let fieldId = f_list[key];
            avaliableFilters.push(this._minerUtils.getField(fieldId));
        }
        this.avaliableFilters = avaliableFilters;
    }

    _addFilter(fieldId: string, operator: string): void{
        let field = this._minerUtils.getField(fieldId);
        field.operator = operator;
        this._setFilter(field);
    }

    setNewFieldMsg(type: string, message: string): void{
        this.new_filter.message_type = type;
        this.new_filter.message = message;
    }

    clearNewFieldMsg():void{
        this.new_filter.message_type = null;
        this.new_filter.message = null;
    }

    addNewFilter(): void{
        this.clearNewFieldMsg();

        if(!this.new_filter.fieldId){
            this.setNewFieldMsg('error', 'Field not selected');
            return;
        }

        if(!this.new_filter.operator){
            this.setNewFieldMsg('error', 'Operator not selected');
            return;
        }

        this._addFilter(this.new_filter.fieldId, this.new_filter.operator);
        this.refreshFilters();

        this.new_filter.fieldId = null;
        this.new_filter.operator = null;
        this.setNewFieldMsg('sucess', 'Filter added');
    }

    getNewFieldOperators(): string[]{
        let ret: string[] = <string[]>[];
        let field = this._minerUtils.getField(this.new_filter.fieldId);

        if(!field){
            return ret;
        }

        if(field.type == 'string'){
            ret.push('=');
            ret.push('like');
            ret.push('sql');
        }

        return ret;
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