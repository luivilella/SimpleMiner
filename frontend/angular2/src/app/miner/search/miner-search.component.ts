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

    filters: IField[] = [];
    avaliableFilters: IField[] = [];
    
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

    addFilter(filter: IField){
        let filters = this.filters;
        filters.push(filter);
        this.filters = filters;
    }

}