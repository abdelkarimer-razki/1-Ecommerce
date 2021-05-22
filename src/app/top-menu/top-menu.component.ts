import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  menuMore:boolean=false;
  constructor() { }

  ngOnInit(): void {
  }
  showMenu(){
    /*if(this.menuMore==true)
    this.menuMore=false;
    else
    this.menuMore=true;*/
    this.menuMore=!this.menuMore
  }
  disableMenu(){
    this.menuMore=false;
  }

}
