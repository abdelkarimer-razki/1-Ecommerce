import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { CartService, CartItem } from '../services/cart.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  total: number = 0;
  loading = false;
  submitted = false;
  error = '';

  form = {
    fullname: '',
    tel: '',
    email: '',
    adress: ''
  };

  constructor(
    private cart: CartService,
    private dash: DashboardService,
    private router: Router,
    private titleService: Title,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Finaliser ma commande');
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();

    // Prefill from localStorage if logged in
    const user = localStorage.getItem('user');
    const email = localStorage.getItem('userE');
    if (user) this.form.fullname = user;
    if (email) this.form.email = email;

    if (this.items.length === 0) {
      this.router.navigate(['/shopping']);
    }
  }

  updateQte(item: CartItem, delta: number) {
    const newQte = item.qte + delta;
    if (newQte < 1) {
      this.cart.removeItem(item.idproducts, item.taille);
    } else {
      this.cart.updateQte(item.idproducts, item.taille, newQte);
    }
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();
    if (this.items.length === 0) this.router.navigate(['/shopping']);
  }

  removeItem(item: CartItem) {
    this.cart.removeItem(item.idproducts, item.taille);
    this.items = this.cart.getItems();
    this.total = this.cart.getTotal();
    if (this.items.length === 0) this.router.navigate(['/shopping']);
  }

  transform(pic: string): any {
    if (!pic) return '';
    const re = /kigmfhhh/gi;
    const pic1 = pic.replace(re, '/');
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  submitOrder() {
    if (!this.form.fullname || !this.form.tel) {
      this.error = 'Veuillez remplir votre nom complet et téléphone.';
      return;
    }
    this.loading = true;
    this.error = '';

    const order = {
      fullname: this.form.fullname,
      tel: this.form.tel,
      email: this.form.email,
      adress: this.form.adress,
      source: 'site',
      items: this.items.map(i => ({
        idproducts: i.idproducts,
        taille: i.taille,
        qte: i.qte,
        prix: i.prix
      }))
    };

    this.dash.checkout(order).subscribe(
      (res: any) => {
        this.cart.clear();
        this.loading = false;
        this.submitted = true;
      },
      (err) => {
        this.loading = false;
        this.error = "Une erreur s'est produite. Veuillez réessayer.";
        console.error(err);
      }
    );
  }
}
