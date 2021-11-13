import { Component, OnInit  } from '@angular/core';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Filler,
  Legend,
  Tooltip
} from 'chart.js';
import { DashboardService } from '../services/dashboard.service';
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})



export class DashboardComponent implements OnInit {
  private readonly notifier: NotifierService;
  specialEvents:any = []
  commandNb:Number=0;
  revenuNb:Number=0;
  visitsNb:Number=0;
  usersNb:Number=0;
  janvier:any=0
  fevrier:any=0;
  mars:any=0
  april:any=0;
  may:any=0
  juin:any=0;
  juilet:any=0
  aout:any=0;
  septembre:any=0
  octobre:any=0;
  novombre:any=0
  decembre:any=0;

  public canvas : any;
  public ctx:any;
  public chartColor:any;
  public chartEmail:any;
  public chartHours:any;

  constructor( private dash:DashboardService,private _router: Router,private titleService:Title,notifierService: NotifierService) {
    this.notifier = notifierService;
   }

  ngOnInit(): void {
    this.dataChart();
    Chart.register(
      ArcElement,
      LineElement,
      BarElement,
      PointElement,
      BarController,
      BubbleController,
      DoughnutController,
      LineController,
      PieController,
      PolarAreaController,
      RadarController,
      ScatterController,
      CategoryScale,
      LinearScale,
      LogarithmicScale,
      RadialLinearScale,
      TimeScale,
      TimeSeriesScale,
      Filler,
      Legend,
      Tooltip
    );
    this.topDashboard();
    setInterval(() => {
      this.topDashboard();
    }, 10000);
    this.titleService.setTitle("Dashboard");
    /*this.notifier.show({
      type:'success',
      message: 'You are awesome! I mean it!',
      id: 'THAT_NOTIFICATION_ID', // Again, this is optional
    });*/

    this.canvas = document.getElementById("myChart");
    this.ctx = this.canvas.getContext("2d");
    setTimeout(() => {
      this.dataChart()
      this.fillchart()
    },1000);
  }
  fillchart()
  {
    var myChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
          labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
          datasets: [{
              label: 'Revenu mensuel/DH',
              data: [this.janvier, this.fevrier, this.mars, this.april, this.may, this.juin,this.juilet,this.aout,this.septembre,this.octobre,this.novombre,this.decembre],
              backgroundColor: [
                  '#FF8484',
                  '#B6DDFC',
                  '#FFBE6D',
                  '#FFD503',
                  '#E2E0E3',
                  '#90EE90',
                  '#FFD8DD',
                  '#3F9CB8',
                  '#FFBE6D',
                  '#FFD503',
                  '#E2E0E3',
                  '#90EE90'
              ],
              borderColor: [
                '#F17E5D',
                '#B6DDFC',
                '#FCC468',
                '#FFD503',
                '#E2E0E3',
                '#90EE90'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
  }
  dataChart(){
    this.dash.revenuMois(1).subscribe(data=>this.janvier=data)
    this.dash.revenuMois(2).subscribe(data=>this.fevrier=data)
    this.dash.revenuMois(3).subscribe(data=>this.mars=data)
    this.dash.revenuMois(4).subscribe(data=>this.april=data)
    this.dash.revenuMois(5).subscribe(data=>this.may=data)
    this.dash.revenuMois(6).subscribe(data=>this.juin=data)
    this.dash.revenuMois(7).subscribe(data=>this.juilet=data)
    this.dash.revenuMois(8).subscribe(data=>this.aout=data)
    this.dash.revenuMois(9).subscribe(data=>this.septembre=data)
    this.dash.revenuMois(10).subscribe(data=>this.octobre=data)
    this.dash.revenuMois(11).subscribe(data=>this.novombre=data)
    this.dash.revenuMois(12).subscribe(data=>this.decembre=data)
  }
  topDashboard(){
    this.users();
    this.revenu();
    this.visits();
    this.commnads();
  }
  commnads(){
    this.dash.RouterHere().subscribe(
      res =>{
        this.commandNb=res.length;
      },
      err=>{
        if(err){
          localStorage.clear();
        }
      }
    )
  }
  visits(){
    this.dash.Vistis().subscribe(

      data=>{
      this.visitsNb=data},
      err=>{
        if(err){
        localStorage.clear();
      }}
      )
  }
  revenu(){
    this.dash.revenu().subscribe(data=>{
    this.revenuNb=data},
    err=>{
      if(err){
      localStorage.clear();
    }})
  }
  users(){
    this.dash.users().subscribe(data=>{
    this.usersNb=data},
    err=>{
      if(err){
      localStorage.clear();
    }})
  }

  showCommnads(){
    this._router.navigate(["admin/commands"])
  }
  showUsers(){
    this._router.navigate(["admin/users"])
  }

}
