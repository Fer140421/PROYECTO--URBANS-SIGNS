import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PortalAuthService } from '../../Core/portal-auth.service';
import { PortalDataService } from '../../Core/Service/Portal/portal-data.service';
import { HeaderLanding } from '../../Core/Layout/landing-page/header-landing/header-landing';

@Component({
  selector: 'app-portal',
  imports: [CommonModule, HeaderLanding, RouterLink],
  templateUrl: './portal.html'
})
export class Portal implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(PortalAuthService);
  readonly data = inject(PortalDataService);
  readonly user = this.auth.currentUser;

  readonly view = signal<'profile' | 'quotes' | 'orders' | string>('profile');
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(data => {
      const currentView = data['view'] ?? 'profile';
      this.view.set(currentView);
      if (currentView === 'quotes') {
        this.data.loadQuotes().subscribe();
      } else if (currentView === 'orders') {
        this.data.loadOrders().subscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/landing/home']));
  }
}
