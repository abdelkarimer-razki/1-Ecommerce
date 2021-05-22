import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pagenotfound',
  templateUrl: './pagenotfound.component.html',
  styleUrls: ['./pagenotfound.component.css']
})
export class PagenotfoundComponent implements OnInit {

  constructor(private titleService:Title) { }

  ngOnInit(): void {
    this.titleService.setTitle("Page non trouvée");
  }

}
