import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Home } from './home/home';
import { PagesCotizaciones } from './cotizaciones/pages-cotizaciones/pages-cotizaciones';

const routes: Routes = [

  {
    path: '', component: Landing, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'cotizaciones', component: PagesCotizaciones }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
