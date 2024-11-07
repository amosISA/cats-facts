import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatsFactsService } from './cats-facts.service';

@Component({
  selector: 'app-cat-facts',
  template: `
    <div class="h-screen flex flex-col">
      <!-- Sticky Header -->
      <div
        class="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 shadow-lg"
      >
        <div class="bg-white/10 backdrop-blur-sm">
          <h1
            class="text-3xl font-bold text-center text-white p-6 flex items-center justify-center gap-2"
          >
            <span>🐱</span>
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100"
            >
              Cat Facts
            </span>
          </h1>
        </div>
      </div>

      <!-- Status Card -->
      <div class="bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <!-- Status -->
            <div
              class="flex flex-col items-center p-2 border-r border-gray-200"
            >
              <span class="text-sm text-gray-500">Status</span>
              <span class="font-semibold text-gray-700 flex items-center gap-1">
                <span
                  class="h-2 w-2 rounded-full"
                  [ngClass]="{
                    'bg-green-500': !isLoading() && !error(),
                    'bg-yellow-500': isLoading(),
                    'bg-red-500': error()
                  }"
                >
                </span>
                {{ isLoading() ? 'Loading' : error() ? 'Error' : 'Loaded' }}
              </span>
            </div>

            <!-- Facts Count -->
            <div
              class="flex flex-col items-center p-2 border-r border-gray-200"
            >
              <span class="text-sm text-gray-500">Facts Loaded</span>
              <span class="font-semibold text-gray-700">{{
                facts().length
              }}</span>
            </div>

            <!-- Last Updated -->
            <div
              class="flex flex-col items-center p-2 border-r border-gray-200"
            >
              <span class="text-sm text-gray-500">Last Updated</span>
              <span class="font-semibold text-gray-700">{{
                lastUpdated() | date : 'shortTime'
              }}</span>
            </div>

            <!-- Error Status -->
            <div class="flex flex-col items-center p-2">
              <span class="text-sm text-gray-500">Error Status</span>
              <span
                class="font-semibold"
                [class]="error() ? 'text-red-600' : 'text-green-600'"
              >
                {{ error() ? 'Error' : 'No Error' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main container -->
      <div
        class="flex-1 p-4 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50"
      >
        <!-- Card container -->
        <div
          class="w-full max-w-2xl h-[calc(100vh-300px)] flex flex-col bg-white shadow-xl rounded-lg"
        >
          <!-- Facts list with internal scroll -->
          <div class="flex-1 p-6 overflow-auto">
            <ul class="space-y-4">
              @for (fact of facts(); track $index) {
              <li
                class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm"
              >
                <p class="text-gray-700">{{ fact }}</p>
              </li>
              }
            </ul>
          </div>

          <!-- Buttons section -->
          <div
            class="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm"
          >
            <div class="flex flex-row justify-center gap-4">
              <button
                (click)="restartFacts()"
                [disabled]="isLoading()"
                class="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                Restart
              </button>

              <button
                (click)="loadMore()"
                [disabled]="isLoading()"
                class="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-md hover:shadow-lg"
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
                Loading... } @else { Load More }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [NgClass, DatePipe],
})
export class CatFactsComponent implements OnInit {
  facts = signal<string[]>([]);
  isLoading = signal(false);
  count = signal(5);
  error = signal(false);
  lastUpdated = signal(new Date());

  private readonly _catFactsService = inject(CatsFactsService);
  private readonly _destroy = inject(DestroyRef);

  ngOnInit(): void {
    this.loadFacts();
  }

  loadFacts(isReset = false): void {
    this.isLoading.set(true);
    const newCount = isReset ? 5 : this.count();

    this._catFactsService
      .getCatsFacts(newCount)
      .pipe(takeUntilDestroyed(this._destroy))
      .subscribe({
        next: (facts) => {
          this.facts.set(facts);
          this.isLoading.set(false);
          this.error.set(false);
          this.lastUpdated.set(new Date());
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading.set(false);
          this.error.set(false);
          this.lastUpdated.set(new Date());
        },
      });
  }

  loadMore(): void {
    this.count.update((ct) => (ct += 5));
    this.loadFacts();
  }

  restartFacts(): void {
    this.count.set(5);
    this.loadFacts(true);
  }
}
