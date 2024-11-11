import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { CatsFactsService } from './cats-facts.service';
import { ResourceStatusPipe } from './resource-status.pipe';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-cat-facts',
  templateUrl: './cats-facts.component.html',
  standalone: true,
  imports: [ResourceStatusPipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatFactsComponent {
  count = signal(5);

  private readonly _catFactsService = inject(CatsFactsService);

  factsResource = this._catFactsService.getCatsFacts;

  selectedItem = linkedSignal<string[] | undefined, number>({
    source: this.factsResource.value,
    // Angular 19's new computation with previous state access 🎯
    computation: (facts, previous) => {
      if (previous && facts && previous.value < facts.length) {
        return previous.value; // Preserve valid selections
      }
      return -1; // Reset when needed
    }
  });

  readonly itemsPerPage = signal(5);

  // Current page state with linkedSignal
  currentPage = linkedSignal<string[] | undefined, number>({
    source: this.factsResource.value,
    computation: (facts, previous) => {
      if (!facts) return 0;
      if (previous && previous.value * this.itemsPerPage() < facts.length) {
        return previous.value; // Keep current page if still valid
      }
      return 0; // Reset to first page if data changes significantly
    }
  });

  // Computed values for pagination
  readonly paginatedFacts = computed(() => {
    const facts = this.factsResource.value();
    if (!facts) return [];
    const start = this.currentPage() * this.itemsPerPage();
    return facts.slice(start, start + this.itemsPerPage());
  });

  readonly totalPages = computed(() => {
    const facts = this.factsResource.value();
    if (!facts) return 0;
    return Math.ceil(facts.length / this.itemsPerPage());
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i);
  });

  loadMore(): void {
    this._catFactsService.updateCount(Math.floor(Math.random() * 100) + 1);
  }

  restartFacts(): void {
    this.factsResource.reload();
  }

  selectFact(index: number): void {
    this.selectedItem.set(index);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
