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
  date:any;
  isEffectuer:boolean=true
  constructor(private dash:DashboardService) {
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

  search(date:Date)
  {
    if(date==undefined)
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
    else if(date!=undefined)
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
}
