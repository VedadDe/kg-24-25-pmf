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

export class Zadaca1Component implements AfterViewInit{
  

  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;


  ctx!: CanvasRenderingContext2D;


  tacke: Tacka[] = [];

  // pomocne varijable koje sluze da olaksaju ispis odgovarajuce poruke
  mozeLiStati = true;
  unutar = "";
  pritisnuto = false;
  poluprecnikNula = false;
  segment = "";
  pritisnutoSegment = false;

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
    this.crtajKrug();
  }

  crtajTacku(tacka: Tacka): void {
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 3, 0, 2 * Math.PI); 
    this.ctx.fillStyle = 'red'; 
    this.ctx.fill();  
    this.ctx.stroke();  
  }

  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = []; 
  }

  crtajKrug(): void {
    if (this.tacke.length == 2) {
      this.mozeLiStati = true;
      const zadnjaTacka = this.tacke[this.tacke.length - 1];
      const pretposljednjaTacka = this.tacke[this.tacke.length - 2];

      //ako su zadnje dvije tacke jednake (specijalni slucaj) onda je poluprecnik kruznice nula
      if (zadnjaTacka.x == pretposljednjaTacka.x &&
        zadnjaTacka.y == pretposljednjaTacka.y
      ){
        this.poluprecnikNula = true;
        return;
      }

      const radius = Math.sqrt(
        Math.pow(zadnjaTacka.x - pretposljednjaTacka.x, 2) +
        Math.pow(zadnjaTacka.y - pretposljednjaTacka.y, 2)
      );

      // Dimenzije canvasa - da bi mogla provjeriti moze li kruznica stati u canvas
      const canvasWidth = this.ctx.canvas.width;
      const canvasHeight = this.ctx.canvas.height;

      if (
        pretposljednjaTacka.x - radius >= 0 && pretposljednjaTacka.x + radius <= canvasWidth &&
        pretposljednjaTacka.y - radius >= 0 && pretposljednjaTacka.y + radius <= canvasHeight
      ){
          this.ctx.beginPath();
          this.ctx.arc(pretposljednjaTacka.x, pretposljednjaTacka.y, radius, 0, Math.PI * 2);
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.moveTo(pretposljednjaTacka.x, pretposljednjaTacka.y);
          this.ctx.lineTo(zadnjaTacka.x, zadnjaTacka.y);  
          this.ctx.lineWidth = 1;  
          this.ctx.stroke();  
      }
      else {
        this.mozeLiStati = false;
        //da bi korisnik mogao ponovo probati da nacrta krug
        //this.ocistiCanvas();
        this.tacke = [];
        this.crtajKrug();
      }
    }
  }

  tackaUnutarKruga(): string{
    this.pritisnuto = true && !this.poluprecnikNula && (this.tacke.length > 2);
    this.pritisnutoSegment = false;
    console.log("Tacka u odnosu na krug test")
    const centarKruga = this.tacke[0];
    const krajnjaTacka = this.tacke[1];
    const zadnjaTacka = this.tacke[this.tacke.length - 1];

    const radius = Math.sqrt(
      Math.pow(centarKruga.x - krajnjaTacka.x, 2) +
      Math.pow(centarKruga.y - krajnjaTacka.y, 2)
    );

    const udaljenost = Math.sqrt(
      Math.pow(centarKruga.x - zadnjaTacka.x, 2) +
      Math.pow(centarKruga.y - zadnjaTacka.y, 2)
    );

    if (this.tacke.length > 2){
      if (radius == udaljenost) {
        this.unutar = "Tačka se nalazi na kružnici";
      }
  
      else if (udaljenost < radius){
        this.unutar = "Tačka se nalazi unutar kružnice";
        console.log(udaljenost, " ", radius);
      }
  
      else {
        this.unutar = "Tačka se nalazi van kružnice";
        console.log(udaljenost, " ", radius);
      }
    }
    return this.unutar;
  }

  odnosSegmentaIKruga(): void{
    this.pritisnutoSegment = true && !this.poluprecnikNula && (this.tacke.length > 3);
    this.pritisnuto = false;
    console.log("Segment u odnosu na krug test")
    if (this.pritisnutoSegment){
      const centarKruga = this.tacke[0];
      const krajnjaTacka = this.tacke[1];
      const zadnjaTacka = this.tacke[this.tacke.length - 1];
      const pretposljednjaTacka = this.tacke[this.tacke.length - 2];

      this.ctx.beginPath();
      this.ctx.moveTo(pretposljednjaTacka.x, pretposljednjaTacka.y); 
      this.ctx.lineTo(zadnjaTacka.x, zadnjaTacka.y);  
      this.ctx.lineWidth = 1;  
      this.ctx.stroke();  

      const radius = Math.sqrt(
        Math.pow(centarKruga.x - krajnjaTacka.x, 2) +
        Math.pow(centarKruga.y - krajnjaTacka.y, 2)
      );

      const udaljenost1 = Math.sqrt(
        Math.pow(centarKruga.x - zadnjaTacka.x, 2) +
        Math.pow(centarKruga.y - zadnjaTacka.y, 2)
      );

      const udaljenost2 = Math.sqrt(
        Math.pow(centarKruga.x - pretposljednjaTacka.x, 2) +
        Math.pow(centarKruga.y - pretposljednjaTacka.y, 2)
      );

      if (udaljenost1 < radius && udaljenost2 < radius){
        this.segment = "Segment je unutar kružnice.";
      }

      else if (udaljenost1 < radius && udaljenost2 > radius ||
              udaljenost1 > radius && udaljenost2 < radius){
                this.segment = "Segment siječe kružnicu.";
              }
      else {
        this.segment = "Segment je van kružnice.";
      }
    }
    
  }
}