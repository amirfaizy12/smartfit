import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScroolService {
  private scrolled = new BehaviorSubject<boolean>(true);
  scrolled$ = this.scrolled.asObservable();

  setScrolled(value: boolean): void {
    this.scrolled.next(value);
  }
}
