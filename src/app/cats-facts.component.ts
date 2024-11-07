import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CatsFactsService } from './cats-facts.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cat-facts',
  template: `
    <div class="h-screen flex flex-col bg-gray-50">
    <div class="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 shadow-lg">
        <div class="bg-white/10 backdrop-blur-sm">
          <h1 class="text-3xl font-bold text-center text-white p-6 flex items-center justify-center gap-2">
            <span>🐱</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
              Cat Facts
            </span>
          </h1>
        </div>
      </div>

      <div class="flex-1 p-4 flex items-center justify-center">
        <div
          class="w-full max-w-2xl h-[calc(100vh-200px)] flex flex-col bg-white shadow-lg rounded-lg"
        >
          <div class="flex-1 p-6 overflow-auto">
            <ul class="space-y-4">
              @for (fact of facts(); track $index) {
                <li class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <p class="text-gray-700">{{ fact }}</p>
                </li>
              }
            </ul>
          </div>

          <div class="p-6 border-t border-gray-200 bg-white">
            <div class="flex flex-row justify-center gap-4">
              <button
                (click)="restartFacts()"
                [disabled]="isLoading()"
                class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
              >
                Restart
              </button>

              <button
                (click)="loadMore()"
                [disabled]="isLoading()"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
              >
                @if (isLoading()) {
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                } @else {
                  Load More
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class CatFactsComponent implements OnInit {
  facts = signal<string[]>([]);
  isLoading = signal(false);
  count = signal(5);

  private readonly _catFactsService = inject(CatsFactsService);
  private readonly _destroy = inject(DestroyRef);

  ngOnInit(): void {
    this.loadFacts();
  }

  loadFacts(isReset = false): void {
    this.isLoading.set(true);
    const newCount = isReset ? 5 : this.count();

    this._catFactsService.getCatsFacts(newCount).pipe(takeUntilDestroyed(this._destroy)).subscribe({
      next: (facts) => {
        this.facts.set(facts);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    this.count.update((ct) => ct += 5);
    this.loadFacts();
  }

  restartFacts(): void {
    this.count.set(5);
    this.loadFacts(true);
  }
}
