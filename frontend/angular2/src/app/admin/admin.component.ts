import { Component } from '@angular/core';
import { Ng2StateDeclaration } from "ui-router-ng2";




@Component({
  selector: 'admin-base',
  templateUrl: './admin.component.html'
})
export class AdminComponent { }


export let AdminState: Ng2StateDeclaration = {
  name: 'app.admin',
  url: '/admin',
  views: {
    $default: { component: AdminComponent }
  }
}