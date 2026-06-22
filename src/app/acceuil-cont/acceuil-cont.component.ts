import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { HomepageService } from '../services/homepage.service';
import { TranslationService } from '../services/translation.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-acceuil-cont',
  templateUrl: './acceuil-cont.component.html',
  styleUrls: ['./acceuil-cont.component.css']
})
export class AcceuilContComponent implements OnInit {
   countO:Number=0;
   loading:boolean=true;
   countH:Number=0;
   config: any = {};

   // Contact Us Form State
   contactForm = {
     name: '',
     tel: '',
     message: ''
   };
   contactFormSubmitted = false;
   contactFormErrors = {
     name: false,
     tel: false,
     message: false
   };
   contactFormSuccess = false;

  constructor(
    private HomepageService:HomepageService,
    private titleService:Title,
    private sanitizer: DomSanitizer,
    public trans: TranslationService,
    private dash: DashboardService
  ) { }

  onSubmitContact() {
    this.contactFormSubmitted = true;
    this.contactFormErrors = {
      name: !this.contactForm.name || this.contactForm.name.trim() === '',
      tel: !this.contactForm.tel || this.contactForm.tel.trim() === '',
      message: !this.contactForm.message || this.contactForm.message.trim() === ''
    };

    const hasErrors = Object.values(this.contactFormErrors).some(err => err);
    if (hasErrors) {
      return;
    }

    this.dash.submitMessage(this.contactForm).subscribe(res => {
      this.contactFormSuccess = true;
      this.contactForm = { name: '', tel: '', message: '' };
      this.contactFormSubmitted = false;
      setTimeout(() => {
        this.contactFormSuccess = false;
      }, 5000);
    }, err => {
      console.error("Error submitting reclamation:", err);
    });
  }

  ngOnInit(): void {
    this.getCountOil();
    this.titleService.setTitle(this.trans.getLang() === 'AR' ? 'من نحن - تعاونية باب منصور' : this.trans.getLang() === 'EN' ? 'About Us - Bab Mansour Cooperative' : 'À Propos - Coopérative Bab Mansour');
    this.getCountHoney();
    this.loadConfig();
  }

  loadConfig() {
    this.HomepageService.getConfig().subscribe(
      (data) => {
        this.config = data;
      },
      (error) => {
        console.error('Failed to load configuration, using defaults.', error);
        this.config = {
          heroTitle: "Miels Rares & Huiles d'Exception",
          heroSubtitle: "Coopérative Bab Mansour",
          heroDescription: "Née au cœur des terroirs ensoleillés de Taroudant au Maroc, notre coopérative artisanale perpétue des savoir-faire ancestraux. Nous récoltons avec passion des miels de fleurs sauvages 100% naturels et pressons nos huiles d'olive et d'argan à froid pour en préserver toute la pureté.",
          heroImage: "assets/coop_hero_bg.jpg",
          principle1Title: "Meilleures méthodes de production",
          principle1Description: "La Coopérative Bab Mansour applique des procédés de récolte et de pressage traditionnels tout en garantissant un niveau d'hygiène et de contrôle optimal. Notre engagement pour le maintien des savoir-faire artisanaux locaux nous permet de produire un miel et des huiles de qualité exceptionnelle.",
          principle1Image: "assets/coop_honey_harvest.jpg",
          principle2Title: "Meilleures matières premières",
          principle2Description: "Tous nos miels et huiles sont issus de terroirs marocains préservés. Nous collaborons directement avec les apiculteurs et agriculteurs locaux pour sélectionner des fleurs sauvages, des olives rigoureusement triées et des amandiers de l'arganier afin de garantir des produits 100% naturels.",
          principle2Image: "assets/coop_raw_materials.jpg"
        };
      }
    );
  }

   getCountOil(){
    this.HomepageService.getCountM("HUILE").subscribe(data=>{
      this.countO=data.length;
      this.loading=false;
    })
    }
    getCountHoney(){
    this.HomepageService.getCountM("MIEL").subscribe(data=>{
      this.countH=data.length;
      this.loading=false;
    })
    }

    transformImage(pic: string) {
      if (!pic) return '';
      if (pic.startsWith('data:')) {
        return this.sanitizer.bypassSecurityTrustUrl(pic);
      }
      return pic;
    }

    getSafeMapUrl() {
      const loc = this.config.coopLocation || 'Taroudant, Maroc';
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

}
