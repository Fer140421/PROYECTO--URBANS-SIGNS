import { Directive, TemplateRef } from '@angular/core';

export interface DataViewTemplateContext<T = unknown> {
  $implicit: T;
  index: number;
}

@Directive({ selector: 'ng-template[appDataHeader]', standalone: true })
export class DataHeaderDirective {
  constructor(readonly template: TemplateRef<void>) {}
}

@Directive({ selector: 'ng-template[appDataRow]', standalone: true })
export class DataRowDirective {
  constructor(readonly template: TemplateRef<DataViewTemplateContext<any>>) {}

  static ngTemplateContextGuard(
    _directive: DataRowDirective,
    context: unknown
  ): context is DataViewTemplateContext<any> {
    return true;
  }
}

@Directive({ selector: 'ng-template[appDataCard]', standalone: true })
export class DataCardDirective {
  constructor(readonly template: TemplateRef<DataViewTemplateContext<any>>) {}

  static ngTemplateContextGuard(
    _directive: DataCardDirective,
    context: unknown
  ): context is DataViewTemplateContext<any> {
    return true;
  }
}
