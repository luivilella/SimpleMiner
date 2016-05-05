import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';

import { IMiner, IFilter } from './miner';

@Injectable()
export class MinerService {
    
    private _baseUrl = 'api/miners/';
    
    constructor(private _http: Http) { }

    getMiner(miner: string): Observable<IMiner> {
        let url = 'miner.json'; 
        return this._http.get(
            this._baseUrl + url
        ).map(
            (response: Response) => <IMiner> response.json()
        ).do(
            data => console.log('All: ' +  JSON.stringify(data))
        ).catch(
            this.handleError
        );                
    }


    filterMiner(): Observable<any[]> {
        let url = 'miner-rows.json'; 
        return this._http.get(
            this._baseUrl + url
        ).map(
            (response: Response) => <any[]> response.json()
        ).do(
            data => console.log('All: ' +  JSON.stringify(data))
        ).catch(
            this.handleError
        ); 
    }


    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}
