import { Component, OnInit } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { products } from '../backend/products';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  produits: any;
  loading: boolean = true;
  myimage: any;
  
  // Modal states
  modalActive: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  
  product: products = {idproducts:0,name:"",picture:"",description:"",prix:0,categorie:"null",mangable:false,prixf:0,taille:"0",taille2:"0",taille3:"0",prix2:0,prix3:0,sizes:[]};
  editingProduct: products = {idproducts:0,name:"",picture:"",description:"",prix:0,categorie:"null",mangable:false,prixf:0,taille:"0",taille2:"0",taille3:"0",prix2:0,prix3:0,sizes:[]};
  
  showNewCategoryInput: boolean = false;
  newCategoryName: string = '';
  originalImage: string = '';
  toleranceThreshold: number = 35;
  
  viewModalActive: boolean = false;
  viewedProduct: products | null = null;
  
  deleteModalActive: boolean = false;
  deletingProduct: products | null = null;
  
  more: Boolean[] = [];
  details: Boolean[] = [];
  pname: any = "";

  constructor(private sanitizer: DomSanitizer, private dash: DashboardService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.dash.showproducts().subscribe(data => {
      this.produits = data;
      this.loading = false;
    });
  }

  openAddModal() {
    this.modalMode = 'add';
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.originalImage = '';
    this.toleranceThreshold = 35;
    this.product = {
      idproducts: 0,
      name: "",
      picture: "",
      description: "",
      prix: 0,
      categorie: "MIEL",
      mangable: true,
      prixf: 0,
      taille: "0",
      taille2: "0",
      taille3: "0",
      prix2: 0,
      prix3: 0,
      sizes: [{ taille: '', prix: 0 }]
    };
    this.myimage = '';
    this.modalActive = true;
  }

  openEditModal(prod: any) {
    this.modalMode = 'edit';
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.toleranceThreshold = 35;
    this.editingProduct = JSON.parse(JSON.stringify(prod));
    
    if (!this.editingProduct.sizes || this.editingProduct.sizes.length === 0) {
      this.editingProduct.sizes = [];
      if (this.editingProduct.taille && this.editingProduct.taille !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille), prix: Number(this.editingProduct.prix) });
      }
      if (this.editingProduct.taille2 && this.editingProduct.taille2 !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille2), prix: Number(this.editingProduct.prix2) });
      }
      if (this.editingProduct.taille3 && this.editingProduct.taille3 !== '0') {
        this.editingProduct.sizes.push({ taille: String(this.editingProduct.taille3), prix: Number(this.editingProduct.prix3) });
      }
    }
    if (this.editingProduct.sizes.length === 0) {
      this.editingProduct.sizes.push({ taille: '', prix: 0 });
    }

    var re = /kigmfhhh/gi;
    this.myimage = this.editingProduct.picture ? this.editingProduct.picture.replace(re, "/") : '';
    this.originalImage = this.myimage;
    this.modalActive = true;
  }

  closeModal() {
    this.modalActive = false;
  }

  openViewModal(prod: any) {
    this.viewedProduct = JSON.parse(JSON.stringify(prod));
    
    if (this.viewedProduct && (!this.viewedProduct.sizes || this.viewedProduct.sizes.length === 0)) {
      this.viewedProduct.sizes = [];
      if (this.viewedProduct.taille && this.viewedProduct.taille !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille), prix: Number(this.viewedProduct.prix) });
      }
      if (this.viewedProduct.taille2 && this.viewedProduct.taille2 !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille2), prix: Number(this.viewedProduct.prix2) });
      }
      if (this.viewedProduct.taille3 && this.viewedProduct.taille3 !== '0') {
        this.viewedProduct.sizes.push({ taille: String(this.viewedProduct.taille3), prix: Number(this.viewedProduct.prix3) });
      }
    }
    
    this.viewModalActive = true;
  }

  closeViewModal() {
    this.viewModalActive = false;
    this.viewedProduct = null;
  }

  activeProduct(): products {
    return this.modalMode === 'add' ? this.product : this.editingProduct;
  }

  getCategories(): string[] {
    if (!this.produits) return ['MIEL', 'HUILE'];
    const cats = this.produits
      .map((p: any) => p.categorie)
      .filter((c: any) => c && c !== 'null' && c !== 'DIVERS');
    return Array.from(new Set(['MIEL', 'HUILE', ...cats]));
  }

  onCategoryChange(val: string) {
    if (val === '_NEW_') {
      this.showNewCategoryInput = true;
      this.newCategoryName = '';
    } else {
      this.showNewCategoryInput = false;
    }
  }

  cancelNewCategory() {
    this.showNewCategoryInput = false;
    this.newCategoryName = '';
    this.activeProduct().categorie = 'MIEL';
  }

  removeBg() {
    if (!this.originalImage) return;
    
    const img = new Image();
    img.src = this.originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Get background color from the first pixel (top-left)
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      const threshold = this.toleranceThreshold;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate Euclidean distance between pixel color and background color
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );
        
        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      this.myimage = canvas.toDataURL('image/png');
    };
  }

  resetBg() {
    if (this.originalImage) {
      this.myimage = this.originalImage;
      this.toleranceThreshold = 35;
    }
  }

  clearImage() {
    this.myimage = '';
    this.originalImage = '';
    this.toleranceThreshold = 35;
  }

  addSizeVariation() {
    const active = this.activeProduct();
    if (!active.sizes) {
      active.sizes = [];
    }
    active.sizes.push({ taille: '', prix: 0 });
  }

  removeSizeVariation(index: number) {
    const active = this.activeProduct();
    if (active.sizes && active.sizes.length > 1) {
      active.sizes.splice(index, 1);
    }
  }

  submitModal() {
    var re = /[/]/gi;
    let finalPic = '';
    if (this.myimage) {
      finalPic = this.myimage.replace(re, "kigmfhhh");
    }

    const active = this.activeProduct();
    active.picture = finalPic;

    if (this.showNewCategoryInput && this.newCategoryName) {
      active.categorie = this.newCategoryName;
    }

    // Fill legacy columns for compatibility
    if (active.sizes) {
      active.taille = active.sizes[0] ? active.sizes[0].taille : '0';
      active.prix = active.sizes[0] ? active.sizes[0].prix : 0;
      active.taille2 = active.sizes[1] ? active.sizes[1].taille : '0';
      active.prix2 = active.sizes[1] ? active.sizes[1].prix : 0;
      active.taille3 = active.sizes[2] ? active.sizes[2].taille : '0';
      active.prix3 = active.sizes[2] ? active.sizes[2].prix : 0;
    }

    if (this.modalMode === 'add') {
      this.dash.addproduct(this.product).subscribe(data => {
        this.modalActive = false;
        this.loadProducts();
      });
    } else {
      this.dash.updateProduct(this.editingProduct).subscribe(data => {
        this.modalActive = false;
        this.loadProducts();
      });
    }
  }

  showmor(a: any) {
    var s = document.getElementById(a.toString());
    if (s?.style.display == "none") {
      if (s) s.style.display = "revert"
    } else {
      if (s) s.style.display = "none"
    }
  }

  turnoff(i: any) {
    for (var j = 0; j < this.details.length; j++) {
      if (i != j) {
        this.details[j] = false;
      }
    }
    for (var j = 0; j < this.more.length; j++) {
      if (i != j) {
        this.more[j] = false;
      }
    }
  }

  disable(a: Number) {
    var i;
    var s = document.getElementsByClassName("more");
    for (i = 0; i < s.length; i++) {
      var v = document.getElementById(i.toString());
      if (i != a) {
        if (v?.style.display != "none") {
          if (v) v.style.display = "none"
        }
      }
    }
  }

  disableD(a: any) {
    var i;
    var s = document.getElementsByClassName("details");
    for (i = 0; i < s.length; i++) {
      var v = document.getElementById(i.toString() + 'a');
      if (i + 'a' != a) {
        if (v?.style.display != "none") {
          if (v) v.style.display = "none"
        }
      }
    }
  }

  onChange($event: Event) {
    const file = ($event.target as HTMLInputElement);
    if (file.files != null && file.files.length > 0)
      this.convertToBase64(file.files[0]);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      this.myimage = d;
      this.originalImage = d;
      this.toleranceThreshold = 35;
    });
  }

  transform(pic: string) {
    if (!pic) return null;
    var re = /kigmfhhh/gi;
    var pic1 = pic.replace(re, "/");
    return this.sanitizer.bypassSecurityTrustUrl(pic1);
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);

    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = (error) => {
      subscriber.error(error);
      subscriber.complete();
    };
  }

  change() {
    if (this.pname == "") {
      this.loadProducts();
    } else {
      this.produits = this.produits.filter(
        (res: any) => {
          return res.name.toLocaleUpperCase().match(this.pname.toLocaleUpperCase());
        }
      );
    }
  }

  confirmDelete(prod: any) {
    this.deletingProduct = prod;
    this.deleteModalActive = true;
  }

  closeDeleteModal() {
    this.deleteModalActive = false;
    this.deletingProduct = null;
  }

  executeDelete() {
    if (this.deletingProduct) {
      this.dash.deleteproduct(this.deletingProduct.idproducts).subscribe(data => {
        this.closeDeleteModal();
        this.loadProducts();
      });
    }
  }

  deletepro(id: any) {
    this.dash.deleteproduct(id).subscribe(data => {
      this.loadProducts();
    });
  }
}
