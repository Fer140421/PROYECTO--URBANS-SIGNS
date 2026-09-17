import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4 py-12 text-white">
      <div class="w-full max-w-lg text-center">
        <a routerLink="/landing/home" aria-label="Urban Signs: volver al inicio" class="text-3xl font-bold">
          <span class="text-[#FFD000]">URBAN</span> SIGNS
        </a>
        <p class="mt-12 text-8xl font-black text-[#FFD000] sm:text-9xl">404</p>
        <h1 class="mt-6 text-3xl font-bold">Página no encontrada</h1>
        <p class="mt-4 text-gray-400">La dirección que buscas no existe o ya no está disponible.</p>
        <a routerLink="/landing/home" class="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD000] px-6 py-3 font-semibold text-black transition hover:bg-[#ffdc40]">Volver al inicio</a>
      </div>
    </main>
  `
})
export class NotFound {}
