import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
interface Tacka {
  x: number;
  y: number;
}
const epsilon: number = 1e-9;
@Component({
  selector: 'app-zadaca1',
  templateUrl: './zadaca1.component.html',
  styleUrls: ['./zadaca1.component.scss']
})

export class Zadaca1Component implements AfterViewInit{
  

  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ctx!: CanvasRenderingContext2D;

  tacke: Tacka[] = [];


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

    // Ako su dvije tačke kliknute, onda crtamo kružnicu
    if(this.tacke.length === 2) {
      // Računamo poluprečnik kružnice
      const radius = this.getPoluprecnik();

      // Prvojeravamo da li je poluprecnik = 0
      if(radius < epsilon) {
        const poruka = document.getElementById("poruka");
        if(poruka) {
          poruka.innerText = "Poluprečnik kružnice je nula – nije moguće nacrtati kružnicu"
        }
        this.ocistiCanvas();
      }
      // Provjeravamo da li kruznica moze stati na kanvas
      else if((this.tacke[0].x - radius < 0) || (this.tacke[0].y - radius < 0) || (this.tacke[0].x + radius >= rect.width) || this.tacke[0].y + radius >= rect.height) {
        const poruka = document.getElementById("poruka");
        if(poruka != null) {
          poruka.innerText = "Kružnica ne može stati unutar kanvasa";
          this.ocistiCanvas();
        }
      }
      else {
        this.ctx.beginPath();
        this.ctx.arc(this.tacke[0].x, this.tacke[0].y, radius, 0, 2 * Math.PI);    
        this.ctx.stroke();
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



  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = []; 
  }

  getPoluprecnik(): number {

    return this.udaljenostTacaka(this.tacke[0], this.tacke[1]);
  }
  
  udaljenostTacaka(A: Tacka, B: Tacka): number {
    const dx = A.x - B.x;
    const dy = A.y - B.y; 
    const udaljenost = Math.sqrt(dx*dx + dy*dy);
    return udaljenost;
  }

  tackaUnutarKruga(): void{
    if(this.tacke.length < 2) {
      return;
    }
    const radius = this.getPoluprecnik();
    
    // Racunamo udaljenost posljednje dodane tacke od centra kruznice i taj rezultat cemo uporediti sa poluprecnikom
    const udaljenost: number = this.udaljenostTacaka(this.tacke[0], this.tacke[this.tacke.length-1]);
    if(Math.abs(udaljenost - radius) < epsilon) {
      // Tacka je na kruznici
      const poruka = document.getElementById("poruka");
      if(poruka != null) {
        poruka.innerText = "Tačka se nalazi na kružnici";
      }

    } else if(udaljenost < radius) {
      // Tacka je unutar kruznice
      const poruka = document.getElementById("poruka");
      if(poruka != null) {
        poruka.innerText = "Tačka se nalazi unutar kružnice";
      } 
    
    } else {
      // Tacka je van kruznice
      const poruka = document.getElementById("poruka");
      if(poruka != null) {
        poruka.innerText = "Tačka se nalazi van kružnice";
      } 
    }
  }

  odnosSegmentaIKruga(): void{
    console.log("Segment u odnosu na krug test")
  }

}