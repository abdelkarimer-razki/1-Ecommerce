import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-whatsapp',
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.css']
})
export class WhatsappComponent implements OnInit {
  apiUrl = environment.apiUrl;

  // Connection status
  connected: boolean = false;
  statusLoading: boolean = true;
  statusError: string = '';

  // Clients list (from DB)
  clients: any[] = [];
  clientsLoading: boolean = false;

  // Single send
  singlePhone: string = '';
  singleMessage: string = '';
  sendingOne: boolean = false;
  sendOneResult: any = null;

  // Bulk send
  selectedPhones: Set<string> = new Set();
  bulkMessage: string = '';
  sendingBulk: boolean = false;
  bulkResults: any[] = [];
  selectAll: boolean = false;

  // UI tabs
  activeTab: string = 'single'; // 'single' | 'bulk' | 'clients'

  constructor(private http: HttpClient, public trans: TranslationService) {}

  ngOnInit(): void {
    this.checkStatus();
    this.loadClients();
  }

  checkStatus() {
    this.statusLoading = true;
    this.statusError = '';
    this.http.get<any>(this.apiUrl + 'api/whatsapp/status').subscribe(
      (data) => {
        this.connected = data.connected;
        this.statusLoading = false;
        if (!data.connected) {
          this.statusError = data.error || 'WhatsApp session not connected.';
        }
      },
      (err) => {
        this.connected = false;
        this.statusLoading = false;
        this.statusError = 'Cannot reach OpenWA server. Make sure it is running.';
      }
    );
  }

  loadClients() {
    this.clientsLoading = true;
    this.http.get<any[]>(this.apiUrl + 'users-list').subscribe(
      (data) => {
        this.clients = (data || []).filter(u => u.tel && u.tel.length >= 8);
        this.clientsLoading = false;
      },
      () => { this.clientsLoading = false; }
    );
  }

  sendOne() {
    if (!this.singlePhone || !this.singleMessage) return;
    this.sendingOne = true;
    this.sendOneResult = null;
    this.http.post<any>(this.apiUrl + 'api/whatsapp/send', {
      phone: this.singlePhone,
      message: this.singleMessage
    }).subscribe(
      (data) => {
        this.sendOneResult = { success: true };
        this.sendingOne = false;
      },
      (err) => {
        this.sendOneResult = { success: false, error: err.error?.error || 'Failed to send' };
        this.sendingOne = false;
      }
    );
  }

  togglePhone(phone: string) {
    if (this.selectedPhones.has(phone)) {
      this.selectedPhones.delete(phone);
    } else {
      this.selectedPhones.add(phone);
    }
    this.selectAll = this.selectedPhones.size === this.clients.length;
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.clients.forEach(c => this.selectedPhones.add(c.tel));
    } else {
      this.selectedPhones.clear();
    }
  }

  isSelected(phone: string): boolean {
    return this.selectedPhones.has(phone);
  }

  sendBulk() {
    if (this.selectedPhones.size === 0 || !this.bulkMessage) return;
    this.sendingBulk = true;
    this.bulkResults = [];
    this.http.post<any>(this.apiUrl + 'api/whatsapp/send-bulk', {
      phones: Array.from(this.selectedPhones),
      message: this.bulkMessage
    }).subscribe(
      (data) => {
        this.bulkResults = data.results || [];
        this.sendingBulk = false;
      },
      (err) => {
        this.sendingBulk = false;
        this.bulkResults = [{ phone: 'All', success: false, error: 'Request failed' }];
      }
    );
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.sendOneResult = null;
    this.bulkResults = [];
  }

  prefillPhone(tel: string) {
    this.singlePhone = tel;
    this.activeTab = 'single';
  }

  get successCount(): number {
    return this.bulkResults.filter(r => r.success).length;
  }

  get failCount(): number {
    return this.bulkResults.filter(r => !r.success).length;
  }
}
