import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../services/login.service';
import { AuthGuard } from '../auth.guard';
import { EncrDecrService } from '../services/encr-decr.service';
import { users } from '../backend/users';
import { TranslationService } from '../services/translation.service';
import { HomepageService } from '../services/homepage.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  loginFormSubmitted: boolean = false;
  config: any = {};

  constructor(
    private EncrDecr: EncrDecrService,
    private titleService:Title,
    private login:LoginService,
    private router:Router,
    private auth:AuthGuard,
    public trans: TranslationService,
    private homepageService: HomepageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.trans.t('CONNEXION'));
    
    // Load config for dynamic logo and coopName
    this.homepageService.getConfig().subscribe(
      (data) => {
        this.config = data || {};
      },
      (error) => {
        console.error('Error loading config in LoginComponent:', error);
      }
    );
  }

  connect(){
    this.loginFormSubmitted = true;
    if (!this.user.email || !this.password) {
      return;
    }
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
          localStorage.setItem("#bsXpEcIouiz","UF7wcFy9rl&wv$adaLGkkJ@0KX$wWKTt*")
          this.router.navigate(['/admin/dashboard']).then(()=>{
            window.location.reload();
          });
        }else{
          this.router.navigate(['/']).then(()=>{
            window.location.reload();
          });
        }
        this.loading=false;
      },
      err=>{
        if( err instanceof HttpErrorResponse ) {
          if (err.status === 401) {
            this.incorect=true;
          }
          if (err.status === 429) {
            this.incorect=true; // show error for rate limit
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

  transformImage(pic: string) {
    if (!pic) return '';
    if (pic.startsWith('data:')) {
      return this.sanitizer.bypassSecurityTrustUrl(pic);
    }
    return pic;
  }
}
