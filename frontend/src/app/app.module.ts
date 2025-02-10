import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; 
import { SideNavComponent } from './pages/side-nav/side-nav.component';
import { HeaderComponent } from './pages/header/header.component';
import { ExpenseComponent } from './pages/expense/expense.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SideNavComponent,
    HeaderComponent,
    ExpenseComponent,
    FormsModule
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
