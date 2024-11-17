import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointInsideTriangleComponent } from './components/point-inside-triangle/point-inside-triangle.component';
import { PointSegmentComponent } from './components/point-segment/point-segment.component'; 
import { FloatingPointComponent } from './components/floating-point/floating-point.component';
import { Zadaca1Component } from './components/zadaca1/zadaca1.component';
import { SegmentIntersectionComponent } from './components/segment-intersection/segment-intersection.component';
import { PointOrientationComponent } from './components/point-orientation/point-orientation.component';
import { ConvexCheckComponent } from './components/convex-check/convex-check.component';
import { JarvisMarchComponent } from './components/jarvis-march/jarvis-march.component';
import { TriangulationComponent } from './components/triangulation/triangulation.component';
import { DelaunayComponent } from './components/delaunay/delaunay.component';

const routes: Routes = [  
{ path: 'point-segment', component: PointSegmentComponent },//
{ path: 'homeworks', component: FloatingPointComponent},//
{ path: 'two-segments-intersecion', component: SegmentIntersectionComponent},//
{ path: 'points-orientation', component: PointOrientationComponent},//
{ path: 'convex-check', component: ConvexCheckComponent},//
{ path: 'jarvis-march', component: JarvisMarchComponent},//
{ path: 'point-triangle', component: PointInsideTriangleComponent},//
{ path: 'homework1', component: Zadaca1Component},//
{ path: 'triangulation', component: TriangulationComponent},//
{ path: 'delaunay', component: DelaunayComponent},//
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
