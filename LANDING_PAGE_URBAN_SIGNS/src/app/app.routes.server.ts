import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  ...['', 'landing', 'landing/home', 'landing/cotizaciones', 'landing/portafolio',
    'login', 'register', 'recuperar-contrasena'].map(path => ({
      path,
      renderMode: RenderMode.Prerender as const
    })),
  ...['portal', 'portal/cotizaciones', 'portal/pedidos', 'portal/perfil'].map(path => ({
    path,
    renderMode: RenderMode.Client as const
  })),
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404
  }
];
