import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointSegmentComponent } from './point-segment.component';

describe('PointSegmentComponent', () => {
  let component: PointSegmentComponent;
  let fixture: ComponentFixture<PointSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointSegmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointSegmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
