import { Directive, inject, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from '../../core/services/login/login.service';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective  implements OnInit, OnDestroy {
  private roles: string[] = [];
  private subscription?: Subscription;
  private loginService = inject(LoginService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set hasRole(roles: string | string[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  ngOnInit() {
    this.subscription = this.loginService.authState.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateView() {
    this.viewContainer.clear();
    if (this.loginService.hasAnyRole(this.roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}