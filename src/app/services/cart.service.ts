import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  idproducts: number;
  name: string;
  picture: string;
  taille: string;
  prix: number;   // unit price
  qte: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private STORAGE_KEY = 'coop_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  private loadCart(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch { return []; }
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  addItem(item: CartItem) {
    const items = [...this.getItems()];
    const idx = items.findIndex(i => i.idproducts === item.idproducts && i.taille === item.taille);
    if (idx >= 0) {
      items[idx] = { ...items[idx], qte: items[idx].qte + item.qte };
    } else {
      items.push({ ...item });
    }
    this.saveCart(items);
  }

  updateQte(idproducts: number, taille: string, qte: number) {
    const items = this.getItems().map(i =>
      i.idproducts === idproducts && i.taille === taille ? { ...i, qte } : i
    ).filter(i => i.qte > 0);
    this.saveCart(items);
  }

  removeItem(idproducts: number, taille: string) {
    this.saveCart(this.getItems().filter(i => !(i.idproducts === idproducts && i.taille === taille)));
  }

  clear() {
    this.saveCart([]);
  }

  getTotal(): number {
    return this.getItems().reduce((s, i) => s + i.prix * i.qte, 0);
  }

  getCount(): number {
    return this.getItems().reduce((s, i) => s + i.qte, 0);
  }
}
