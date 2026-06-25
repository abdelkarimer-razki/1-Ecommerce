import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';
import { DomSanitizer } from '@angular/platform-browser';
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

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  loading: boolean = true;
  statsData: any = null;
  currentYear: number = new Date().getFullYear();
  selectedPeriod: string = 'all'; // 'today' | 'month' | 'all'

  public categoryRevenueChart: any = null;
  public seasonalityChart: any = null;

  constructor(
    private dash: DashboardService,
    private titleService: Title,
    public trans: TranslationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('STATS_PRODUITS') || 'Statistiques');
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.dash.getProductStats(this.selectedPeriod).subscribe(
      (data) => {
        this.statsData = data;
        this.loading = false;
        setTimeout(() => {
          this.renderCharts();
        }, 150);
      },
      (error) => {
        console.error('Error fetching product stats:', error);
        this.loading = false;
      }
    );
  }

  setPeriod(period: string) {
    this.selectedPeriod = period;
    this.loadStats();
  }

  renderCharts() {
    if (!this.statsData) return;

    // Register Chart.js elements
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

    // Destroy existing instances if refreshing
    if (this.categoryRevenueChart) this.categoryRevenueChart.destroy();
    if (this.seasonalityChart) this.seasonalityChart.destroy();

    // 1. Doughnut Chart: Category Revenue Split
    const catCanvas: any = document.getElementById('categoryRevenueChart');
    if (catCanvas) {
      const catCtx = catCanvas.getContext('2d');
      const labels = this.statsData.categoryRevenue.map((cr: any) => this.trans.t(cr.categorie));
      const revenues = this.statsData.categoryRevenue.map((cr: any) => parseFloat(cr.revenue));

      // Curated Moroccan themed palette (amber, olive green, terracotta, slate, cyan)
      const colors = ['#b45309', '#4d7c0f', '#c2410c', '#78716c', '#06b6d4'];

      this.categoryRevenueChart = new Chart(catCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: revenues,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: '600' },
                color: '#444444'
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const val = context.raw as number;
                  return ` ${context.label}: ${new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val)}`;
                }
              }
            }
          }
        }
      });
    }
    // 2. Line Chart: Category Sales Trends (Seasonality & dynamic grouping)
    const trendsCanvas: any = document.getElementById('seasonalityChart');
    if (trendsCanvas) {
      const trendsCtx = trendsCanvas.getContext('2d');

      let displayLabels: string[] = [];
      const uniqueCats = Array.from(new Set(this.statsData.monthlyTrends.map((t: any) => t.categorie)));

      // Color maps for lines
      const catColors: { [cat: string]: string } = {
        'MIEL': '#b45309',    // Amber/Gold
        'HUILE': '#4d7c0f',   // Olive Green
        'DIVERS': '#c2410c'   // Terracotta Orange
      };

      let datasets: any[] = [];

      if (this.statsData.trendType === 'daily' && this.selectedPeriod === 'today') {
        // Daily trends for the last 7 days.
        const dateLabels = Array.from(new Set(this.statsData.monthlyTrends.map((t: any) => t.label))).sort() as string[];
        displayLabels = dateLabels.map(l => {
          const dateObj = new Date(l);
          return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        });

        datasets = uniqueCats.map((catName: any) => {
          const dataPoints = dateLabels.map(l => {
            const match = this.statsData.monthlyTrends.find((t: any) => t.categorie === catName && t.label === l);
            return match ? match.total_qty : 0;
          });
          const color = catColors[catName] || '#64748b';
          return {
            label: this.trans.t(catName),
            data: dataPoints,
            borderColor: color,
            backgroundColor: color + '15',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6
          };
        });
      } else if (this.statsData.trendType === 'daily' && this.selectedPeriod === 'month') {
        // Daily trends for the current month.
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        displayLabels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

        datasets = uniqueCats.map((catName: any) => {
          const dataPoints = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const match = this.statsData.monthlyTrends.find((t: any) => t.categorie === catName && Number(t.label) === day);
            return match ? match.total_qty : 0;
          });
          const color = catColors[catName] || '#64748b';
          return {
            label: this.trans.t(catName),
            data: dataPoints,
            borderColor: color,
            backgroundColor: color + '15',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6
          };
        });
      } else {
        // Monthly trends for the year.
        displayLabels = [
          this.trans.t('JANVIER'), this.trans.t('FEVRIER'), this.trans.t('MARS'),
          this.trans.t('AVRIL'), this.trans.t('MAI'), this.trans.t('JUIN'),
          this.trans.t('JUILLET'), this.trans.t('AOUT'), this.trans.t('SEPTEMBRE'),
          this.trans.t('OCTOBRE'), this.trans.t('NOVEMBRE'), this.trans.t('DECEMBRE')
        ];

        datasets = uniqueCats.map((catName: any) => {
          const dataPoints = Array(12).fill(0);
          this.statsData.monthlyTrends
            .filter((t: any) => t.categorie === catName)
            .forEach((t: any) => {
              const mIndex = Number(t.label) - 1;
              if (mIndex >= 0 && mIndex < 12) {
                dataPoints[mIndex] = t.total_qty;
              }
            });

          const color = catColors[catName] || '#64748b';
          return {
            label: this.trans.t(catName),
            data: dataPoints,
            borderColor: color,
            backgroundColor: color + '15',
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6
          };
        });
      }

      this.seasonalityChart = new Chart(trendsCtx, {
        type: 'line',
        data: {
          labels: displayLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: '600' },
                color: '#444444'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  const val = context.raw as number;
                  return ` ${context.dataset.label}: ${val} ${this.trans.isRtl() ? 'وحدة' : 'unités'}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, weight: '600' } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(231, 229, 228, 0.7)' },
              ticks: {
                font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
                callback: (value) => value + ' ' + (this.trans.isRtl() ? 'و.' : 'ut')
              }
            }
          }
        }
      });
    }
  }

  transformImage(pic: string) {
    if (!pic) return null;
    const re = /kigmfhhh/gi;
    const picSanitized = pic.replace(re, '/');
    return this.sanitizer.bypassSecurityTrustUrl(picSanitized);
  }

  getProductName(item: any): string {
    if (this.trans.getLang() === 'EN' && item.name_en) {
      return item.name_en;
    } else if (this.trans.getLang() === 'AR' && item.name_ar) {
      return item.name_ar;
    }
    return item.name;
  }
}
