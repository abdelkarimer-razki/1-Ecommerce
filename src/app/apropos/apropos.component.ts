import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.component.html',
  styleUrls: ['./apropos.component.css']
})
export class AproposComponent implements OnInit {

  constructor(private titleService:Title) { }

  ngOnInit(): void {
    this.titleService.setTitle("Apropos");
  }

}
