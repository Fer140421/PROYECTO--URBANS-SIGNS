import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { LoadingComponent } from '../../loading/loading/loading.component';
import { DataCardDirective, DataHeaderDirective, DataRowDirective } from './data-view-template.directive';

export type DataViewMode = 'list' | 'cards';

@Component({
  selector: 'app-responsive-data-view',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './responsive-data-view.component.html',
  styleUrl: './responsive-data-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponsiveDataViewComponent<T = unknown> {
  @Input() items: readonly T[] = [];
  @Input() mode: DataViewMode = 'list';
  @Input() loading = false;
  @Input() loadingLabel = 'Cargando registros';
  @Input() emptyTitle = 'No hay registros';
  @Input() emptyMessage = '';
  @Input() tableMinWidth = '48rem';
  @Input() columns = 5;

  @ContentChild(DataHeaderDirective) header?: DataHeaderDirective;
  @ContentChild(DataRowDirective) row?: DataRowDirective;
  @ContentChild(DataCardDirective) card?: DataCardDirective;
}
