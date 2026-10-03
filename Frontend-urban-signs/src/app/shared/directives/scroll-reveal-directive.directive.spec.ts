import { ElementRef } from '@angular/core';
import { ScrollRevealDirectiveDirective } from './scroll-reveal-directive.directive';

describe('ScrollRevealDirectiveDirective', () => {
  it('should create an instance', () => {
    const mockEl = new ElementRef(document.createElement('div'));
    const directive = new ScrollRevealDirectiveDirective(mockEl);
    expect(directive).toBeTruthy();
  });
});
