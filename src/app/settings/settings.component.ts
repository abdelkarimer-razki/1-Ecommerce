import { Component, OnInit } from '@angular/core';
import { HomepageService } from '../services/homepage.service';
import { NotifierService } from 'angular-notifier';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscriber, Observable } from 'rxjs';
import { TranslationService } from '../services/translation.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  config: any = {};
  loading: boolean = true;
  activeTab: 'customization' | 'notifications' = 'customization';
  private readonly notifier: NotifierService;

  constructor(
    private homepageService: HomepageService,
    notifierService: NotifierService,
    private sanitizer: DomSanitizer,
    public trans: TranslationService,
    private route: ActivatedRoute
  ) {
    this.notifier = notifierService;
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'notifications') {
        this.activeTab = 'notifications';
      } else if (params['tab'] === 'customization') {
        this.activeTab = 'customization';
      }
    });
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig() {
    this.loading = true;
    this.homepageService.getConfig().subscribe(
      (data) => {
        this.config = data;
        this.loading = false;
      },
      (error) => {
        this.notifier.notify('error', this.trans.t('ERR_LOAD_CONFIG'));
        this.loading = false;
      }
    );
  }

  saveConfig() {
    this.homepageService.saveConfig(this.config).subscribe(
      (res) => {
        this.notifier.notify('success', this.trans.t('SAVE_SUCCESS'));
      },
      (err) => {
        this.notifier.notify('error', this.trans.t('SAVE_ERROR'));
      }
    );
  }

  onImageChange($event: Event, imageField: string) {
    const fileInput = ($event.target as HTMLInputElement);
    if (fileInput.files != null && fileInput.files.length > 0) {
      this.convertToBase64(fileInput.files[0], imageField);
    }
  }

  convertToBase64(file: File, imageField: string) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((base64Data) => {
      this.config[imageField] = base64Data;
    });
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = (error) => {
      subscriber.error(error);
      subscriber.complete();
    };
  }

  transformImage(pic: string) {
    if (!pic) return '';
    if (pic.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(pic);
    }
    return pic;
  }
}
