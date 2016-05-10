import { Injectable } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable } from 'rxjs/Observable';

import { IMenu } from './menu';

@Injectable()
export class MenuService {

    private _baseUrl = 'api/menu/';

    constructor(private _http: Http) { }

    getMenu(): Observable<IMenu> {
        let url = 'menu.json';
        return this._http.get(
            this._baseUrl + url
        ).map(
            (response: Response) => <IMenu> response.json()
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
