import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {
  table:any;

  constructor(private dash:DashboardService) { }

  ngOnInit(): void {
    this.dash.allCommands().subscribe(data=>{
      this.table=data;
      console.log(data)
    })
  }

}
