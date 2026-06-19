import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {
  // Tables
  pendingOrders: any[] = [];
  completedOrders: any[] = [];
  
  // UI state
  voidPending: boolean = false;
  voidCompleted: boolean = false;
  isEffectuer: boolean = true; // true = pending (non-effectuées), false = completed
  date: string = this.getCurrentMonth();
  
  // Detail modal
  detailModalActive: boolean = false;
  selectedOrder: any = null;

  // Delete confirm modal
  deleteModalActive: boolean = false;
  orderToDelete: any = null;
  
  // Add Manual Command Modal
  addModalActive: boolean = false;
  productsList: any[] = [];
  // Cart items for manual command
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

  constructor(private dash: DashboardService) {}

  getCurrentMonth(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables() {
    // Load pending (non-effectuées)
    this.dash.allCommandsE().subscribe((data: any) => {
      this.pendingOrders = data || [];
      this.voidPending = this.pendingOrders.length === 0;
    });
    // Load completed for current month
    this.searchCompleted(this.date);
  }

  searchCompleted(date: any) {
    if (!date) {
      this.dash.allCommandsN().subscribe((data: any) => {
        this.completedOrders = data || [];
        this.voidCompleted = this.completedOrders.length === 0;
      });
    } else {
      this.dash.commandEffectueSearch(date).subscribe((data: any) => {
        this.completedOrders = data || [];
        this.voidCompleted = this.completedOrders.length === 0;
      });
    }
  }

  changeTab(isPending: boolean) {
    this.isEffectuer = isPending;
    if (!isPending) this.searchCompleted(this.date);
  }

  // Month navigation
  prevMonth() { this.adjustMonth(-1); }
  nextMonth() { this.adjustMonth(1); }

  adjustMonth(offset: number) {
    if (!this.date) this.date = this.getCurrentMonth();
    const [yearStr, monthStr] = this.date.split('-');
    const d = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
    d.setMonth(d.getMonth() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    this.date = `${y}-${m}`;
    this.searchCompleted(this.date);
  }

  getMonthLabel(): string {
    if (!this.date) return '';
    const [y, m] = this.date.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  // Mark order as effectuée / non-effectuée
  toggleEffectue(order: any) {
    if (order.etat) {
      this.dash.deeffectueCommande(order.idgroup, order).subscribe(() => this.loadTables());
    } else {
      this.dash.effectueCommande(order.idgroup, order).subscribe(() => this.loadTables());
    }
  }

  // Verify / Unverify
  toggleVerify(order: any) {
    if (order.verifie) {
      this.dash.verfieCommande(order.idgroup, order).subscribe(() => this.loadTables());
    } else {
      this.dash.unverfiedCommande(order.idgroup, order).subscribe(() => this.loadTables());
    }
  }

  // Detail modal
  openDetail(order: any) {
    this.selectedOrder = order;
    this.detailModalActive = true;
  }

  closeDetail() {
    this.detailModalActive = false;
    this.selectedOrder = null;
  }

  // Delete modal
  openDeleteConfirm(order: any) {
    this.orderToDelete = order;
    this.deleteModalActive = true;
  }

  closeDeleteConfirm() {
    this.deleteModalActive = false;
    this.orderToDelete = null;
  }

  confirmDelete() {
    if (!this.orderToDelete) return;
    this.dash.deleteOrderGroup(this.orderToDelete.idgroup).subscribe(() => {
      this.closeDeleteConfirm();
      this.loadTables();
    });
  }

  // =============================================
  // MANUAL COMMAND MODAL (multi-product cart)
  // =============================================
  openAddModal() {
    this.manualCustomer = { fullname: '', adress: '', tel: '', email: '', etat: false };
    this.manualCartItems = [];
    this.manualProductSelect = { idproducts: '', qte: 1 };
    this.manualSelectedProduct = null;
    this.manualSizesList = [];
    this.manualSelectedSize = null;

    this.dash.showproducts().subscribe((data: any) => {
      this.productsList = data;
      this.addModalActive = true;
    });
  }

  closeAddModal() {
    this.addModalActive = false;
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
      if (sizes.length > 0) {
        this.manualSelectedSize = sizes[0];
      } else {
        this.manualSelectedSize = { taille: '', prix: Number(this.manualSelectedProduct.prix) || 0 };
      }
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
    if (!this.manualCustomer.fullname || !this.manualCustomer.tel) {
      alert('Veuillez remplir le nom et le téléphone du client.');
      return;
    }
    if (this.manualCartItems.length === 0) {
      alert('Veuillez ajouter au moins un produit.');
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
        this.loadTables();
      },
      (err) => {
        console.error(err);
        alert("Erreur lors de l'ajout de la commande.");
      }
    );
  }
}
