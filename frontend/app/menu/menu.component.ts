import { Component, OnInit } from 'angular2/core';

import { IMenu, IMenuCategory } from './menu';
import { MenuService } from './menu.service';
import { MenuCategoryComponent } from './menu-category.component';

@Component({
    selector: 'sm-menu',
    templateUrl: 'app/menu/menu.component.html',
    providers: [
        MenuService,
    ],
    directives: [
        MenuCategoryComponent,
    ]
})
export class MenuComponent implements OnInit {

    private _menu: IMenu;
    categories: IMenuCategory[];
    errorMessage: IMenu;

    constructor(private _menuService: MenuService) {
    }

    ngOnInit(): void {
        this.getMenu();
    }

    getMenu(): void {
        this._menuService.getMenu(
        ).subscribe(
            menu => this._menu = menu,
            error =>  this.errorMessage = <any>error,
            () => this.getMenuComplete()
        );
    }

    getMenuComplete(): void {
        this.categories = this._menu.categories;
    }

}
