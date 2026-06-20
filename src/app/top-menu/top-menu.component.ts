import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { HomepageService } from '../services/homepage.service';
import { CartService } from '../services/cart.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  menuMore: boolean = false;
  name: any;
  email: any;
  cartCount: number = 0;

  constructor(
    public log: LoginService,
    private route: Router,
    private homepage: HomepageService,
    private cartService: CartService,
    public trans: TranslationService
  ) {
    route.events.subscribe((val) => {
      this.disableMenu();
      this.name = localStorage.getItem('user');
      this.email = localStorage.getItem('userE');
    });
  }

  ngOnInit(): void {
    // Subscribe to cart changes (works for guests too)
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((s, i) => s + i.qte, 0);
    });
  }

  showMenu() {
    this.menuMore = !this.menuMore;
  }

  disableMenu() {
    this.menuMore = false;
  }
}
