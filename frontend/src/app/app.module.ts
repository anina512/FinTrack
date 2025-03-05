import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';  
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; 
import { SideNavComponent } from './shared/side-nav/side-nav.component';
import { HeaderComponent } from './shared/header/header.component';
import { ExpenseComponent } from './pages/transactions/expense/expense.component';
import { IncomeComponent } from './pages/transactions/income/income.component';
import { BudgetComponent } from './pages/transactions/budget/budget.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { TransactionsService } from './services/transactions.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    SideNavComponent,
    HeaderComponent,
    ExpenseComponent,
    IncomeComponent,
    BudgetComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,  
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,  
    RouterModule.forRoot([]),
    HttpClientModule
  ],
  providers: [AuthService, TransactionsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
