import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { AuthGuard } from '../auth.guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email='';
  incorect:Boolean=false;
  password='';
  constructor(private titleService:Title,private login:LoginService,private router:Router,private auth:AuthGuard) {
   }

  ngOnInit(): void {
    this.titleService.setTitle("Connexion");
  }
  connect(){
    this.login.connect(this.email,this.password).subscribe(
      data=>{
      localStorage.setItem('K2hM$4PAWCeFV8',data.K2hM$4PAWCeFV8);
      localStorage.setItem('user',data.name);
      localStorage.setItem('userE',data.email);
      if(data.admin==true){
        this.router.navigate(['/admin/dashboard']).then(()=>{
          window.location.reload();
        });
        localStorage.setItem("#bsXpEcIouiz","UF7wcFy9rl&wv$adaLGkkJ@0KX$wWKTt*")
      }else{
        this.router.navigate(['/shopping']).then(()=>{
          window.location.reload();
        });
      }

      /*if(data[0].admin==true){
        this.router.navigate(['/dashboard']);
      }else{
        this.router.navigate(['/shopping']);
      }*/
      /*if(data.length==0){
        this.incorect=true;
      }else{
        if(data[0].admin==true){
          this.router.navigate(['/dashboard']);
          /*localStorage.setItem('token', data.token);*/
          /*this.incorect=false;*/
        /*}else{
          this.incorect=false;
          this.router.navigate(['/shopping']);
        }

      }*/
    },
    err=>{
      if( err instanceof HttpErrorResponse ) {
        if (err.status === 401) {
          this.incorect=true;
        }
      }
    }
    );
  }
}
