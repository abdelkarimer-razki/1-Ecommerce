import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isDashboard: boolean = false;
  isCommands: boolean = false;
  isProduits: boolean = false;
  isCategories: boolean = false;
  isSettings: boolean = false;
  isMessages: boolean = false;

  // FAB Quick Actions State
  showQuickActions: boolean = false;
  globalProductModalActive: boolean = false;
  globalCategoryModalActive: boolean = false;

  // Global Manual Command Modal (multi-product)
  addModalActive: boolean = false;
  manualCommandSubmitted: boolean = false;
  productsList: any[] = [];
  manualCartItems: any[] = [];
  manualCustomer = {
    fullname: '',
    adress: '',
    tel: '',
    email: '',
    etat: false
  };
  manualProductSelect: any = { idproducts: '', qte: 1 };
  manualSelectedProduct: any = null;
  manualSizesList: any[] = [];
  manualSelectedSize: any = null;

  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private dash: DashboardService,
    public trans: TranslationService
  ) {
    route.events.subscribe((val) => {
      if (this.route.url == "/admin/commands") {
        this.IsCommands()
      } else if (this.route.url == "/admin/dashboard") {
        this.IsDashboard();
      } else if (this.route.url == "/admin/categories") {
        this.IsCategories();
      } else if (this.route.url == "/admin/products") {
        this.IsProduits();
      } else if (this.route.url == "/admin/settings") {
        this.IsSettings();
      } else if (this.route.url == "/admin/messages") {
        this.IsMessages();
      }
    })
  }

  ngOnInit(): void {
    this.route.navigate(["/admin/dashboard"]);
  }

  IsDashboard() { this.isDashboard = true; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; }
  IsCommands() { this.isDashboard = false; this.isCommands = true; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; }
  IsProduits() { this.isDashboard = false; this.isCommands = false; this.isProduits = true; this.isCategories = false; this.isSettings = false; this.isMessages = false; }
  IsCategories() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = true; this.isSettings = false; this.isMessages = false; }
  IsSettings() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = true; this.isMessages = false; }
  IsMessages() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = true; }

  // Open global FAB manual command modal
  openAddModal() {
    this.manualCustomer = { fullname: '', adress: '', tel: '', email: '', etat: false };
    this.manualCartItems = [];
    this.manualProductSelect = { idproducts: '', qte: 1 };
    this.manualSelectedProduct = null;
    this.manualSizesList = [];
    this.manualSelectedSize = null;
    this.manualCommandSubmitted = false;

    this.dash.showproducts().subscribe((data: any) => {
      this.productsList = data;
      this.addModalActive = true;
    });
  }

  closeAddModal() {
    this.addModalActive = false;
  }

  toggleQuickActions(event: Event) {
    event.stopPropagation();
    this.showQuickActions = !this.showQuickActions;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.showQuickActions = false;
  }

  quickAddProduct() {
    this.showQuickActions = false;
    this.globalProductModalActive = true;
  }

  quickAddCategory() {
    this.showQuickActions = false;
    this.globalCategoryModalActive = true;
  }

  onGlobalProductModalClose(saved: boolean) {
    this.globalProductModalActive = false;
    if (saved) {
      window.location.reload();
    }
  }

  onGlobalCategoryModalClose(saved: boolean) {
    this.globalCategoryModalActive = false;
    if (saved) {
      window.location.reload();
    }
  }

  quickAddCommand() {
    this.showQuickActions = false;
    this.openAddModal();
  }

  onManualProductSelect(prodId: any) {
    this.manualSelectedProduct = this.productsList.find(p => Number(p.idproducts) === Number(prodId));
    if (this.manualSelectedProduct) {
      let sizes = this.manualSelectedProduct.sizes || [];
      if (sizes.length === 0) {
        if (this.manualSelectedProduct.taille && this.manualSelectedProduct.taille !== '0') {
          sizes.push({ taille: String(this.manualSelectedProduct.taille), prix: Number(this.manualSelectedProduct.prix) });
        }
        if (this.manualSelectedProduct.taille2 && this.manualSelectedProduct.taille2 !== '0') {
          sizes.push({ taille: String(this.manualSelectedProduct.taille2), prix: Number(this.manualSelectedProduct.prix2) });
        }
        if (this.manualSelectedProduct.taille3 && this.manualSelectedProduct.taille3 !== '0') {
          sizes.push({ taille: String(this.manualSelectedProduct.taille3), prix: Number(this.manualSelectedProduct.prix3) });
        }
      }
      this.manualSizesList = sizes;
      this.manualSelectedSize = sizes.length > 0 ? sizes[0] : null;
    }
  }

  addItemToManualCart() {
    if (!this.manualSelectedProduct || !this.manualSelectedSize) return;
    const existing = this.manualCartItems.find(
      i => i.idproducts === this.manualSelectedProduct.idproducts && i.taille === this.manualSelectedSize.taille
    );
    if (existing) {
      existing.qte += Number(this.manualProductSelect.qte) || 1;
    } else {
      this.manualCartItems.push({
        idproducts: this.manualSelectedProduct.idproducts,
        name: this.manualSelectedProduct.name,
        taille: this.manualSelectedSize.taille,
        prix: Number(this.manualSelectedSize.prix),
        qte: Number(this.manualProductSelect.qte) || 1
      });
    }
    this.manualProductSelect = { idproducts: '', qte: 1 };
    this.manualSelectedProduct = null;
    this.manualSizesList = [];
    this.manualSelectedSize = null;
  }

  removeManualItem(i: number) {
    this.manualCartItems.splice(i, 1);
  }

  getManualTotal(): number {
    return this.manualCartItems.reduce((s, i) => s + i.prix * i.qte, 0);
  }

  submitManualCommand() {
    this.manualCommandSubmitted = true;
    if (!this.manualCustomer.fullname || !this.manualCustomer.tel) {
      return;
    }
    if (this.manualCartItems.length === 0) {
      alert(this.trans.t('ADD_PRODUCT_ERROR'));
      return;
    }
    const payload = {
      ...this.manualCustomer,
      source: 'magasin',
      items: this.manualCartItems
    };
    this.dash.addManualCommand(payload).subscribe(
      () => {
        this.closeAddModal();
        if (this.route.url.includes('/admin/commands')) {
          window.location.reload();
        } else {
          this.route.navigate(['/admin/commands']);
        }
      },
      (err) => {
        console.error(err);
        alert(this.trans.t('ADD_COMMAND_ERROR'));
      }
    );
  }

  logout() {
    localStorage.clear();
    this.route.navigate(["/connexion"]).then(() => {
      window.location.reload();
    });
  }
}
