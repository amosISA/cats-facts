import { Injectable, resource, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatsFactsService {
  private readonly _apiUrl = 'https://meowfacts.herokuapp.com';
  private readonly count = signal(10);

  readonly getCatsFacts = resource({
    request: this.count,
    loader: async ({ request: count, abortSignal }) => {
      try {
        const response = await (await fetch(`${this._apiUrl}/?count=${count}`, { signal: abortSignal })).json() as { data: string[] };
        return response.data;
      } catch(error) {
        throw error;
      }
    }
  });

  updateCount(value: number): void {
    this.count.set(value);
  }
}
