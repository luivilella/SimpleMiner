import { Component, OnChanges, Input, Output, EventEmitter } from 'angular2/core';

import { IField, IFieldFilter } from './miner';

interface IFieldFilterComponent extends OnChanges, IField {
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
    @Input() forced: boolean = false;

    @Output() onChange: EventEmitter<IFieldFilter> = new EventEmitter<IFieldFilter>();

    filter: IFieldFilter = <IFieldFilter>{};

    ngOnChanges(): void {
        this.fieldChanged();
    }

    setFilter(): void{
        this.filter.fieldId = this.fieldId;
        this.filter.operator = this.operator;
        this.filter.value = this.value;
        this.filter.forced = this.forced;
    }

    fieldChanged(): void{
        this.setFilter();
        this.onChange.emit(this.filter);
    }

}
