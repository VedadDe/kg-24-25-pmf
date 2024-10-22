import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zadaca1Component } from './zadaca1.component';

describe('Zadaca1Component', () => {
  let component: Zadaca1Component;
  let fixture: ComponentFixture<Zadaca1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Zadaca1Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Zadaca1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
