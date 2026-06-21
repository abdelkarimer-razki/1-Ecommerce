import { Component, OnInit, HostListener } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {
  // Tables
  // Tables
  pendingOrders: any[] = [];
  completedOrders: any[] = [];
  loading: boolean = true;
  
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
  
  // Action dropdown states
  morePending: boolean[] = [];
  moreCompleted: boolean[] = [];

  // Context menu dropdown (outside table)
  activeDropdownOrder: any = null;
  dropdownPosition = { top: 0, left: 0 };
  showDropdown: boolean = false;
  isPendingDropdown: boolean = false;
  
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

  constructor(
    private dash: DashboardService,
    private route: ActivatedRoute,
    public trans: TranslationService
  ) {}

  getCurrentMonth(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.date = params['date'];
        this.isEffectuer = false; // completed tab
      }
      this.loadTables();
    });
  }

  loadTables() {
    this.loading = true;
    this.morePending = [];
    this.moreCompleted = [];
    this.showDropdown = false;
    this.activeDropdownOrder = null;
    
    let pendingLoaded = false;
    let completedLoaded = false;
    
    const checkFinish = () => {
      if (pendingLoaded && completedLoaded) {
        this.loading = false;
      }
    };

    // Load pending (non-effectuées)
    this.dash.allCommandsE().subscribe(
      (data: any) => {
        this.pendingOrders = data || [];
        this.voidPending = this.pendingOrders.length === 0;
        pendingLoaded = true;
        checkFinish();
      },
      () => {
        pendingLoaded = true;
        checkFinish();
      }
    );
    // Load completed for current month
    this.searchCompleted(this.date, () => {
      completedLoaded = true;
      checkFinish();
    });
  }

  searchCompleted(date: any, callback?: () => void) {
    if (!date) {
      this.dash.allCommandsN().subscribe(
        (data: any) => {
          this.completedOrders = data || [];
          this.voidCompleted = this.completedOrders.length === 0;
          if (callback) callback();
        },
        () => {
          if (callback) callback();
        }
      );
    } else {
      this.dash.commandEffectueSearch(date).subscribe(
        (data: any) => {
          this.completedOrders = data || [];
          this.voidCompleted = this.completedOrders.length === 0;
          if (callback) callback();
        },
        () => {
          if (callback) callback();
        }
      );
    }
  }

  changeTab(isPending: boolean) {
    this.isEffectuer = isPending;
    this.morePending = [];
    this.moreCompleted = [];
    this.showDropdown = false;
    this.activeDropdownOrder = null;
    if (!isPending) {
      this.loading = true;
      this.searchCompleted(this.date, () => {
        this.loading = false;
      });
    }
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

  turnoffPending(i: any) {
    for (var j = 0; j < this.morePending.length; j++) {
      if (i != j) {
        this.morePending[j] = false;
      }
    }
  }

  turnoffCompleted(i: any) {
    for (var j = 0; j < this.moreCompleted.length; j++) {
      if (i != j) {
        this.moreCompleted[j] = false;
      }
    }
  }

  toggleDropdown(event: MouseEvent, order: any, isPending: boolean) {
    event.stopPropagation();
    if (this.activeDropdownOrder?.idgroup === order.idgroup && this.showDropdown) {
      this.showDropdown = false;
      this.activeDropdownOrder = null;
      return;
    }
    
    this.activeDropdownOrder = order;
    this.isPendingDropdown = isPending;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownPosition = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 120
    };
    this.showDropdown = true;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick() {
    this.showDropdown = false;
    this.activeDropdownOrder = null;
  }

  generateMonthlyReport() {
    if (!this.completedOrders || this.completedOrders.length === 0) return;

    const monthLabel = this.getMonthLabel();
    const logoUrl = window.location.origin + '/assets/logo31.png';
    
    // 1. Calculations
    let totalRevenue = 0;
    const totalOrders = this.completedOrders.length;
    let onlineRevenue = 0;
    let magasinRevenue = 0;
    let onlineOrders = 0;
    let magasinOrders = 0;
    
    // Product statistics: map of { productKey: { name, size, quantity, total } }
    const productStats: { [key: string]: { name: string, size: string, quantity: number, total: number } } = {};

    for (const order of this.completedOrders) {
      const orderTotal = Number(order.prix_total) || 0;
      totalRevenue += orderTotal;
      
      if (order.source === 'magasin') {
        magasinRevenue += orderTotal;
        magasinOrders++;
      } else {
        onlineRevenue += orderTotal;
        onlineOrders++;
      }

      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const itemQty = Number(item.qte) || 0;
          const itemPrice = Number(item.prix) || 0;
          const itemTotal = itemQty * itemPrice;
          
          const key = `${item.name}-${item.taille || 'Default'}`;
          if (!productStats[key]) {
            productStats[key] = {
              name: item.name,
              size: item.taille || '',
              quantity: 0,
              total: 0
            };
          }
          productStats[key].quantity += itemQty;
          productStats[key].total += itemTotal;
        }
      }
    }

    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
    
    // Sort products by total revenue descending
    const sortedProducts = Object.values(productStats).sort((a, b) => b.total - a.total);
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;

    // Formatting helpers
    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);
    };

    // 2. Build HTML Template
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rapport de Revenus - ${monthLabel}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: #b45309;
      --color-secondary: #3f6212;
      --color-text-main: #1c1917;
      --color-text-muted: #78716c;
      --border-color: #e7e5e4;
      --bg-light: #fafaf9;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: var(--color-text-main);
      margin: 0;
      padding: 30px;
      line-height: 1.4;
      background-color: #ffffff;
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print styling optimizations */
    @media print {
      @page {
        size: A4 portrait;
        margin: 1.2cm 1cm;
      }
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      /* Prevent splitting page inside sections */
      .avoid-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--color-secondary);
      padding-bottom: 12px;
      margin-bottom: 18px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-img {
      height: 48px;
      width: 48px;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--color-secondary);
      margin: 0;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--color-text-muted);
      margin: 1px 0 0 0;
    }

    .report-title-container {
      text-align: right;
    }

    .report-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-primary);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .report-date {
      font-size: 11px;
      color: var(--color-text-muted);
      margin: 2px 0 0 0;
      font-weight: 600;
    }

    /* Summary KPI Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }

    .kpi-card {
      background-color: var(--bg-light);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px 12px;
      text-align: left;
    }

    .kpi-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
    }

    .kpi-value {
      font-size: 15px;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 0;
    }

    .kpi-subtext {
      font-size: 9px;
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    /* Two Columns Breakdown */
    .columns-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 18px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-secondary);
      border-bottom: 1.5px solid var(--border-color);
      padding-bottom: 4px;
      margin-top: 0;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    .stats-table th, .stats-table td {
      padding: 5px 8px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    .stats-table th {
      font-weight: 700;
      color: var(--color-text-muted);
      background-color: var(--bg-light);
    }

    .stats-table td.amount {
      text-align: right;
      font-weight: 700;
    }

    .stats-table th.amount {
      text-align: right;
    }

    /* Detailed Orders Table */
    .detailed-orders {
      margin-top: 15px;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-top: 6px;
    }

    .orders-table th, .orders-table td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--border-color);
      text-align: left;
    }

    .orders-table th {
      background-color: var(--bg-light);
      font-weight: 700;
      color: var(--color-text-main);
    }

    .orders-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .orders-table td.total-col {
      font-weight: 700;
      color: var(--color-primary);
      text-align: right;
    }

    .product-list-cell {
      max-width: 280px;
      word-wrap: break-word;
    }

    .product-item-desc {
      display: inline-block;
      background: #f5f5f4;
      padding: 1px 4px;
      border-radius: 3px;
      margin: 1px;
      font-size: 8.5px;
      color: var(--color-text-main);
      border: 1px solid #e7e5e4;
    }

    .badge-src {
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }

    .badge-src.magasin {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-src.online {
      background: #dcfce7;
      color: #166534;
    }

    .footer {
      text-align: center;
      font-size: 9px;
      color: var(--color-text-muted);
      border-top: 1px solid var(--border-color);
      margin-top: 25px;
      padding-top: 12px;
    }

    /* Action bar for screen view only */
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 15px;
    }

    .print-btn {
      background-color: var(--color-primary);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
    }

    .close-btn {
      background-color: #78716c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="print-btn" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
    <button class="close-btn" onclick="window.close()">Fermer</button>
  </div>

  <div class="header">
    <div class="logo-container">
      <img class="logo-img" src="${logoUrl}" alt="Logo" onerror="this.style.display='none'">
      <div class="brand-text">
        <h1 class="brand-name">Coopérative Bab Mansour</h1>
        <span class="brand-subtitle">Produits Naturels & Bio</span>
      </div>
    </div>
    <div class="report-title-container">
      <h2 class="report-title">Rapport de Revenus</h2>
      <p class="report-date">${monthLabel}</p>
    </div>
  </div>

  <div class="summary-grid">
    <div class="kpi-card">
      <div class="kpi-label">Revenu Total</div>
      <div class="kpi-value" style="color: var(--color-primary);">${formatCurrency(totalRevenue)}</div>
      <div class="kpi-subtext">Ventes nettes du mois</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Commandes Effectuées</div>
      <div class="kpi-value">${totalOrders}</div>
      <div class="kpi-subtext">Commandes livrées/payées</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Panier Moyen</div>
      <div class="kpi-value">${formatCurrency(avgOrderValue)}</div>
      <div class="kpi-subtext">Revenu par commande</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Produit Phare</div>
      <div class="kpi-value" style="font-size: 11px; line-height: 1.2; font-weight: 700;">
        ${topProduct ? topProduct.name : 'N/A'}
      </div>
      <div class="kpi-subtext">${topProduct ? `${topProduct.quantity} unités (${formatCurrency(topProduct.total)})` : 'Aucun produit'}</div>
    </div>
  </div>

  <div class="columns-grid">
    <div class="avoid-break">
      <h3 class="section-title">Revenu par Canal de Vente</h3>
      <table class="stats-table">
        <thead>
          <tr>
            <th>Canal</th>
            <th style="text-align: center;">Commandes</th>
            <th class="amount">Total Ventes</th>
            <th class="amount">Part (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Boutique / Magasin</strong></td>
            <td style="text-align: center;">${magasinOrders}</td>
            <td class="amount">${formatCurrency(magasinRevenue)}</td>
            <td class="amount">${totalRevenue > 0 ? ((magasinRevenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr>
            <td><strong>En ligne (Site)</strong></td>
            <td style="text-align: center;">${onlineOrders}</td>
            <td class="amount">${formatCurrency(onlineRevenue)}</td>
            <td class="amount">${totalRevenue > 0 ? ((onlineRevenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="avoid-break">
      <h3 class="section-title">Palmarès des Ventes Produits</h3>
      <table class="stats-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th style="text-align: center;">Qte</th>
            <th class="amount">Chiffre d'Affaires</th>
          </tr>
        </thead>
        <tbody>
          ${sortedProducts.slice(0, 5).map((p: any) => `
            <tr>
              <td>${p.name} ${p.size ? `(${p.size})` : ''}</td>
              <td style="text-align: center;">${p.quantity}</td>
              <td class="amount">${formatCurrency(p.total)}</td>
            </tr>
          `).join('')}
          ${sortedProducts.length === 0 ? `<tr><td colspan="3" style="text-align: center; color: var(--color-text-muted);">Aucun produit vendu</td></tr>` : ''}
        </tbody>
      </table>
    </div>
  </div>

  <div class="detailed-orders avoid-break">
    <h3 class="section-title">Détail des Commandes du Mois</h3>
    <table class="orders-table">
      <thead>
        <tr>
          <th style="width: 50px;">Commande</th>
          <th style="width: 150px;">Client</th>
          <th style="width: 80px;">Source</th>
          <th>Produits achetés</th>
          <th style="width: 80px;">Date</th>
          <th class="amount" style="width: 90px; text-align: right;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${this.completedOrders.map((order: any) => `
          <tr>
            <td>#${order.idgroup}</td>
            <td>
              <strong>${order.fullname}</strong>
              ${order.tel ? `<br><span style="color: var(--color-text-muted); font-size: 8.5px;">${order.tel}</span>` : ''}
            </td>
            <td>
              <span class="badge-src ${order.source === 'magasin' ? 'magasin' : 'online'}">
                ${order.source === 'magasin' ? 'Magasin' : 'En ligne'}
              </span>
            </td>
            <td class="product-list-cell">
              ${(order.items || []).map((it: any) => `
                <span class="product-item-desc">${it.name} ${it.taille ? `(${it.taille})` : ''} ×${it.qte}</span>
              `).join(' ')}
            </td>
            <td>${order.to_char}</td>
            <td class="amount total-col" style="text-align: right;">${formatCurrency(Number(order.prix_total) || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer avoid-break">
    <p>Rapport généré automatiquement le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
    } else {
      alert("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les fenêtres pop-up.");
    }
  }
}

