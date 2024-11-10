import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CatsFactsService } from './cats-facts.service';
import { ResourceStatusPipe } from './resource-status.pipe';

@Component({
  selector: 'app-cat-facts',
  templateUrl: './cats-facts.component.html',
  standalone: true,
  imports: [ResourceStatusPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatFactsComponent {
  count = signal(5);

  private readonly _catFactsService = inject(CatsFactsService);

  factsResource = this._catFactsService.getCatsFacts;

  loadRandomFacts(): void {
    // Update locally
    /* this.factsResource.value.update((values: string[] | undefined) => {
      if (!values) {
        return undefined;
      }
      return [...values, 'Other fact!' ];
    }); */

    // Update based on signal
    this._catFactsService.updateCount(Math.floor(Math.random() * 100) + 1);
  }

  restartFacts(): void {
    this.factsResource.reload();
  }
}
