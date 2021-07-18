import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isDashboard:boolean=false;
  isCommands:boolean=false;
  isProduits:boolean=false;
  isUsers:boolean=false;

  constructor(private route:Router,private router:ActivatedRoute) {
    route.events.subscribe((val)=>{
      if(this.route.url=="/admin/commands"){
        this.IsCommands()
      }else if(this.route.url=="/admin/dashboard"){
        this.IsDashboard();
      }else if(this.route.url=="/admin/users"){
        this.IsUsers();
      }else if(this.route.url=="/admin/products"){
        this.IsProduits();
      }

    })
   }

  ngOnInit(): void {
    this.route.navigate(["/admin/dashboard"]);
  }
  IsDashboard(){
    this.isDashboard=true;
    this.isCommands=false;
    this.isProduits=false;
    this.isUsers=false;
  }
  IsCommands(){
    this.isDashboard=false;
    this.isCommands=true;
    this.isProduits=false;
    this.isUsers=false;
  }
  IsProduits(){
    this.isDashboard=false;
    this.isCommands=false;
    this.isProduits=true;
    this.isUsers=false;
  }
  IsUsers(){
    this.isDashboard=false;
    this.isCommands=false;
    this.isProduits=false;
    this.isUsers=true;
  }
}
