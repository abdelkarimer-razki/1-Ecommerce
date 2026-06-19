import { Component, OnInit } from '@angular/core';
import { HomepageService } from '../services/homepage.service';
import { NotifierService } from 'angular-notifier';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscriber, Observable } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  config: any = {};
  loading: boolean = true;
  private readonly notifier: NotifierService;

  constructor(
    private homepageService: HomepageService,
    notifierService: NotifierService,
    private sanitizer: DomSanitizer
  ) {
    this.notifier = notifierService;
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
        this.notifier.notify('error', 'Impossible de charger la configuration.');
        this.loading = false;
      }
    );
  }

  saveConfig() {
    this.homepageService.saveConfig(this.config).subscribe(
      (res) => {
        this.notifier.notify('success', 'Configuration enregistrée avec succès !');
      },
      (err) => {
        this.notifier.notify('error', 'Erreur lors de la sauvegarde.');
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
