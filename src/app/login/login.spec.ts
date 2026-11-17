import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the royal admin login portal', () => {
    expect(component).toBeTruthy();
  });

  it('should authenticate with default admin credentials', () => {
    component.username = 'admin';
    component.password = 'royal123';
    component.onCredentialsSubmit();
    expect(component.auth.isAuthenticated()).toBe(true);
    expect(component.auth.currentUser()?.role).toBe('SUPER_ADMIN');
  });

  it('should authenticate with 4-digit staff PIN', () => {
    component.auth.logout();
    component.pinDigits = '2222';
    component.verifyPin();
    expect(component.auth.isAuthenticated()).toBe(true);
    expect(component.auth.currentUser()?.role).toBe('HEAD_CHEF');
  });
});
