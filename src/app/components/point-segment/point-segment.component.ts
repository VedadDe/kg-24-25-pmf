import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}

@Component({
  selector: 'app-point-segment',
  templateUrl: './point-segment.component.html',
  styleUrls: ['./point-segment.component.scss']
})
export class PointSegmentComponent implements AfterViewInit {
  
  // Pristupamo referenci na HTML canvas element
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Kontekst za crtanje na platnu
  ctx!: CanvasRenderingContext2D;

  // Niz za pohranu tačaka koje korisnik dodaje
  tacke: Tacka[] = [];

  // Metoda koja se poziva nakon inicijalizacije pogleda
  ngAfterViewInit() {
    // Inicijaliziramo canvas i njegov kontekst nakon što je pogled inicijaliziran
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 600;  // Postavljamo širinu canvas-a na 600 piksela
    canvas.height = 400; // Postavljamo visinu canvas-a na 400 piksela
  }

  onCanvasClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
  
    // Correct for device pixel ratio to get accurate coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
  
    // Calculate the coordinates relative to the canvas and account for scaling
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
  
    // Create a new point and add it to the points array
    const tacka: Tacka = { x, y };
    this.tacke.push(tacka);
  
    // Draw the point on the canvas
    this.crtajTacku(tacka);
  }
  

  // Metoda za crtanje tačke na canvas-u
  crtajTacku(tacka: Tacka): void {
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI); // Kreiramo krug na koordinatama tačke
    this.ctx.fillStyle = 'red'; // Postavljamo crvenu boju za ispunu kruga
    this.ctx.fill();  // Popunjavamo krug bojom
    this.ctx.stroke();  // Ocrtavamo konturu kruga
  }

  // Metoda za crtanje segmenta (linije) između posljednje dvije tačke
  crtajSegment(): void {
    // Provjeravamo da li postoje barem dvije tačke kako bi se mogao nacrtati segment
    if (this.tacke.length >= 2) {
      const zadnjaTacka = this.tacke[this.tacke.length - 1];
      const pretposljednjaTacka = this.tacke[this.tacke.length - 2];

      // Crtamo liniju između zadnje dvije tačke
      this.ctx.beginPath();
      this.ctx.moveTo(pretposljednjaTacka.x, pretposljednjaTacka.y);  // Postavljamo početnu tačku linije
      this.ctx.lineTo(zadnjaTacka.x, zadnjaTacka.y);  // Crtamo liniju do zadnje tačke
      this.ctx.strokeStyle = 'blue';  // Postavljamo plavu boju za liniju
      this.ctx.lineWidth = 2;  // Debljina linije
      this.ctx.stroke();  // Crtamo liniju na canvas-u
    }
  }

  // Opcionalna metoda za brisanje canvas-a i resetiranje tačaka
  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);  // Brišemo cijeli sadržaj canvas-a
    this.tacke = [];  // Praznimo niz tačaka
  }
}