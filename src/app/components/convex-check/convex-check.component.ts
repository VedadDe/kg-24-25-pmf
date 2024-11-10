import { Component, ViewChild, ElementRef } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}
@Component({
  selector: 'app-convex-check',
  templateUrl: './convex-check.component.html',
  styleUrls: ['./convex-check.component.scss']
})
export class ConvexCheckComponent {
  @ViewChild('canvas') referencaPlatna!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private tacke: Tacka[] = [];
  jeKonveksan: boolean | undefined = undefined;

  ngAfterViewInit(): void {
    this.ctx = this.referencaPlatna.nativeElement.getContext('2d')!;
  }

  naKlikPlatna(event: MouseEvent): void {
    if (this.tacke.length >= 4) return;

    const pravougaonik = this.referencaPlatna.nativeElement.getBoundingClientRect();
    const x = event.clientX - pravougaonik.left;
    const y = event.clientY - pravougaonik.top;
    const tacka: Tacka = { x, y };

    this.tacke.push(tacka);
    this.nacrtajTacku(tacka);

    if (this.tacke.length === 4) {
      this.jeKonveksan = this.provjeraKonveksnosti(this.tacke);
      this.nacrtajCetvorougaonik(this.tacke);
    }
  }

  ocisticanvas(): void {
    this.ctx.clearRect(0, 0, this.referencaPlatna.nativeElement.width, this.referencaPlatna.nativeElement.height);
    this.tacke = [];
    this.jeKonveksan = undefined;
  }

  private nacrtajTacku(tacka: Tacka): void {
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'blue';
    this.ctx.fill();
    this.ctx.closePath();
  }

  private nacrtajCetvorougaonik(tacke: Tacka[]): void {
    this.ctx.beginPath();
    this.ctx.moveTo(tacke[0].x, tacke[0].y);

    for (let i = 1; i < tacke.length; i++) {
      this.ctx.lineTo(tacke[i].x, tacke[i].y);
    }

    this.ctx.closePath();
    this.ctx.strokeStyle = 'blue';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private provjeraKonveksnosti(tacke: Tacka[]): boolean {
    let sumaUglova = 0;

    for (let i = 0; i < tacke.length; i++) {
      const t1 = tacke[i];
      const t2 = tacke[(i + 1) % tacke.length];
      const t3 = tacke[(i + 2) % tacke.length];

      const vektor1 = { x: t2.x - t1.x, y: t2.y - t1.y };
      const vektor2 = { x: t3.x - t2.x, y: t3.y - t2.y };

      const skalarskiProizvod = vektor1.x * vektor2.x + vektor1.y * vektor2.y;
      const magnituda1 = Math.sqrt(vektor1.x * vektor1.x + vektor1.y * vektor1.y);
      const magnituda2 = Math.sqrt(vektor2.x * vektor2.x + vektor2.y * vektor2.y);

      const ugao = Math.acos(skalarskiProizvod / (magnituda1 * magnituda2));
      sumaUglova += ugao;
    }

    return Math.abs(sumaUglova - 2 * Math.PI) < 1e-6;
  }

}