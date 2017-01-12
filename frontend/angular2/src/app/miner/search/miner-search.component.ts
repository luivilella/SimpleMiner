import { Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';

import { IMiner, IField, IColumnConf } from '../interfaces';


@Component({
    selector: 'sm-miner-search',
    templateUrl: './miner-search.component.html',
})
export class MinerSearchComponent implements OnChanges {

    @Input() miner: IMiner;
    @Output() onSearch: EventEmitter<IField[]> = new EventEmitter<IField[]>();

    constructor() {
    }

    ngOnChanges(): void {

    }

}