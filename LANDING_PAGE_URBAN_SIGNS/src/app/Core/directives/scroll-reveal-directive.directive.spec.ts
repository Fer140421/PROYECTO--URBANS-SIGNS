import { ElementRef } from '@angular/core';
import { ScrollRevealDirectiveDirective } from './scroll-reveal-directive.directive';

describe('ScrollRevealDirectiveDirective', () => {
  it('should create an instance', () => {
    const directive = new ScrollRevealDirectiveDirective(new ElementRef(document.createElement('div')));
    expect(directive).toBeTruthy();
  });
});
