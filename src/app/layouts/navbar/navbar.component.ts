import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ScroolService } from '../../core/services/scrool/scrool.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isScrolled = false;
  auth = true;
  scroolService = inject(ScroolService)

  ngOnInit(): void {
    this.scroolService.scrolled$.subscribe(value => {
      this.isScrolled = value;
    });
  }
}
