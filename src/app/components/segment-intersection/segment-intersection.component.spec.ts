import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentIntersectionComponent } from './segment-intersection.component';

describe('SegmentIntersectionComponent', () => {
  let component: SegmentIntersectionComponent;
  let fixture: ComponentFixture<SegmentIntersectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegmentIntersectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegmentIntersectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
