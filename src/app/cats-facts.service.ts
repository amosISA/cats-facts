import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

export interface CatFactResponse {
  data: string[];
}

@Injectable({ providedIn: 'root' })
export class CatsFactsService {
  private readonly _apiUrl = 'https://meowfacts.herokuapp.com';
  private readonly _http = inject(HttpClient);

  getCatsFacts(count = 10): Observable<string[]> {
    return this._http
      .get<CatFactResponse>(`${this._apiUrl}`, {
        params: { count: count.toString() },
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    throw error;
  }
}
