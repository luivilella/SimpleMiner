import { Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';

import { IMiner, IField, IColumnConf, INewFilter } from '../shared/interfaces';
import { MinerService } from '../shared/service';


@Component({
    selector: 'sm-miner-search',
    templateUrl: './miner-search.component.html',
})
export class MinerSearchComponent implements OnChanges {

    @Input() miner: IMiner;
    @Output() onSearch: EventEmitter<IField[]> = new EventEmitter<IField[]>();

    filters: IField[] = [];
    avaliableFilters: IField[] = [];
    
    constructor(private _minerService: MinerService) {
    }

    ngOnChanges(): void {
        this.loadSavedFilters();
        this.loadAvaliableFilters();
    }

    loadAvaliableFilters(): void{
        this.avaliableFilters = this._minerService.getAvaliableFilters(this.miner);
    }

    addFilter(field: IField){
        this.filters.push(field)
    }

    loadSavedFilters(): void{
        for (let field of this._minerService.getSavedFilters(this.miner)) {
            this.addFilter(field);
        }
    }

    search():void{
        let fields: IField[] = [];
        
        for (let field of this.filters) {
            if(field.value){
                fields.push(field);
            }
        }

        if(fields.length){
            this.onSearch.emit(this.filters);    
        }
    }

}