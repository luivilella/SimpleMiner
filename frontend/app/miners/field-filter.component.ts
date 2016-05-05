import { Component, OnChanges, Input, Output } from 'angular2/core';

import { IMiner, IColumnConf, IFilterConf, IFieldFilter } from './miner';

interface IFieldFilterComponent extends OnChanges, IColumnConf, IFilterConf, IFieldFilter {    
}

@Component({
    selector: 'sm-field-filter',
    templateUrl: 'app/miners/field-filter.component.html',
})
export class FieldFilterComponent implements IFieldFilterComponent {
    
    @Input() fieldId: string;
    @Input() name: string;
    @Input() type: string;
    @Input() operator: string;
    @Input() exhibitionName: string;
    @Input() helpText: string;
    @Input() value: string;
    @Input() forced: boolean;
         
    ngOnChanges(): void {
    }

}
