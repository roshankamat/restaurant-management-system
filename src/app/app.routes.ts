import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Menu } from './menu/menu';
import { Tables } from './tables/tables';
import { Orders } from './orders/orders';
import { Billing } from './billing/billing';
import { Customers } from './customers/customers';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard
  },
  {
    path: 'menu',
    component: Menu
  },
  {
    path: 'tables',
    component: Tables
  },
  {
    path: 'orders',
    component: Orders
  },
  {
    path: 'billing',
    component: Billing
  },
  {
    path: 'customers',
    component: Customers
  }
];