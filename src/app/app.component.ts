import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CatFactsComponent } from './cats-facts.component';

@Component({
  selector: 'app-root',
  template: `<app-cat-facts />`,
  standalone: true,
  imports: [CatFactsComponent],
})
export class AppComponent {}
