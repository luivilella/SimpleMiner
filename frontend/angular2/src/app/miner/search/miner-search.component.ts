import { Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';

import { IMiner, IField, IColumnConf, INewFilter } from '../interfaces';
import { MinerService } from '../miner.service';


@Component({
    selector: 'sm-miner-search',
    templateUrl: './miner-search.component.html',
})
export class MinerSearchComponent implements OnChanges {

    @Input() miner: IMiner;
    @Output() onSearch: EventEmitter<IField[]> = new EventEmitter<IField[]>();

    private filtersMap: { [id: string]: IField } = {};
    filters: IField[] = [];
    avaliableFilters: IField[] = [];

    newFilter: INewFilter = <INewFilter>{};

    constructor(private _minerService: MinerService) {
    }

    ngOnChanges(): void {
        // this.loadSavedFilters();
        this.loadAvaliableFilters();
    }

    loadAvaliableFilters(): void{
        let avaliableFilters: IField[] = <IField[]>[];

        let fields = this.miner.avaliableFilters;
        for (let key in fields) {
            let fieldId = fields[key];
            let field = this._minerService.getFieldById(fieldId, this.miner);
            avaliableFilters.push(field);
        }
        this.avaliableFilters = avaliableFilters;
    }

    newFieldOperators(): string[]{
        let ret: string[] = <string[]>[];
        let field = this._minerService.getFieldById(this.newFilter.fieldId, this.miner);
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

    buildFilters(): void{
        let filters: IField[] = <IField[]>[];
        for (let key in this.filtersMap) {
            filters.push(this.filtersMap[key]);
        }
        this.filters = filters;
    }

    getFilterKey(filter: IField): string{
        return filter.fieldId + filter.operator;
    }

    filterExists(filter: IField): boolean{
        return this.filtersMap[this.getFilterKey(filter)] !== undefined;
    }

    _addFilter(fieldId: string, operator: string): boolean{
        let field = this._minerService.getFieldById(fieldId, this.miner);
        field.operator = operator;
        if (this.filterExists(field)){
            return false
        }
        this.filtersMap[this.getFilterKey(field)] = field;
        return true;
    }

    saveNewFilter(): void{

        let added = this._addFilter(this.newFilter.fieldId, this.newFilter.operator);
        if (!added){
            this.newFilter.message = 'Filter alrery exists';
            this.newFilter.messageType = 'error';
            return;
        }

        this.buildFilters();
        this.resetNewFilter();
        this.newFilter.message = 'Filter saved';
        this.newFilter.messageType = 'success';
    }

    newFilterConfigured(): boolean{
        if(!this.newFilter.fieldId || !this.newFilter.operator){
            return false;
        }
        return true;
    }

    resetNewFilter(): void{
        this.newFilter = <INewFilter>{};
    }

}