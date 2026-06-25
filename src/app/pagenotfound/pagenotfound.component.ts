import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {

  constructor(
    private titleService: Title,
    public trans: TranslationService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('PAGE_NON_TROUVEE') || 'Page non trouvée');
  }

}
