import { Component, OnChanges, Input, Output, EventEmitter } from 'angular2/core';

import { IField } from './miner';

@Component({
    selector: 'sm-field-filter',
    templateUrl: 'app/miners/miner/field-filter.component.html',
})
export class FieldFilterComponent implements OnChanges {

    @Input() field: IField;
    @Output() onChange: EventEmitter<IField> = new EventEmitter<IField>();

    ngOnChanges(): void {
        this.fieldChanged();
    }

    fieldChanged(): void{
        this.onChange.emit(this.field);
    }

}
