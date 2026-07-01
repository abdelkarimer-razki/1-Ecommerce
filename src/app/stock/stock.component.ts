import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  loading: boolean = true;
  productsList: any[] = []; // Grouped by product
  
  // Search & Pagination
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Track expanded products
  expandedProducts: Set<number> = new Set<number>();

  // Modal for adding a new batch
  batchModalActive: boolean = false;
  selectedSize: any = null;
  selectedProduct: any = null;
  newBatch = {
    quantity: 1,
    unit_cost: 0
  };
  batchFormSubmitted: boolean = false;

  constructor(
    private dash: DashboardService,
    private titleService: Title,
    public trans: TranslationService,
    private notifier: NotifierService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('STOCK_BATCHES') || 'Gestion des Stocks');
    this.loadStock();
  }

  loadStock() {
    this.loading = true;
    this.dash.getStockBatches().subscribe(
      (data) => {
        // Group sizes/batches by product
        const groupedMap = new Map<number, any>();
        for (const item of data) {
          if (!groupedMap.has(item.idproducts)) {
            groupedMap.set(item.idproducts, {
              idproducts: item.idproducts,
              product_name: item.product_name,
              product_picture: item.product_picture,
              name_en: item.name_en,
              name_ar: item.name_ar,
              categorie: item.categorie,
              sizes: []
            });
          }
          groupedMap.get(item.idproducts).sizes.push({
            idsize: item.idsize,
            taille: item.taille,
            prix: item.prix,
            stock: item.stock,
            buying_cost: item.buying_cost,
            total_stock: item.total_stock,
            batches: item.batches
          });
        }
        
        this.productsList = Array.from(groupedMap.values());
        
        // Auto-expand if only one product is in the list
        if (this.productsList.length === 1) {
          this.expandedProducts.add(this.productsList[0].idproducts);
        }
        
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching stock batches:', error);
        this.loading = false;
      }
    );
  }

  toggleExpand(productId: number) {
    if (this.expandedProducts.has(productId)) {
      this.expandedProducts.delete(productId);
    } else {
      this.expandedProducts.add(productId);
    }
  }

  isExpanded(productId: number): boolean {
    return this.expandedProducts.has(productId);
  }

  openAddBatchModal(size: any, product: any) {
    this.selectedSize = size;
    this.selectedProduct = product;
    this.newBatch = {
      quantity: 10,
      unit_cost: Math.round(Number(size.prix) * 0.5) // Guessing 50% price as cost default
    };
    this.batchFormSubmitted = false;
    this.batchModalActive = true;
  }

  closeAddBatchModal() {
    this.batchModalActive = false;
    this.selectedSize = null;
    this.selectedProduct = null;
  }

  submitAddBatch() {
    this.batchFormSubmitted = true;
    if (!this.selectedSize || this.newBatch.quantity <= 0 || this.newBatch.unit_cost < 0) {
      return;
    }

    const payload = {
      idsize: this.selectedSize.idsize,
      quantity: this.newBatch.quantity,
      unit_cost: this.newBatch.unit_cost
    };

    this.dash.addStockBatch(payload).subscribe(
      () => {
        this.notifier.notify('success', this.trans.t('LOT_STOCK_AJOUTE') || 'Lot de stock ajouté avec succès');
        this.closeAddBatchModal();
        this.loadStock();
      },
      (error) => {
        console.error('Error adding stock batch:', error);
        this.notifier.notify('error', 'Erreur lors de l\'ajout du lot');
      }
    );
  }

  deleteBatch(batch: any) {
    if (confirm(this.trans.t('CONFIRM_DELETE_BATCH') || 'Êtes-vous sûr de vouloir supprimer ce lot de stock ?')) {
      this.dash.deleteStockBatch(batch.idbatch).subscribe(
        () => {
          this.notifier.notify('success', this.trans.t('LOT_STOCK_SUPPRIME') || 'Lot supprimé avec succès');
          this.loadStock();
        },
        (error) => {
          console.error('Error deleting stock batch:', error);
          this.notifier.notify('error', 'Erreur lors de la suppression');
        }
      );
    }
  }

  getAverageUnitCost(batches: any[]): number {
    const active = batches.filter(b => b.remaining_qty > 0);
    if (active.length === 0) return 0;
    const totalQty = active.reduce((sum, b) => sum + b.remaining_qty, 0);
    const totalVal = active.reduce((sum, b) => sum + (b.remaining_qty * b.unit_cost), 0);
    return totalQty > 0 ? (totalVal / totalQty) : 0;
  }

  getProductGlobalStock(product: any): number {
    if (!product.sizes) return 0;
    return product.sizes.reduce((sum: number, size: any) => sum + (Number(size.total_stock) || 0), 0);
  }

  transform(pic: string) {
    if (!pic) return null;
    var re = /kigmfhhh/gi;
    var pic1 = pic.replace(re, "/");
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  getPaginatedProducts(): any[] {
    let list = this.productsList;
    
    if (this.searchText && this.searchText.trim() !== '') {
      const term = this.searchText.toLowerCase().trim();
      list = list.filter(item => 
        (item.product_name && item.product_name.toLowerCase().includes(term)) ||
        (item.categorie && item.categorie.toLowerCase().includes(term)) ||
        item.sizes.some((s: any) => s.taille && s.taille.toLowerCase().includes(term))
      );
    }
    
    this.totalPages = Math.ceil(list.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
