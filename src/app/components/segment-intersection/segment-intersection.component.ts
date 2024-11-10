import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-segment-intersection',
  templateUrl: './segment-intersection.component.html',
  styleUrls: ['./segment-intersection.component.scss']
})
export class SegmentIntersectionComponent {
  @ViewChild('canvas') canvasRef!: ElementRef;
  kontekst!: CanvasRenderingContext2D;
  tacke: [number, number][] = [];

  ngAfterViewInit(): void {
    this.kontekst = this.canvasRef.nativeElement.getContext('2d');
  }

  handleClick(dogadjaj: MouseEvent): void {
    const pravougaonik = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = dogadjaj.clientX - pravougaonik.left;
    const y = dogadjaj.clientY - pravougaonik.top;
    this.tacke.push([x, y]);
    this.nacrtajTacku(x, y);

    if (this.tacke.length === 4) {
      this.nacrtajLiniju(this.tacke[0], this.tacke[1]);
      this.nacrtajLiniju(this.tacke[2], this.tacke[3]);

      if (this.linijePresjecaju(this.tacke[0], this.tacke[1], this.tacke[2], this.tacke[3])) {
        alert('Linije se presjecaju');
      } else {
        alert('Linije se ne presjecaju');
      }

      this.tacke = [];
    }
  }

  nacrtajTacku(x: number, y: number): void {
    this.kontekst.beginPath();
    this.kontekst.arc(x, y, 3, 0, 2 * Math.PI);
    this.kontekst.fillStyle = 'crna';
    this.kontekst.fill();
  }

  nacrtajLiniju(pocetak: [number, number], kraj: [number, number]): void {
    this.kontekst.beginPath();
    this.kontekst.moveTo(pocetak[0], pocetak[1]);
    this.kontekst.lineTo(kraj[0], kraj[1]);
    this.kontekst.stroke();
  }

  linijePresjecaju(a1: [number, number], a2: [number, number], b1: [number, number], b2: [number, number]): boolean {
    const d = (a2[1] - a1[1]) * (b2[0] - b1[0]) - (a2[0] - a1[0]) * (b2[1] - b1[1]);
    if (d === 0) return false; // paralelne linije
  
    const ua = ((a2[0] - a1[0]) * (b1[1] - a1[1]) - (a2[1] - a1[1]) * (b1[0] - a1[0])) / d;
    const ub = ((b2[0] - b1[0]) * (b1[1] - a1[1]) - (b2[1] - b1[1]) * (b1[0] - a1[0])) / d;
  
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
}  