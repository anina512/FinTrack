import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  imports: [],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})

export class SideNavComponent {

  constructor(private router: Router) {
      
    }

  logout(){
    this.router.navigate(['/login']); // Navigate to the register page
  }

}
