import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser';
import { AuthGuard } from '../auth.guard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  specialEvents:any = []
  constructor( private dash:DashboardService,private _router: Router,private titleService:Title) { }
  ngOnInit(): void {
    this.titleService.setTitle("Dashboard");
    this.dash.RouterHere().subscribe(
      res =>{
        this.specialEvents=res
      },
      err=>{
        if(err){
           localStorage.clear();
          this._router.navigate(["/connexion"]);
        }
      }
    )
  }

}
