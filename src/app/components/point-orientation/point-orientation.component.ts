import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}

@Component({
  selector: 'app-point-orientation',
  templateUrl: './point-orientation.component.html',
  styleUrls: ['./point-orientation.component.scss']
})
export class PointOrientationComponent {

  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  prikaziModal = false;
  jeU_smjeruKazaljke = false;
  tacke: Tacka[] = [];

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const kontekst = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (kontekst) {
      kontekst.clearRect(0, 0, canvas.width, canvas.height);
      kontekst.beginPath();
      kontekst.moveTo(0, 0);
      kontekst.closePath();
      kontekst.stroke();
    }
  }

  klikNacanvas(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const pravougaonik = canvas.getBoundingClientRect();
    const x = event.clientX - pravougaonik.left;
    const y = event.clientY - pravougaonik.top;

    this.tacke.push({ x, y });

    const kontekst = canvas.getContext('2d');
    if (kontekst) {
      kontekst.beginPath();
      kontekst.arc(x, y, 5, 0, 2 * Math.PI);
      kontekst.fill();

      if (this.tacke.length === 3) {
        this.prikaziModal = true;
        this.jeU_smjeruKazaljke = this.daLiSuTackeUSmjeruKazaljke(this.tacke);
      }
    }
  }

  daLiSuTackeUSmjeruKazaljke(tacke: Tacka[]): boolean {
    const t1 = tacke[0];
    const t2 = tacke[1];
    const t3 = tacke[2];

    const val = (t2.y - t1.y) * (t3.x - t2.x) - (t2.x - t1.x) * (t3.y - t2.y);

    return val < 0;
  }

  zatvoriModal(): void {
    this.prikaziModal = false;
    this.jeU_smjeruKazaljke = false;
    this.tacke = [];

    const canvas = this.canvasRef.nativeElement;
    const kontekst = canvas.getContext('2d');
    if (kontekst) {
      kontekst.clearRect(0, 0, canvas.width, canvas.height);
      kontekst.beginPath();
      kontekst.moveTo(0, 0);
      kontekst.closePath();
      kontekst.stroke();
    }
  }
}