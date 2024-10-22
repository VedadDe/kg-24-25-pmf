import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointInsideTriangleComponent } from './components/point-inside-triangle/point-inside-triangle.component';
import { PointSegmentComponent } from './components/point-segment/point-segment.component'; 
import { FloatingPointComponent } from './components/floating-point/floating-point.component';
import { Zadaca1Component } from './components/zadaca1/zadaca1.component';

const routes: Routes = [  
{ path: 'point-segment', component: PointSegmentComponent },//
{ path: 'homeworks', component: FloatingPointComponent},//
{ path: 'point-triangle', component: PointInsideTriangleComponent},//
{ path: 'homework1', component: Zadaca1Component},//
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
