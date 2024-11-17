import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

interface Triangle {
  p1: Point;
  p2: Point;
  p3: Point;
}

  @Component({
  selector: 'app-delaunay',
  templateUrl: './delaunay.component.html',
  styleUrls: ['./delaunay.component.scss']
})
export class DelaunayComponent implements AfterViewInit { 
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef;
  private ctx!: CanvasRenderingContext2D;
  private points: Point[] = [];
  private triangles: Triangle[] = [];

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.draw();
  }
  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    const newPoint: Point = { x, y };
    this.points.push(newPoint);
  
    this.triangulate();
    this.draw();
  }
  findTriangleSharingEdge(p1: Point, p2: Point, excludingPoint: Point): Triangle | null {
    for (const triangle of this.triangles) {
      if ([triangle.p1, triangle.p2, triangle.p3].includes(p1) &&
          [triangle.p1, triangle.p2, triangle.p3].includes(p2) &&
          ![triangle.p1, triangle.p2, triangle.p3].includes(excludingPoint)) {
        return triangle;
      }
    }
    return null;
  }
  
  checkEdgeLegality(p: Point, edgeStart: Point, edgeEnd: Point) {
    // Find the triangle opposite to point p across the edge
    const oppositeTriangle = this.findTriangleSharingEdge(edgeStart, edgeEnd, p);
    if (!oppositeTriangle) return;
  
    // The point opposite to the edge in the opposite triangle
    const oppositePoint = [oppositeTriangle.p1, oppositeTriangle.p2, oppositeTriangle.p3]
      .find(pt => pt !== edgeStart && pt !== edgeEnd);
  
    if (!oppositePoint) return;
  
    // Check if the edge is illegal
    if (this.pointInCircumcircle(oppositePoint, { p1: p, p2: edgeStart, p3: edgeEnd })) {
      // Flip the edge
      this.triangles = this.triangles.filter(
        tri => tri !== oppositeTriangle &&
               ![p, edgeStart, edgeEnd].every(pt => [tri.p1, tri.p2, tri.p3].includes(pt))
      );
  
      // Add the new triangles
      this.triangles.push({ p1: p, p2: oppositePoint, p3: edgeStart });
      this.triangles.push({ p1: p, p2: oppositePoint, p3: edgeEnd });
  
      // Recursively check the edges
      this.checkEdgeLegality(p, p, oppositePoint);
      this.checkEdgeLegality(p, edgeStart, oppositePoint);
      this.checkEdgeLegality(p, edgeEnd, oppositePoint);
    }
  }
  
  triangulate() {
    // Step 1: Initialize the super-triangle
    const superTriangle: Triangle = {
      p1: { x: -1000, y: -1000 },
      p2: { x: 3000, y: -1000 },
      p3: { x: -1000, y: 3000 },
    };
  
    // Start with the super-triangle
    this.triangles = [superTriangle];
  
    // Step 2: Permute the points (you can shuffle the points array)
    const permutedPoints = this.points.slice(); // Copy the points array
    // Optionally shuffle the points to get a random permutation
    // this.shuffleArray(permutedPoints);
  
    // Step 3: Insert each point into the triangulation
    for (const point of permutedPoints) {
      const badTriangles: Triangle[] = [];
  
      // Find all triangles that are no longer valid due to the insertion
      for (const triangle of this.triangles) {
        if (this.pointInCircumcircle(point, triangle)) {
          badTriangles.push(triangle);
        }
      }
  
      // Find the boundary of the polygonal hole
      const polygon: { p1: Point; p2: Point }[] = [];
      for (const triangle of badTriangles) {
        const edges = [
          { p1: triangle.p1, p2: triangle.p2 },
          { p1: triangle.p2, p2: triangle.p3 },
          { p1: triangle.p3, p2: triangle.p1 },
        ];
  
        for (const edge of edges) {
          let shared = false;
          for (const otherTriangle of badTriangles) {
            if (triangle === otherTriangle) continue;
            if (this.isSameEdge(edge, { p1: otherTriangle.p1, p2: otherTriangle.p2 }) ||
                this.isSameEdge(edge, { p1: otherTriangle.p2, p2: otherTriangle.p3 }) ||
                this.isSameEdge(edge, { p1: otherTriangle.p3, p2: otherTriangle.p1 })) {
              shared = true;
              break;
            }
          }
          if (!shared) {
            polygon.push(edge);
          }
        }
      }
  
      // Remove the bad triangles
      this.triangles = this.triangles.filter(tri => !badTriangles.includes(tri));
  
      // Retriangulate the polygonal hole
      for (const edge of polygon) {
        const newTriangle: Triangle = {
          p1: edge.p1,
          p2: edge.p2,
          p3: point,
        };
        this.triangles.push(newTriangle);
  
        // Step 3 II: Check and flip illegal edges
        this.checkEdgeLegality(point, edge.p1, edge.p2);
      }
    }
  
    // Step 4: Remove triangles that share a vertex with the super-triangle
    this.triangles = this.triangles.filter(triangle => {
      return ![superTriangle.p1, superTriangle.p2, superTriangle.p3].includes(triangle.p1) &&
             ![superTriangle.p1, superTriangle.p2, superTriangle.p3].includes(triangle.p2) &&
             ![superTriangle.p1, superTriangle.p2, superTriangle.p3].includes(triangle.p3);
    });
  }
  
  
  pointInCircumcircle(point: Point, triangle: Triangle): boolean {
    const { p1, p2, p3 } = triangle;
  
    // Matrix determinant method
    const ax = p1.x - point.x;
    const ay = p1.y - point.y;
    const bx = p2.x - point.x;
    const by = p2.y - point.y;
    const cx = p3.x - point.x;
    const cy = p3.y - point.y;
  
    const det = (ax * (by * (cx * cx + cy * cy) - cy * (bx * bx + by * by))
               - ay * (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by))
               + (ax * ax + ay * ay) * (bx * cy - cx * by));
  
    return det > 0;
  }
  

  isSameEdge(edge1: { p1: Point; p2: Point }, edge2: { p1: Point; p2: Point }): boolean {
    return (
      (edge1.p1.x === edge2.p1.x && edge1.p1.y === edge2.p1.y && edge1.p2.x === edge2.p2.x && edge1.p2.y === edge2.p2.y) ||
      (edge1.p1.x === edge2.p2.x && edge1.p1.y === edge2.p2.y && edge1.p2.x === edge2.p1.x && edge1.p2.y === edge2.p1.y)
    );
  }
  

  draw() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  
    // Draw triangles
    this.ctx.strokeStyle = 'blue';
    for (const triangle of this.triangles) {
      this.ctx.beginPath();
      this.ctx.moveTo(triangle.p1.x, triangle.p1.y);
      this.ctx.lineTo(triangle.p2.x, triangle.p2.y);
      this.ctx.lineTo(triangle.p3.x, triangle.p3.y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  
    // Draw points
    this.ctx.fillStyle = 'red';
    for (const point of this.points) {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
}
