import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvexCheckComponent } from './convex-check.component';

describe('ConvexCheckComponent', () => {
  let component: ConvexCheckComponent;
  let fixture: ComponentFixture<ConvexCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvexCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvexCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
