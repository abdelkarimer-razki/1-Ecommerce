import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-registre',
  templateUrl: './registre.component.html',
  styleUrls: ['./registre.component.css']
})
export class RegistreComponent implements OnInit {

  constructor(private titleService:Title) { }

  ngOnInit(): void {
    this.titleService.setTitle("S'inscrire");
  }

}
