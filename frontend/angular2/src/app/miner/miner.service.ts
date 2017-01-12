import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { IMiner, IFilter } from './interfaces';

@Injectable()
export class MinerService {

    private _production: boolean = app.environment === 'production';
    private _baseUrl: string = app.api_url;

    constructor(private _http: Http) { }

    getURL(url){
        return this._baseUrl + url;
    }

    getMiner(miner: string): Observable<IMiner> {
        let url = this.getURL('miners/miner.json');
        let searchParams: URLSearchParams = new URLSearchParams();
        if (this._production){
            searchParams.set('miner', miner);
        }
        return this._http.get(url, {search: searchParams})
          .map((response: Response) => <IMiner> response.json())
          .catch(this.handleError);
    }


    filterMiner(params: IFilter): Observable<any[]> {
        let url = this.getURL('miners/miner-rows.json');

        let searchParams: URLSearchParams = new URLSearchParams();
        if (this._production){
            // searchParams.set('params', params);
        }

        return this._http.get(url, {search: searchParams})
          .map((response: Response) => <IMiner> response.json())
          .catch(this.handleError);
    }


    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}