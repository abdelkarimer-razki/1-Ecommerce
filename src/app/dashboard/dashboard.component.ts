import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  specialEvents:any = []
  constructor( private dash:DashboardService,private _router: Router) { }
  ngOnInit(): void {
    this.dash.RouterHere().subscribe(
      res => this.specialEvents=res,
      err=>{
        if(err){
          this._router.navigate(["/connexion"]);
        }
      }
    )
  }

}
