import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { users } from '../backend/users';
import { Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';
import { EncrDecrService } from '../services/encr-decr.service';

@Component({
  selector: 'app-registre',
  templateUrl: './registre.component.html',
  styleUrls: ['./registre.component.css']
})
export class RegistreComponent implements OnInit {

  user:users={iduser:0,fname:"",lname:"",adress:"",email:"",tel:"",password:"",admin:false};
  password:any="";
  testtel1:Boolean=false;
  testemail:Boolean=false;
  vein:Boolean=false;
  unmatch:boolean=false;
  constructor(private router:Router,private EncrDecr: EncrDecrService,private titleService:Title,private reg:RegistreService) { }

  ngOnInit(): void {
    this.titleService.setTitle("S'inscrire");
    this.test();
    setInterval(()=>
    {
      this.test();
    },1000);
  }
  test()
  {
    if(this.user.fname=="" ||this.user.lname==""||this.user.adress==""||this.user.tel==""||this.password==""||this.user.email=="")
    {
      this.vein=true;
    }else
    {
      this.vein=false;
    }
  }
  registre()
  {
    if(!this.vein&&!this.testtel1&&!this.testemail)
    {
      this.user.password=this.EncrDecr.set('p&aNDm6&whRD#HdL',this.password);
      this.reg.registre(this.user).subscribe(data=>
        {
          this.unmatch=true;
          setTimeout(()=>
          {
            this.router.navigate(['/connexion']);
          },1000)
        });
    }
  }
  testtel()
  {
    this.reg.testemail(this.user.tel).subscribe((data:any)=>
      {
        if(data.length>0)
        {
          this.testtel1=true;
        }else
        {
          this.testtel1=false;
        }
      });
      this.reg.testemail(this.user.email).subscribe((data:any)=>
      {
        if(data.length>0)
        {
          this.testemail=true;
        }else
        {
          this.testemail=false;
        }
      });
  }
}
