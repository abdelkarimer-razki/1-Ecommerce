import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceuilContComponent } from './acceuil-cont.component';

describe('AcceuilContComponent', () => {
  let component: AcceuilContComponent;
  let fixture: ComponentFixture<AcceuilContComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceuilContComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceuilContComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
