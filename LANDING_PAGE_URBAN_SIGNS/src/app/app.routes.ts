import { Routes } from '@angular/router';
import { portalGuard } from './portal.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./Public/landing/landing').then(m => m.Landing),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./Public/home/home').then(m => m.Home)
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./Public/cotizaciones/pages-cotizaciones/pages-cotizaciones')
            .then(m => m.PagesCotizaciones)
      },
      {
        path: 'portafolio',
        loadComponent: () => import('./Public/home/portfolio/portfolio').then(m => m.Portfolio)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./Public/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./Public/auth/register/register').then(m => m.Register)
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./Public/auth/pages/pages').then(m => m.Pages)
  },
  {
    path: 'portal',
    pathMatch: 'full',
    redirectTo: 'portal/perfil'
  },
  {
    path: 'portal/cotizaciones',
    canActivate: [portalGuard],
    loadComponent: () => import('./Client/portal/portal').then(m => m.Portal),
    data: { view: 'quotes' }
  },
  {
    path: 'portal/pedidos',
    canActivate: [portalGuard],
    loadComponent: () => import('./Client/portal/portal').then(m => m.Portal),
    data: { view: 'orders' }
  },
  {
    path: 'portal/perfil',
    canActivate: [portalGuard],
    loadComponent: () => import('./Client/portal/portal').then(m => m.Portal),
    data: { view: 'profile' }
  },
  {
    path: '**',
    title: 'Página no encontrada | Urban Signs',
    loadComponent: () => import('./Public/not-found/not-found').then(m => m.NotFound)
  }
];
