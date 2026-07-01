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
  isStats: boolean = false;
  isStock: boolean = false;
  showSettingsSubmenu: boolean = false;

  // FAB Quick Actions State
  showQuickActions: boolean = false;
  globalProductModalActive: boolean = false;
  globalCategoryModalActive: boolean = false;

  // Global Manual Command Modal (multi-product)
  addModalActive: boolean = false;
  manualCommandSubmitted: boolean = false;
  productsList: any[] = [];
  previousBuyers: any[] = [];
  filteredBuyersByName: any[] = [];
  filteredBuyersByTel: any[] = [];
  showNameSuggestions: boolean = false;
  showTelSuggestions: boolean = false;
  manualCartItems: any[] = [];
  manualCustomer = {
    fullname: '',
    adress: '',
    tel: '',
    email: '',
    etat: false,
    paid: true
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
      } else if (this.route.url == "/admin/stock") {
        this.IsStock();
      } else if (this.route.url == "/admin/settings") {
        this.IsSettings();
        this.showSettingsSubmenu = true;
      } else if (this.route.url == "/admin/messages") {
        this.IsMessages();
      } else if (this.route.url == "/admin/stats") {
        this.IsStats();
      }
    })
  }

  ngOnInit(): void {
    this.route.navigate(["/admin/commands"]);
  }

  IsDashboard() { this.isDashboard = true; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; this.isStats = false; this.isStock = false; }
  IsCommands() { this.isDashboard = false; this.isCommands = true; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; this.isStats = false; this.isStock = false; }
  IsProduits() { this.isDashboard = false; this.isCommands = false; this.isProduits = true; this.isCategories = false; this.isSettings = false; this.isMessages = false; this.isStats = false; this.isStock = false; }
  IsCategories() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = true; this.isSettings = false; this.isMessages = false; this.isStats = false; this.isStock = false; }
  IsSettings() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = true; this.isMessages = false; this.isStats = false; this.isStock = false; }
  IsMessages() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = true; this.isStats = false; this.isStock = false; }
  IsStats() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; this.isStats = true; this.isStock = false; }
  IsStock() { this.isDashboard = false; this.isCommands = false; this.isProduits = false; this.isCategories = false; this.isSettings = false; this.isMessages = false; this.isStats = false; this.isStock = true; }

  toggleSettingsSubmenu(event: Event) {
    event.stopPropagation();
    this.showSettingsSubmenu = !this.showSettingsSubmenu;
  }

  // Open global FAB manual command modal
  openAddModal() {
    this.manualCustomer = { fullname: '', adress: '', tel: '', email: '', etat: false, paid: true };
    this.manualCartItems = [];
    this.manualProductSelect = { idproducts: '', qte: 1 };
    this.manualSelectedProduct = null;
    this.manualSizesList = [];
    this.manualSelectedSize = null;
    this.manualCommandSubmitted = false;

    this.dash.getPreviousBuyers().subscribe((buyers: any) => {
      this.previousBuyers = buyers || [];
    });

    this.dash.showproducts().subscribe((data: any) => {
      this.productsList = data;
      this.addModalActive = true;
    });
  }

  closeAddModal() {
    this.addModalActive = false;
  }

  onBuyerSelect(field: string) {
    let selected;
    if (field === 'tel') {
      selected = this.previousBuyers.find(b => b.tel === this.manualCustomer.tel);
    } else if (field === 'fullname') {
      selected = this.previousBuyers.find(b => b.fullname === this.manualCustomer.fullname);
    }
    if (selected) {
      this.manualCustomer.fullname = selected.fullname;
      this.manualCustomer.tel = selected.tel;
      this.manualCustomer.email = selected.email || '';
      this.manualCustomer.adress = selected.adress || '';
    }
  }

  filterBuyers(field: 'name' | 'tel') {
    if (field === 'name') {
      const val = this.manualCustomer.fullname ? this.manualCustomer.fullname.toLowerCase() : '';
      if (val.trim() === '') {
        this.filteredBuyersByName = [];
        this.showNameSuggestions = false;
      } else {
        this.filteredBuyersByName = this.previousBuyers.filter(b => 
          (b.fullname && b.fullname.toLowerCase().includes(val)) || 
          (b.tel && b.tel.includes(val))
        );
        this.showNameSuggestions = this.filteredBuyersByName.length > 0;
      }
    } else if (field === 'tel') {
      const val = this.manualCustomer.tel ? this.manualCustomer.tel.toLowerCase() : '';
      if (val.trim() === '') {
        this.filteredBuyersByTel = [];
        this.showTelSuggestions = false;
      } else {
        this.filteredBuyersByTel = this.previousBuyers.filter(b => 
          (b.tel && b.tel.includes(val)) || 
          (b.fullname && b.fullname.toLowerCase().includes(val))
        );
        this.showTelSuggestions = this.filteredBuyersByTel.length > 0;
      }
    }
  }

  hideSuggestionsLater(field: 'name' | 'tel') {
    setTimeout(() => {
      if (field === 'name') {
        this.showNameSuggestions = false;
      } else if (field === 'tel') {
        this.showTelSuggestions = false;
      }
    }, 200);
  }

  selectBuyer(buyer: any) {
    this.manualCustomer.fullname = buyer.fullname;
    this.manualCustomer.tel = buyer.tel;
    this.manualCustomer.email = buyer.email || '';
    this.manualCustomer.adress = buyer.adress || '';
    this.showNameSuggestions = false;
    this.showTelSuggestions = false;
  }

  toggleQuickActions(event: Event) {
    event.stopPropagation();
    this.showQuickActions = !this.showQuickActions;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.showQuickActions = false;
    this.showSettingsSubmenu = false;
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
        buying_cost: Number(this.manualSelectedSize.buying_cost) || 0,
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

  validatePrice(item: any) {
    const min = Number(item.buying_cost) || 0;
    if (Number(item.prix) < min) {
      item.prix = min;
    }
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
