import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Billing } from './billing';

describe('Billing', () => {
  let component: Billing;
  let fixture: ComponentFixture<Billing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Billing],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Billing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
