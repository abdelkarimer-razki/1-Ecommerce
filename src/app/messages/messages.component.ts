import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { TranslationService } from '../services/translation.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: any[] = [];
  loading: boolean = true;
  
  deleteModalActive: boolean = false;
  deletingMessage: any = null;

  constructor(
    private dash: DashboardService,
    public trans: TranslationService,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('MESSAGES'));
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.dash.getMessages().subscribe(data => {
      this.messages = data || [];
      this.loading = false;
    }, err => {
      console.error(err);
      this.loading = false;
    });
  }

  confirmDelete(msg: any) {
    this.deletingMessage = msg;
    this.deleteModalActive = true;
  }

  closeDeleteModal() {
    this.deleteModalActive = false;
    this.deletingMessage = null;
  }

  executeDelete() {
    if (this.deletingMessage) {
      this.dash.deleteMessage(this.deletingMessage.idmessage).subscribe(() => {
        this.closeDeleteModal();
        this.loadMessages();
      }, err => {
        console.error(err);
      });
    }
  }
}
