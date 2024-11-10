import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TriangulationComponent } from './triangulation.component';

describe('TriangulationComponent', () => {
  let component: TriangulationComponent;
  let fixture: ComponentFixture<TriangulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TriangulationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TriangulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
