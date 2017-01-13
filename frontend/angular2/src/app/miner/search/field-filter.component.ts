import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { IField } from '../interfaces';

@Component({
    selector: 'sm-field-filter',
    templateUrl: './field-filter.component.html',
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
