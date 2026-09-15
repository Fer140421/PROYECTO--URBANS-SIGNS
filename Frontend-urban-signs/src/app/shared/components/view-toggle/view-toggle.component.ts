import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ViewMode = 'list' | 'cards';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  templateUrl: './view-toggle.component.html',
  styleUrl: './view-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewToggleComponent {
  @Input() mode: ViewMode = 'list';
  @Output() readonly modeChange = new EventEmitter<ViewMode>();

  selectMode(mode: ViewMode): void {
    if (mode !== this.mode) {
      this.modeChange.emit(mode);
    }
  }
}
