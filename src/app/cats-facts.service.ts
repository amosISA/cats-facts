import { Injectable, resource, ResourceLoaderParams, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatsFactsService {
  private readonly _apiUrl = 'https://meowfacts.herokuapp.com';
  private readonly count = signal(10);

  readonly getCatsFacts = resource({
    params: this.count,
    loader: async (loaderParams: ResourceLoaderParams<number>) => {
      try {
        const response = await (await fetch(`${this._apiUrl}/?count=${loaderParams.params}`, { signal: loaderParams.abortSignal })).json() as { data: string[] };
        return response.data;
      } catch(error) {
        throw error;
      }
    },
    defaultValue: [],
  });

  updateCount(value: number): void {
    this.count.set(value);
  }
}
