import { Component, OnChanges, Input } from 'angular2/core';

import { IMiner, IColumnConf } from '../miner';

@Component({
    selector: 'sm-miner-table',
    templateUrl: 'app/miners/miner/table/miner-table.component.html',
})
export class MinerTableComponent implements OnChanges {

    @Input() miner: IMiner;
    @Input() tableRows: any[];

    showTable: boolean = false;
    tableColumns: IColumnConf[];

    ngOnChanges(): void {
        this.loadTableColumns();
        this.showTable = this._showTable();
    }

    loadTableColumns(): void{
        let tableColumns: IColumnConf[] = <IColumnConf[]>[];
        for(let idx in this.miner.minerColumns.columnsOrder){
            let fieldId = this.miner.minerColumns.columnsOrder[idx];
            tableColumns.push(this.getColumnConf(fieldId));
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

    getColumnConf(fieldId: string): IColumnConf{
        return this.miner.minerColumns.columnsConf[fieldId];
    }

    getRowValue(row: any, fieldId: string): any{
        return row[fieldId];
    }
}