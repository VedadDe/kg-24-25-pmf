import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoronoiDiagramComponent } from './voronoi-diagram.component';

describe('VoronoiDiagramComponent', () => {
  let component: VoronoiDiagramComponent;
  let fixture: ComponentFixture<VoronoiDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoronoiDiagramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoronoiDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
