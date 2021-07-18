import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule ,routingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { AproposComponent } from './apropos/apropos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {IvyCarouselModule} from 'angular-responsive-carousel';
import { BuyproductComponent } from './buyproduct/buyproduct.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RegistreComponent } from './registre/registre.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { AdminComponent } from './admin/admin.component';
import { CommandsComponent } from './commands/commands.component';
import { UsersComponent } from './users/users.component';
import { ProductsComponent } from './products/products.component';
const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'left',
			distance: 12
		},
		vertical: {
			position: 'bottom',
			distance: 12,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};

@NgModule({
  declarations: [
    AppComponent,
    TopMenuComponent,
    routingComponents,
    AproposComponent,
    PagenotfoundComponent,
    BuyproductComponent,
    LoginComponent,
    RegistreComponent,
    DashboardComponent,
    AdminComponent,
    CommandsComponent,
    UsersComponent,
    ProductsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    IvyCarouselModule, NotifierModule.withConfig(customNotifierOptions)
  ],
  providers: [AuthGuard,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptorService,
    multi: true
  }],
  bootstrap: [AppComponent]
})

export class AppModule { }
