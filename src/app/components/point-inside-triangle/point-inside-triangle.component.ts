import { Component, ElementRef, ViewChild } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}
class Tacka {
  constructor(public x: number, public y: number) {}
}
const epsilon = 1e-9;


@Component({
  selector: 'app-point-inside-triangle',
  templateUrl: './point-inside-triangle.component.html',
  styleUrls: ['./point-inside-triangle.component.scss']
})
export class PointInsideTriangleComponent {
  
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  tacke: Tacka[] = [];
  prikaziModal = false;
  unutar = false;

  dodajTacku(event: MouseEvent) {
   const canvas = this.canvasRef.nativeElement;
   const pravougaonik = canvas.getBoundingClientRect();
   const x = event.clientX - pravougaonik.left;
   const y = event.clientY - pravougaonik.top;
 
   const tacka = new Tacka(x, y);
   this.tacke.push(tacka);
 
   // Crtaj tačku
   this.ctx.beginPath();
   this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI);
   this.ctx.fillStyle = 'red';
   this.ctx.fill();
   this.ctx.stroke();
 
   if (this.tacke.length === 3) {
     this.crtajTrokut();
   }
 }
 

 ngAfterViewInit() {

     // Dohvati canvas element i kontekst
     const canvas = this.canvasRef.nativeElement;
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
     this.ctx = canvas.getContext('2d')!;
     this.crtajTrokut();
 }
 

 canvasClick(event: MouseEvent) {
  const canvas = this.canvasRef.nativeElement;
  const pravougaonik = canvas.getBoundingClientRect();

  // Napravi objekat tačke iz klika
  const tacka = { x: event.offsetX, y: event.offsetY };

  //
  this.ctx.beginPath();
  this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI);
  this.ctx.fillStyle = 'red';
  this.ctx.fill();
  this.ctx.stroke();
  // Dodaj tačku u niz tačaka
  this.tacke.push(tacka);

  // Ako su tri tačke kliknute, nacrtaj trokut i dodaj osluškivač događaja za četvrti klik
  if (this.tacke.length === 3) {
    this.crtajTrokut();

    // Dodaj osluškivač događaja za četvrti klik
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('click', (e: MouseEvent) => {
      // Napravi objekat tačke iz klika
      const tacka = { x: e.offsetX, y: e.offsetY };

      // Provjeri da li je tačka unutar ili izvan trokuta
      this.unutar = this.jeLiTackaUnutarTrokuta(tacka);

      // Prikaži modal sa rezultatom
      this.prikaziModal = true;
    });
  }
}

crtajTrokut() {
  this.ctx.beginPath();
  this.ctx.moveTo(this.tacke[0].x, this.tacke[0].y);
  this.ctx.lineTo(this.tacke[1].x, this.tacke[1].y);
  this.ctx.lineTo(this.tacke[2].x, this.tacke[2].y);
  this.ctx.closePath();
  this.ctx.stroke();
}

racunajPovrsinuTrokuta(p1: Tacka, p2: Tacka, p3: Tacka) {
  return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}

jeLiTackaUnutarTrokuta(p: Tacka) {
  // Izračunaj površinu trokuta koju čini tačka i svaki rub trokuta
  const povrsina1 = this.racunajPovrsinuTrokuta(p, this.tacke[0], this.tacke[1]);
  const povrsina2 = this.racunajPovrsinuTrokuta(p, this.tacke[1], this.tacke[2]);
  const povrsina3 = this.racunajPovrsinuTrokuta(p, this.tacke[2], this.tacke[0]);

  // Izračunaj ukupnu površinu trokuta
  const ukupnaPovrsina = this.racunajPovrsinuTrokuta(this.tacke[0], this.tacke[1], this.tacke[2]);

  // Provjeri da li je zbir površina trokuta koje čini tačka i svaki rub jednak ukupnoj površini trokuta
  return (povrsina1 + povrsina2 + povrsina3) - ukupnaPovrsina<epsilon;
}

zatvoriModal() {
  this.prikaziModal = false;
  this.tacke = [];
  this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
}
}