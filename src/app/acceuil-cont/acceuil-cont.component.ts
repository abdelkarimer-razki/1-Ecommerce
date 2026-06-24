import { Component, OnInit } from '@angular/core';
import { Title, DomSanitizer } from '@angular/platform-browser';
import { HomepageService } from '../services/homepage.service';
import { TranslationService } from '../services/translation.service';
import { DashboardService } from '../services/dashboard.service';
import { SeoService } from '../services/seo.service';

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
    private dash: DashboardService,
    private seoService: SeoService
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
    this.getCountHoney();
    this.loadConfig();

    const lang = this.trans.getLang();
    let seoTitle = '';
    let seoDesc = '';
    let seoKeywords = '';

    if (lang === 'EN') {
      seoTitle = 'About Us | Natural Moroccan Honey & Organic Oils';
      seoDesc = 'Discover Coopérative Bab Mansour, producer of authentic Moroccan pure honey, argan oil, olive oil and natural cosmetics. Harvested artisanally in Taroudant.';
      seoKeywords = 'cooperative bab mansour, taroudant, moroccan honey, argan oil cosmetic, pure organic honey, moroccan terroir';
    } else if (lang === 'AR') {
      seoTitle = 'من نحن | تعاونية باب منصور للعسل الحر والزيوت';
      seoDesc = 'تعرف على تعاونية باب منصور بتارودانت، رائدة إنتاج العسل الحر الطبيعي، زيت الأركان، وزيت الزيتون البكر. منتجات طبيعية 100% من قلب المغرب.';
      seoKeywords = 'تعاونية باب منصور, تارودانت, عسل حر مغربي, زيت أركان للتجميل, منتجات بلدية طبيعية';
    } else { // default FR
      seoTitle = 'À Propos | Miel Pur du Maroc & Huiles Bio';
      seoDesc = 'Découvrez la Coopérative Bab Mansour à Taroudant, productrice de miel pur artisanal, d\'huile d\'argan et d\'olive biologiques. Excellence et tradition marocaine.';
      seoKeywords = 'coopérative bab mansour, taroudant, miel pur maroc, huile argan cosmétique, miel de thym, miel eucalyptus';
    }

    this.seoService.generateTags({
      title: seoTitle,
      description: seoDesc,
      keywords: seoKeywords,
      type: 'website'
    });
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
