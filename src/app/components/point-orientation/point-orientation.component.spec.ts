import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointOrientationComponent } from './point-orientation.component';

describe('PointOrientationComponent', () => {
  let component: PointOrientationComponent;
  let fixture: ComponentFixture<PointOrientationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointOrientationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointOrientationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
