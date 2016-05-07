/* Defines the miner entity */

export interface IFieldFilter {
    fieldId: string;
    operator: string;
    value: string;
    forced: boolean;
}

export interface IFilterConf {
    fieldId: string;
    operator: string;
}

export interface IOrderBy {
    fieldId: string;
    order: string;
}

export interface IFilter {
    paginator: any;
    orderBy: IOrderBy[];
    filters: IFieldFilter[];
    limit: number;
}

export interface IColumnConf {
    exhibitionName: string;
    helpText: string;
    fieldId: string;
    type: string;
    name: string;
}

export interface IField extends IFieldFilter, IFilterConf, IColumnConf{
}

export interface IMiner {
    name: string;
    slug: string;
    remark: string;
    appliedParameters: IFilter;
    savedFilters: IFilterConf[];
    avaliableFilters: string[];
    minerColumns: {
        columnsOrder: string[];
        columnsConf: { [id: string]: IColumnConf };
    };
}
