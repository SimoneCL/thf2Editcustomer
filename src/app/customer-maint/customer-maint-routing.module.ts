import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerMaintListComponent } from './list/customer-maint.list.component';
import { CustomerMaintDetailComponent } from './detail/customer-maint.detail.component';
import { CustomerMaintEditComponent } from './edit/customer-maint.edit.component';


const routes: Routes = [
  {
    path: '',
    component: CustomerMaintListComponent
  },
  {
    path: 'detail/:id',
    component: CustomerMaintDetailComponent
  },
  {
    path: 'edit/:id',
    component: CustomerMaintEditComponent
  },
  {
    path: 'new',
    component: CustomerMaintEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerMaintRoutingModule { }
