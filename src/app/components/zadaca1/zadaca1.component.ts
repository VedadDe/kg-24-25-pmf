import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}

@Component({
  selector: 'app-zadaca1',
  templateUrl: './zadaca1.component.html',
  styleUrls: ['./zadaca1.component.scss']
})
export class Zadaca1Component implements AfterViewInit {
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;
  tacke: Tacka[] = [];
  radius = 0;
  center!: Tacka;
  message = '';

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 1900;
    canvas.height = 800;
  }

  onCanvasClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const tacka: Tacka = { x, y };

    this.tacke.push(tacka);
    this.crtajTacku(tacka);

    if (this.tacke.length === 2) {
      this.center = { x: (this.tacke[0].x + this.tacke[1].x) / 2, y: (this.tacke[0].y + this.tacke[1].y) / 2 };
      this.radius = this.racunajUdaljenost(this.center, this.tacke[1]);

      if (this.radius === 0) {
        this.message = 'Poluprečnik kružnice je nula - nije moguće nacrtati kružnicu.';
      } else if (!this.krugUCanvasu()) {
        this.message = 'Kružnica ne može stati unutar kanvasa.';
      } else {
        this.message = '';
        this.crtajKruznicu();
      }
    }
  }

  crtajTacku(tacka: Tacka): void {
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'red';
    this.ctx.fill();
    this.ctx.stroke();
  }

  crtajKruznicu(): void {
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'blue';
    this.ctx.stroke();
  }
  crtajSegment(t1: Tacka, t2: Tacka): void {
    this.ctx.beginPath();
    this.ctx.moveTo(t1.x, t1.y);
    this.ctx.lineTo(t2.x, t2.y);
    this.ctx.strokeStyle = 'green';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  racunajUdaljenost(t1: Tacka, t2: Tacka): number {
    return Math.sqrt((t2.x - t1.x) ** 2 + (t2.y - t1.y) ** 2);
  }

  krugUCanvasu(): boolean {
    const canvas = this.canvasRef.nativeElement;
    return (
      this.center.x - this.radius >= 0 &&
      this.center.x + this.radius <= canvas.width &&
      this.center.y - this.radius >= 0 &&
      this.center.y + this.radius <= canvas.height
    );
  }

  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = [];
    this.radius = 0;
    this.message = '';
  }

  tackaUnutarKruga(): void {
    if (this.tacke.length < 3) {
      this.message = 'Dodajte tačku za provjeru';
      return;
    }
    const tackaZaProvjeru = this.tacke[this.tacke.length-1];
    const udaljenost = this.racunajUdaljenost(this.center, tackaZaProvjeru);
    if (udaljenost < this.radius) {
      this.message = 'Tačka se nalazi unutar kružnice.';
    } else if (udaljenost === this.radius) {
      this.message = 'Tačka se nalazi na kružnici.';
    } else {
      this.message = 'Tačka se nalazi van kružnice.';
    }
  }

  odnosSegmentaIKruga(): void {
    if (this.tacke.length < 4) {
      this.message ='Dodajte dvije tačke za segment';
      return;
    }
    const [p1, p2] = [this.tacke[this.tacke.length-2], this.tacke[this.tacke.length-1]];
    const d1 = this.racunajUdaljenost(this.center, p1);
    const d2 = this.racunajUdaljenost(this.center, p2);

    this.crtajSegment(p1, p2);

    if (d1 < this.radius && d2 < this.radius) {
      this.message = 'Segment je unutar kružnice.';
    } else if (d1 > this.radius && d2 > this.radius) {
      this.message = 'Segment je van kružnice.';
    } else {
      this.message = 'Segment siječe kružnicu.';
    }
  }
}
