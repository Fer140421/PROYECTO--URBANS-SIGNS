import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { MainPagesComponent } from './components/main-pages/main-pages.component';
import { VerificationComponent } from './components/auth/verification/verification.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { verifyGuard } from './core/guards/verify.guard';
import { NewContraseniaComponent } from './components/auth/new-contrasenia/new-contrasenia.component';
import { SolicitudEmailComponent } from './components/auth/solicitud-email/solicitud-email.component';
import { passwordRecoveryGuard } from './core/guards/passwordRecoveryGuard/password-recovery-guard.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'landing',
        component: LandingPageComponent
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [noAuthGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_ALMACEN'] }
    },
    {
        path: 'solicitud-email',
        component: SolicitudEmailComponent,
        canActivate: [noAuthGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_ALMACEN'] }
    },
    {
        path: 'verification',
        component: VerificationComponent,
        canActivate: [noAuthGuard, passwordRecoveryGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_ALMACEN'] }
    },
    {
        path: 'new-contrasenia',
        component: NewContraseniaComponent,
        canActivate: [noAuthGuard, passwordRecoveryGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_ALMACEN'] }
    },
    {
        path: 'home',
        component: MainPagesComponent,
        loadChildren: () => import('./components/main-pages/main-pages.module').then((m) => m.MainPagesModule),
        canActivate: [verifyGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_VENDEDOR', 'ROLE_ALMACEN'] }
    },
    /*{
        path: '**',
        redirectTo: 'login'
    }*/
];