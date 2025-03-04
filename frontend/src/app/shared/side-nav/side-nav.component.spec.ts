import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideNavComponent } from './side-nav.component';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;
  let routerSpy: { navigate: jest.Mock };

  beforeEach(async () => {
    routerSpy = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [provideRouter([]), { provide: Router, useValue: routerSpy }] 
    }).compileComponents();

    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login page on logout', () => {
    component.logout();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
