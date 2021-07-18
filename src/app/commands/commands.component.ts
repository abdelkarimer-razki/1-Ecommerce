import { Component, OnInit } from '@angular/core';
import { commands } from '../backend/commands';
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
  table2:any;
  showMore:boolean=false;
  isEffectuer:boolean=true
  constructor(private dash:DashboardService) {
   }

  ngOnInit(): void {
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
  showComNo(){
    setTimeout(() => {
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
      });
      this.dash.allCommandsN().subscribe(data=>{
        this.table2=data
        if(data.toString()=="")
        {
          this.voidE=true;
        }
        else
        {
          this.voidE=false;
        }
      });
    }, 300);
  }
  changeEtatN(){
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
    this.dash.allCommandsN().subscribe(data=>{
      this.table2=data
      if(data.toString()=="")
      {
        this.voidE=true;
      }
      else
      {
        this.voidE=false;
      }
    })
    this.isEffectuer=false
  }
  changeEtatP(){
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
    this.dash.allCommandsN().subscribe(data=>{
      this.table2=data
      if(data.toString()=="")
      {
        this.voidE=true;
      }
      else
      {
        this.voidE=false;
      }
    })
    this.isEffectuer=true
  }
  showmor(a:Number){
    var s=document.getElementById(a.toString());
    if(s?.style.display=="none"){
      if(s) s.style.display="block"
    }else
    {
      if(s) s.style.display="none"
    }
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
