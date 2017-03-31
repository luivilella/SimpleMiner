import * as _ from 'lodash';
import { Component, DoCheck, Input, Output, EventEmitter} from '@angular/core';

import { IMiner, IField } from '../shared/interfaces';
import { MinerService } from '../shared/service';

@Component({
    selector: 'sm-new-filter',
    templateUrl: './new-filter.component.html',
})
export class NewFilterComponent implements DoCheck {

    @Input() miner: IMiner;
    @Input() currentFilters: IField[];
    @Input() avaliableFilters: IField[];

    @Output() newFilter: EventEmitter<IField> = new EventEmitter<IField>();

    private filtersMap: { [id: string]: boolean } = {};
    private _currentFilters: IField[];

    fieldId: string;
    operator: string;
    error: string;

    constructor(private _minerService: MinerService) {
    }

    ngDoCheck(): void {
        if(!_.isEqual(this._currentFilters, this.currentFilters)) {
            this._currentFilters = _.cloneDeep(this.currentFilters);
            this.buildFiltersMap();
        }
    }

    buildFiltersMap(){
        let filtersMap: { [id: string]: boolean } = {};
        for (let filter of this.currentFilters) {
            filtersMap[this.getFilterKey(filter)] = true;
        }
        this.filtersMap = filtersMap;
    }

    operators(): string[]{
        let ret: string[] = <string[]>[];
        let field = this._minerService.getFieldById(this.fieldId, this.miner);
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

    getFilterKey(filter: IField): string{
        return filter.fieldId + filter.operator;
    }

    filterExists(filter: IField): boolean{
        return this.filtersMap[this.getFilterKey(filter)] !== undefined;
    }

    save(): void{
        this.error = null;
        let field = this._minerService.getFieldById(this.fieldId, this.miner);
        field.operator = this.operator;

        if (this.filterExists(field)){
            this.error = 'Filter alrery exists';
            return;
        }

        this.reset();
        this.newFilter.emit(field);
    }

    valid(): boolean{
        if(!this.fieldId || !this.operator){
            return false;
        }
        return true;
    }

    reset(): void{
        this.fieldId = null;
        this.operator = null;
        this.error = null;
    }

}