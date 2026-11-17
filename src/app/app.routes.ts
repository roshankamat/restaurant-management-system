import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Menu } from './menu/menu';
import { Tables } from './tables/tables';
import { Orders } from './orders/orders';
import { Billing } from './billing/billing';
import { Customers } from './customers/customers';
import { Settings } from './settings/settings';
import { Login } from './login/login';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'menu',
    component: Menu,
    canActivate: [authGuard]
  },
  {
    path: 'tables',
    component: Tables,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: Orders,
    canActivate: [authGuard]
  },
  {
    path: 'billing',
    component: Billing,
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    component: Customers,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
