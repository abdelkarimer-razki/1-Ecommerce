import { Component, OnInit } from '@angular/core';
import { commands } from '../backend/commands';
import { users } from '../backend/users';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {
  table:any;
  voidE:boolean=false;
  voidNE:boolean=false;
  combobox:any;
  isEdit:boolean=false;
  table2:any;
  date: string = this.getCurrentMonth();
  isEffectuer:boolean=true;

  // Add Command Modal Properties
  addModalActive: boolean = false;
  productsList: any[] = [];
  sizesList: any[] = [];
  selectedProduct: any = null;
  selectedSizeObj: any = null;
  newCommand: any = {
    fullname: '',
    adress: '',
    tel: '',
    email: '',
    idproducts: 0,
    qte: 1,
    taille: '',
    prix: 0,
    etat: false
  };

  constructor(private dash:DashboardService) {
   }

  getCurrentMonth(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }

  ngOnInit(): void {
    this.chargeTables();
  }

  validChange(adress:any,id:any,qte:Number,idcommande:Number,idprodutss:Number)
  {
    this.dash.changeAdressUser(id,adress).subscribe();
    this.dash.changeQteProduit(idcommande,idprodutss,qte).subscribe();
    this.chargeTables();
    this.search(this.date);
  }
  Edit()
  {
    this.dash.productCombobox().subscribe(data=>{
      this.combobox=data;
    })
  }

  search(date: any)
  {
    if(date == undefined || date === '')
    {
      this.dash.allCommandsN().subscribe(data=>{
        this.table2=data;
        if(data.toString()=="")
        {
          this.voidE=true;
        }
        else
        {
          this.voidE=false;
        }
      })
    }
    else
    {
      this.dash.commandEffectueSearch(date).subscribe(data=>{
        this.table2=data;
        if(data.toString()=="")
        {
          this.voidE=true;
        }
        else
        {
          this.voidE=false;
        }
      });
    }
  }

  chargeTables()
  {
    this.dash.allCommandsE().subscribe(data=>{
      this.table=data;
      if(data.toString()=="")
      {
        this.voidNE=true;
      }
      else
      {
        this.voidNE=false;
      }
    })
  }

  showComNo(){
    setTimeout(() => {
      this.search(this.date);
      this.chargeTables();
    }, 300);
  }
  changeEtatN(){
    this.search(this.date);
    this.chargeTables()
    this.isEffectuer=false
  }
  changeEtatP(){
    this.search(this.date);
    this.chargeTables()
    this.isEffectuer=true
  }
  showmor(a:any){
    var s=document.getElementById(a.toString());
    if(s?.style.display=="none"){
      if(s) s.style.display="block"
    }else
    {
      if(s) s.style.display="none"
    }
  }
  showmodifie(a:String)
  {
    var s=document.getElementById(a.toString());
      if(s) s.style.display="block"
  }
  disable(a:Number){
    var i;
    var s=document.getElementsByClassName("more");
    for(i=0;i<s.length;i++){
      var v=document.getElementById(i.toString());
      if(i!=a){
        if(v?.style.display=="block"){
          if(v) v.style.display="none"
        }
      }
    }
  }
  disableOther(id:any)
  {
    var s=document.getElementById(id.toString());
    if(s?.style.display=="none"){
      if(s) s.style.display="block"
    }else
    {
      if(s) s.style.display="none"
    }
  }

  verifie(i:Number,command:commands,isVerified:boolean)
  {
    if(isVerified==true)
    {
      this.dash.verfieCommande(i,command).subscribe();
    }
    else if(isVerified==false)
    {
      this.dash.unverfiedCommande(i,command).subscribe();
    }
  }

  effectue(i:Number,command:commands,isEffectuer:boolean){
    if(isEffectuer==true)
    {
      this.dash.deeffectueCommande(i,command).subscribe();
    }else if(isEffectuer==false)
    {
      this.dash.effectueCommande(i,command).subscribe();
    }

  }

  // Month navigation helpers
  prevMonth() {
    this.adjustMonth(-1);
  }

  nextMonth() {
    this.adjustMonth(1);
  }

  adjustMonth(offset: number) {
    if (!this.date) {
      this.date = this.getCurrentMonth();
    }
    const [yearStr, monthStr] = this.date.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;

    const date = new Date(year, month);
    date.setMonth(date.getMonth() + offset);

    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    this.date = `${nextY}-${nextM}`;
    this.search(this.date);
  }

  // Manual Command Modal
  openAddModal() {
    this.newCommand = {
      fullname: '',
      adress: '',
      tel: '',
      email: '',
      idproducts: '',
      qte: 1,
      taille: '',
      prix: 0,
      etat: false
    };
    this.selectedProduct = null;
    this.selectedSizeObj = null;
    this.sizesList = [];
    
    this.dash.showproducts().subscribe((data: any) => {
      this.productsList = data;
      this.addModalActive = true;
    });
  }

  closeAddModal() {
    this.addModalActive = false;
  }

  onProductSelect(prodId: any) {
    this.selectedProduct = this.productsList.find(p => Number(p.idproducts) === Number(prodId));
    if (this.selectedProduct) {
      this.newCommand.idproducts = this.selectedProduct.idproducts;
      
      let sizes = this.selectedProduct.sizes || [];
      if (sizes.length === 0) {
        sizes = [];
        if (this.selectedProduct.taille && this.selectedProduct.taille !== '0') {
          sizes.push({ taille: String(this.selectedProduct.taille), prix: Number(this.selectedProduct.prix) });
        }
        if (this.selectedProduct.taille2 && this.selectedProduct.taille2 !== '0') {
          sizes.push({ taille: String(this.selectedProduct.taille2), prix: Number(this.selectedProduct.prix2) });
        }
        if (this.selectedProduct.taille3 && this.selectedProduct.taille3 !== '0') {
          sizes.push({ taille: String(this.selectedProduct.taille3), prix: Number(this.selectedProduct.prix3) });
        }
      }
      this.sizesList = sizes;
      
      if (this.sizesList.length > 0) {
        this.selectedSizeObj = this.sizesList[0];
        this.onSizeSelect(this.selectedSizeObj);
      } else {
        this.selectedSizeObj = null;
        this.newCommand.taille = '';
        this.newCommand.prix = 0;
      }
    }
  }

  onSizeSelect(sizeObj: any) {
    if (sizeObj) {
      this.newCommand.taille = sizeObj.taille;
      this.newCommand.prix = sizeObj.prix;
    }
  }

  submitManualCommand() {
    if (!this.newCommand.fullname || !this.newCommand.tel || !this.newCommand.idproducts) {
      alert("Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Produit).");
      return;
    }
    
    this.dash.addManualCommand(this.newCommand).subscribe((res: any) => {
      this.closeAddModal();
      this.chargeTables();
      this.search(this.date);
    }, (err) => {
      console.error(err);
      alert("Erreur lors de l'ajout de la commande.");
    });
  }
}
