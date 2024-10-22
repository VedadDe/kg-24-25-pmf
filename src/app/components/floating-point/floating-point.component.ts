import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-floating-point',
  templateUrl: './floating-point.component.html',
  styleUrls: ['./floating-point.component.scss']
})
export class FloatingPointComponent implements AfterViewInit {

  // Metoda koja se izvršava nakon što se canvas učita
  ngAfterViewInit() {
  }

}
