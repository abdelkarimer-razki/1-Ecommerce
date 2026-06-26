import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
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

  // Filters & search
  searchTerm: string = '';
  clientFilter: 'all' | 'pending' | 'completed' = 'all';

  // Templates
  templates = [
    {
      name: 'Confirmation de commande',
      nameEn: 'Order Confirmation',
      nameAr: 'تأكيد الطلب',
      text: 'Bonjour {name},\n\nNous vous remercions pour votre commande sur Coopérative Bab Mansour. Votre commande est bien confirmée.\n\nCordialement.'
    },
    {
      name: 'Commande expédiée',
      nameEn: 'Order Shipped',
      nameAr: 'تم شحن الطلب',
      text: 'Bonjour {name},\n\nVotre commande de la Coopérative Bab Mansour a été expédiée et est en cours de livraison.\n\nCordialement.'
    },
    {
      name: 'Commande prête',
      nameEn: 'Order Ready',
      nameAr: 'الطلب جاهز',
      text: 'Bonjour {name},\n\nVotre commande est prête à être récupérée.\n\nCordialement.'
    },
    {
      name: 'Message d\'accueil',
      nameEn: 'Greeting Message',
      nameAr: 'رسالة ترحيبية',
      text: 'Bonjour {name},\n\nComment pouvons-nous vous aider aujourd\'hui ?\n\nCoopérative Bab Mansour.'
    }
  ];
  selectedTemplateIndex: string = '';

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

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute,
    public trans: TranslationService
  ) {}

  ngOnInit(): void {
    this.checkStatus();
    this.loadClients();
    
    // Subscribe to query params for quick action navigation
    this.route.queryParams.subscribe(params => {
      if (params['tel']) {
        this.singlePhone = params['tel'].replace(/[^0-9]/g, '');
        this.activeTab = 'single';
        
        const name = params['name'] || '';
        if (name) {
          // Default to greeting template with client name
          this.singleMessage = `Bonjour ${name},\n\n`;
        }
      }
    });
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

  // Get filtered clients list based on search and segment filter
  get filteredClients(): any[] {
    let list = this.clients || [];

    // 1. Status segment filter
    if (this.clientFilter === 'pending') {
      list = list.filter(c => c.pending_orders_count > 0);
    } else if (this.clientFilter === 'completed') {
      list = list.filter(c => c.orders_count > 0 && c.pending_orders_count === 0);
    }

    // 2. Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(c => 
        (c.fname && c.fname.toLowerCase().includes(term)) ||
        (c.lname && c.lname.toLowerCase().includes(term)) ||
        (c.tel && c.tel.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    }

    return list;
  }

  onFilterChange() {
    this.updateSelectAllState();
  }

  onTemplateChange() {
    if (this.selectedTemplateIndex === '') {
      return;
    }
    const idx = parseInt(this.selectedTemplateIndex, 10);
    if (isNaN(idx) || !this.templates[idx]) return;

    const tpl = this.templates[idx];

    if (this.activeTab === 'single') {
      let clientName = '';
      if (this.singlePhone) {
        const client = this.clients.find(c => c.tel.replace(/[^0-9]/g, '') === this.singlePhone.replace(/[^0-9]/g, ''));
        if (client) {
          clientName = `${client.fname} ${client.lname}`.trim();
        }
      }
      this.singleMessage = tpl.text.replace(/{name}/g, clientName || 'Client');
    } else if (this.activeTab === 'bulk') {
      // Bulk templates keep placeholder {name} to resolve during sending
      this.bulkMessage = tpl.text;
    }
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
    this.updateSelectAllState();
  }

  toggleSelectAll() {
    const currentFiltered = this.filteredClients;
    const allFilteredSelected = currentFiltered.every(c => this.selectedPhones.has(c.tel));

    if (allFilteredSelected) {
      // Deselect all currently filtered
      currentFiltered.forEach(c => this.selectedPhones.delete(c.tel));
    } else {
      // Select all currently filtered
      currentFiltered.forEach(c => this.selectedPhones.add(c.tel));
    }
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    const currentFiltered = this.filteredClients;
    if (currentFiltered.length === 0) {
      this.selectAll = false;
    } else {
      this.selectAll = currentFiltered.every(c => this.selectedPhones.has(c.tel));
    }
  }

  isSelected(phone: string): boolean {
    return this.selectedPhones.has(phone);
  }

  sendBulk() {
    if (this.selectedPhones.size === 0 || !this.bulkMessage) return;
    this.sendingBulk = true;
    this.bulkResults = [];

    // Personalize message for each recipient using updated API
    const recipients = Array.from(this.selectedPhones).map(phone => {
      const client = this.clients.find(c => c.tel === phone);
      const clientName = client ? `${client.fname} ${client.lname}`.trim() : '';
      const personalizedMessage = this.bulkMessage.replace(/{name}/g, clientName || 'Client');
      return { phone, message: personalizedMessage };
    });

    this.http.post<any>(this.apiUrl + 'api/whatsapp/send-bulk', {
      recipients
    }).subscribe(
      (data) => {
        this.bulkResults = data.results || [];
        this.sendingBulk = false;
      },
      (err) => {
        this.sendingBulk = false;
        this.bulkResults = [{ phone: 'All', success: false, error: err.error?.error || 'Request failed' }];
      }
    );
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.sendOneResult = null;
    this.bulkResults = [];
    this.selectedTemplateIndex = '';
    this.updateSelectAllState();
  }

  prefillPhone(tel: string) {
    this.singlePhone = tel.replace(/[^0-9]/g, '');
    
    // Attempt to pre-fill client name in greeting
    const client = this.clients.find(c => c.tel.replace(/[^0-9]/g, '') === this.singlePhone);
    const clientName = client ? `${client.fname} ${client.lname}`.trim() : '';
    if (clientName) {
      this.singleMessage = `Bonjour ${clientName},\n\n`;
    } else {
      this.singleMessage = '';
    }
    
    this.activeTab = 'single';
  }

  get successCount(): number {
    return this.bulkResults.filter(r => r.success).length;
  }

  get failCount(): number {
    return this.bulkResults.filter(r => !r.success).length;
  }

  getPendingOrdersText(c: any): string {
    if (c.pending_orders_count > 0) {
      return this.trans.getLang() === 'AR' 
        ? `(${c.pending_orders_count} في الانتظار)` 
        : `(${c.pending_orders_count} en attente)`;
    }
    return '';
  }
}
