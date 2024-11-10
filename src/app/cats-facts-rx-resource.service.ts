import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CatFactResponse {
  data: string[];
}

@Injectable({ providedIn: 'root' })
export class CatsFactsRxResourceService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = 'https://meowfacts.herokuapp.com';
  private readonly count = signal(10);

  readonly getCatsFacts = rxResource({
    request: this.count,
    loader: (count) => {
      return this._http
      .get<CatFactResponse>(`${this._apiUrl}`, {
        params: { count: count.toString() },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
    }
  });

  updateCount(value: number): void {
    this.count.set(value);
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
