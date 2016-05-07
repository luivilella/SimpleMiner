import { Injectable } from 'angular2/core';
import { IMiner, IColumnConf, IField } from './miner';

@Injectable()
export class MinerUtilsService {

    miner: IMiner;


    setMiner(miner: IMiner): void{
        this.miner = miner;
    }

    getMiner(miner: IMiner): IMiner{
        if(miner){
            return miner;
        }
        return this.miner;
    }

    getColumnConf(fieldId: string, pMiner?: IMiner): IColumnConf{
        let miner = this.getMiner(pMiner);
        if (!miner){
            return null;
        }

        return miner.minerColumns.columnsConf[fieldId];
    }

    getField(fieldId: string, pMiner?: IMiner): IField{
        let miner = this.getMiner(pMiner);
        let conf = this.getColumnConf(fieldId, miner);
        if (!conf){
            return null;
        }

        let ret: IField = <IField>{};
        ret.exhibitionName = conf.exhibitionName;
        ret.helpText = conf.helpText;
        ret.fieldId = conf.fieldId;
        ret.type = conf.type;
        ret.name = conf.name;
        return ret;
    }

}