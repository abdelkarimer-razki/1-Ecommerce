import { Component, OnInit  } from '@angular/core';
import { forkJoin } from 'rxjs';
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
import { TranslationService } from '../services/translation.service';

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
  categoriesNb:Number=0;
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
  novombre:any=0;
  decembre:any=0;

  // Year navigation and chart state
  selectedYear: number = new Date().getFullYear();
  public myChart: any = null;
  loadingChart: boolean = false;

  public canvas : any;
  public ctx:any;
  public chartColor:any;
  public chartEmail:any;
  public chartHours:any;

  constructor( private dash:DashboardService,private _router: Router,private titleService:Title,notifierService: NotifierService, public trans: TranslationService) {
    this.notifier = notifierService;
   }

  ngOnInit(): void {
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
    this.titleService.setTitle(this.trans.t('DASHBOARD'));
    /*this.notifier.show({
      type:'success',
      message: 'You are awesome! I mean it!',
      id: 'THAT_NOTIFICATION_ID', // Again, this is optional
    });*/

    this.canvas = document.getElementById("myChart");
    this.ctx = this.canvas.getContext("2d");
    this.dataChart(this.selectedYear);
  }
  fillchart()
  {
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Create modern linear gradient matching the organic honey/oil brand colors
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(180, 83, 9, 0.85)'); // Honey Gold/Amber (var(--color-primary))
    gradient.addColorStop(1, 'rgba(194, 65, 12, 0.15)'); // Terracotta translucent (var(--color-terracotta))

    const borderGradient = this.ctx.createLinearGradient(0, 0, 0, 300);
    borderGradient.addColorStop(0, 'rgba(180, 83, 9, 1)');
    borderGradient.addColorStop(1, 'rgba(194, 65, 12, 0.5)');

    this.myChart = new Chart(this.ctx, {
      type: 'bar',
      data: {
          labels: [
            this.trans.t('JANVIER'),
            this.trans.t('FEVRIER'),
            this.trans.t('MARS'),
            this.trans.t('AVRIL'),
            this.trans.t('MAI'),
            this.trans.t('JUIN'),
            this.trans.t('JUILLET'),
            this.trans.t('AOUT'),
            this.trans.t('SEPTEMBRE'),
            this.trans.t('OCTOBRE'),
            this.trans.t('NOVEMBRE'),
            this.trans.t('DECEMBRE')
          ],
          datasets: [{
              label: this.trans.t('REVENU_MENSUEL'),
              data: [this.janvier, this.fevrier, this.mars, this.april, this.may, this.juin,this.juilet,this.aout,this.septembre,this.octobre,this.novombre,this.decembre],
              backgroundColor: gradient,
              borderColor: borderGradient,
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: 'rgba(180, 83, 9, 0.95)',
              hoverBorderColor: 'rgba(180, 83, 9, 1)',
              barPercentage: 0.6,
              categoryPercentage: 0.8
          }]
      },
      options: {
          onClick: (event, elements) => {
              if (elements && elements.length > 0) {
                  const index = elements[0].index;
                  const month = index + 1;
                  const targetDate = `${this.selectedYear}-${String(month).padStart(2, '0')}`;
                  this._router.navigate(['admin/commands'], { queryParams: { date: targetDate } });
              }
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  display: false
              },
              tooltip: {
                  backgroundColor: '#292524', // stone-800
                  titleFont: {
                      family: 'Plus Jakarta Sans, sans-serif',
                      size: 14,
                      weight: 'bold'
                  },
                  bodyFont: {
                      family: 'Plus Jakarta Sans, sans-serif',
                      size: 13
                  },
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: false,
                  callbacks: {
                      label: (context) => {
                          let label = context.dataset.label || '';
                          if (label) {
                              label += ' : ';
                          }
                          if (context.parsed.y !== null) {
                              label += new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(context.parsed.y);
                          }
                          return label;
                      }
                  }
              }
          },
          scales: {
              x: {
                  grid: {
                      display: false
                  },
                  ticks: {
                      font: {
                          family: 'Plus Jakarta Sans, sans-serif',
                          size: 11,
                          weight: '600'
                      },
                      color: '#78716c' // stone-500
                  }
              },
              y: {
                  beginAtZero: true,
                  grid: {
                      color: 'rgba(231, 229, 228, 0.8)', // warm-gray-200
                      drawBorder: false
                  },
                  ticks: {
                      font: {
                          family: 'Plus Jakarta Sans, sans-serif',
                          size: 11
                      },
                      color: '#78716c',
                      callback: (value) => {
                          return value + ' ' + (this.trans.isRtl() ? 'د.م.' : 'DH');
                      }
                  }
              }
          }
      }
    });
  }
  dataChart(year: number) {
    this.loadingChart = true;
    forkJoin([
      this.dash.revenuMois(1, year),
      this.dash.revenuMois(2, year),
      this.dash.revenuMois(3, year),
      this.dash.revenuMois(4, year),
      this.dash.revenuMois(5, year),
      this.dash.revenuMois(6, year),
      this.dash.revenuMois(7, year),
      this.dash.revenuMois(8, year),
      this.dash.revenuMois(9, year),
      this.dash.revenuMois(10, year),
      this.dash.revenuMois(11, year),
      this.dash.revenuMois(12, year)
    ]).subscribe(results => {
      this.janvier = results[0] || 0;
      this.fevrier = results[1] || 0;
      this.mars = results[2] || 0;
      this.april = results[3] || 0;
      this.may = results[4] || 0;
      this.juin = results[5] || 0;
      this.juilet = results[6] || 0;
      this.aout = results[7] || 0;
      this.septembre = results[8] || 0;
      this.octobre = results[9] || 0;
      this.novombre = results[10] || 0;
      this.decembre = results[11] || 0;
      
      this.loadingChart = false;
      this.fillchart();
    }, err => {
      console.error(err);
      this.loadingChart = false;
    });
  }

  prevYear() {
    this.selectedYear--;
    this.dataChart(this.selectedYear);
  }

  nextYear() {
    this.selectedYear++;
    this.dataChart(this.selectedYear);
  }
  topDashboard(){
    this.categories();
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
  categories(){
    this.dash.getAllCategories().subscribe(data=>{
    this.categoriesNb=data.length},
    err=>{
      if(err){
      localStorage.clear();
    }})
  }

  showCommnads(){
    this._router.navigate(["admin/commands"])
  }
  showCategories(){
    this._router.navigate(["admin/categories"])
  }

}
