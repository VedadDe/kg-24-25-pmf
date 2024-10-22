import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingPointComponent } from './floating-point.component';

describe('FloatingPointComponent', () => {
  let component: FloatingPointComponent;
  let fixture: ComponentFixture<FloatingPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingPointComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
