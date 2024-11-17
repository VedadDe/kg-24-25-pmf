import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelaunayComponent } from './delaunay.component';

describe('DelaunayComponent', () => {
  let component: DelaunayComponent;
  let fixture: ComponentFixture<DelaunayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelaunayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelaunayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
