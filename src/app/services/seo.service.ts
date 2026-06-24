import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  generateTags(config: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    const defaultTitle = 'COOP BABMANSOUR | Coopérative Bab Mansour';
    const title = config.title ? `${config.title} | COOP BABMANSOUR` : defaultTitle;
    const description = config.description || 'Coopérative Bab Mansour - Produits du terroir marocains naturels d\'exception: Miel pur, Huiles précieuses, Cosmétique naturelle, Épices.';
    const keywords = config.keywords || 'miel pur maroc, coopérative bab mansour, produits terroir maroc, huile cosmétique marocaine, miel thym, miel eucalyptus';
    const image = config.image || 'https://coopbabmansour.com/assets/logo3.png'; // default fallback image
    const url = config.url || this.document.location.href;
    const type = config.type || 'website';

    // Set Title
    this.titleService.setTitle(title);

    // Update Meta Tags
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: keywords });

    // Open Graph / Facebook
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });

    // Twitter
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
  }

  setSchema(schemaData: any, schemaId: string = 'structured-data-jsonld') {
    let scriptTag = this.document.getElementById(schemaId) as HTMLScriptElement;
    if (scriptTag) {
      scriptTag.text = JSON.stringify(schemaData);
    } else {
      scriptTag = this.document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(schemaData);
      this.document.head.appendChild(scriptTag);
    }
  }

  removeSchema(schemaId: string = 'structured-data-jsonld') {
    const scriptTag = this.document.getElementById(schemaId);
    if (scriptTag) {
      scriptTag.remove();
    }
  }
}
