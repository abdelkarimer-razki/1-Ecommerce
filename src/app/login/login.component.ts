import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { AuthGuard } from '../auth.guard';
import { EncrDecrService } from '../services/encr-decr.service';
import { users } from '../backend/users';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  incorect:Boolean=false;
  emailinv:Boolean=false;
  password:any="";
  user:users={iduser:0,fname:"",lname:"",admin:false,tel:"",email:"",password:"",adress:""};
  loading:Boolean=false;
  constructor(private EncrDecr: EncrDecrService,private titleService:Title,private login:LoginService,private router:Router,private auth:AuthGuard) {
   }

  ngOnInit(): void {
    this.titleService.setTitle("Connexion");
    if(this.user.email==''||this.password=='')
    {
      this.emailinv=true;
    }
    setInterval(()=>{if(this.user.email==''||this.password=='')
    {
      this.emailinv=true;
    }},500);
  }
  connect(){
    console.log(this.EncrDecr.set('p&aNDm6&whRD#HdL',this.password));
    if(this.emailinv==false)
    {
      this.user.password=this.EncrDecr.set('p&aNDm6&whRD#HdL',this.password);
      this.loading=true;
      this.login.connect(this.user).subscribe(
        (data:any)=>{
        localStorage.setItem('K2hM$4PAWCeFV8',data.K2hM$4PAWCeFV8);
        localStorage.setItem('user',data.name);
        localStorage.setItem('userE',data.email);
        localStorage.setItem('userId',data.iduser);
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
        this.loading=false;
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
        this.loading=false;
      }
      );
    }
  }
  test()
  {
    this.incorect=false;
    if(this.user.email!=""&&this.password!="")
    {
      this.emailinv=false;
    }else
    {
      this.emailinv=true;
    }
  }
}
