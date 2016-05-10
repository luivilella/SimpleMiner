import { Input, Component, OnChanges } from 'angular2/core';
import { ROUTER_DIRECTIVES } from 'angular2/router';

import { IMenuCategory, IMenuMiner } from './menu';

@Component({
    selector: 'sm-menu-category',
    templateUrl: 'app/menu/menu-category.component.html',
    directives: [
        ROUTER_DIRECTIVES,
        MenuCategoryComponent,
    ]
})
export class MenuCategoryComponent implements OnChanges {

    @Input() category: IMenuCategory;

    hasMiners: boolean;
    miners: IMenuMiner[];

    hasCategories: boolean;
    categories: IMenuCategory[];

    ngOnChanges(): void {

        this.miners = this.category.miners;
        this.hasMiners = false;
        if (this.miners && this.miners.length){
            this.hasMiners = true;
        }

        this.categories = this.category.categories;
        this.hasCategories = false;
        if (this.categories && this.categories.length){
            this.hasCategories = true;
        }

    }

    getMinerURL(miner: IMenuMiner): string{
        let search: string = '' + miner.id;
        if (miner.slug){
            search = miner.slug;
        }
        return search;
    }

}
