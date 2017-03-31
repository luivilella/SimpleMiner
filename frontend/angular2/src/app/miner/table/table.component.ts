import { Component, OnChanges, Input } from '@angular/core';

import { IMiner, IColumnConf } from '../shared/interfaces';
import { MinerService } from '../shared/service';

@Component({
    selector: 'sm-miner-table',
    templateUrl: './table.component.html',
})
export class TableComponent implements OnChanges {

    @Input() miner: IMiner;
    @Input() tableRows: any[];

    showTable: boolean = false;
    tableColumns: IColumnConf[];

    constructor(private _minerService: MinerService) {
    }

    ngOnChanges(): void {
        this.loadTableColumns();
        this.showTable = this._showTable();
    }

    loadTableColumns(): void{
        let tableColumns: IColumnConf[] = <IColumnConf[]>[];
        for(let idx in this.miner.minerColumns.columnsOrder){
            let fieldId = this.miner.minerColumns.columnsOrder[idx];
            tableColumns.push(this._minerService.getColumnConf(fieldId, this.miner));
        }
        this.tableColumns = tableColumns;
    }

    _showTable(): boolean{
        if(!this.miner.minerColumns){
            return false;
        }
        if(!this.miner.minerColumns.columnsOrder){
            return false;
        }
        if(!this.miner.minerColumns.columnsOrder.length){
            return false;
        }
        if(!this.tableRows){
            return false;
        }
        if(!this.tableRows.length){
            return false;
        }
        return true;
    }

    getRowValue(row: any, fieldId: string): any{
        return row[fieldId];
    }
}