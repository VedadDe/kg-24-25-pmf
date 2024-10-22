import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointInsideTriangleComponent } from './point-inside-triangle.component';

describe('PointInsideTriangleComponent', () => {
  let component: PointInsideTriangleComponent;
  let fixture: ComponentFixture<PointInsideTriangleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointInsideTriangleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointInsideTriangleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
