import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { IField } from '../shared/interfaces';

@Component({
    selector: 'sm-filter',
    templateUrl: './filter.component.html',
})
export class FilterComponent implements OnChanges {

    @Input() field: IField;
    @Output() onChange: EventEmitter<IField> = new EventEmitter<IField>();

    ngOnChanges(): void {
        this.fieldChanged();
    }

    fieldChanged(): void{
        this.onChange.emit(this.field);
    }

}
