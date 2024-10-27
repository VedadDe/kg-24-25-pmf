import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JarvisMarchComponent } from './jarvis-march.component';

describe('JarvisMarchComponent', () => {
  let component: JarvisMarchComponent;
  let fixture: ComponentFixture<JarvisMarchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JarvisMarchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JarvisMarchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
