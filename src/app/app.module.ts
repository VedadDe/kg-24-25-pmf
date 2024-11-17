import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PointInsideTriangleComponent } from './components/point-inside-triangle/point-inside-triangle.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { PointSegmentComponent } from './components/point-segment/point-segment.component';
import { FloatingPointComponent } from './components/floating-point/floating-point.component';
import { Zadaca1Component } from './components/zadaca1/zadaca1.component';
import { SegmentIntersectionComponent } from './components/segment-intersection/segment-intersection.component';
import { PointOrientationComponent } from './components/point-orientation/point-orientation.component';
import { ConvexCheckComponent } from './components/convex-check/convex-check.component';
import { JarvisMarchComponent } from './components/jarvis-march/jarvis-march.component';
import { TriangulationComponent } from './components/triangulation/triangulation.component';
import { DelaunayComponent } from './components/delaunay/delaunay.component';

@NgModule({
  declarations: [
    AppComponent,
    PointInsideTriangleComponent,
    HeaderComponent,
    PointSegmentComponent,
    FloatingPointComponent,
    Zadaca1Component,
    SegmentIntersectionComponent,
    PointOrientationComponent,
    ConvexCheckComponent,
    JarvisMarchComponent,
    TriangulationComponent,
    DelaunayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
