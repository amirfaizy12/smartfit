import { Component, HostListener, inject, Input, PLATFORM_ID } from '@angular/core';
import { ScroolService } from '../../core/services/scrool/scrool.service';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  scroolService = inject(ScroolService)
  pLATFORM_ID = inject(PLATFORM_ID)
  @HostListener('window:scroll')
  onScroll(): void {
    this.scroolService.setScrolled(window.scrollY > (window.innerHeight - 200));
  }
  ngOnInit(): void {
    if(isPlatformBrowser(this.pLATFORM_ID)){

      this.scroolService.setScrolled(window.scrollY > (window.innerHeight - 200));
    }
      
  }
  ngOnDestroy(): void {
    this.scroolService.setScrolled(true);
  }
}
