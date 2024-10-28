import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}

const epsilon = 1e-9; 

@Component({
  selector: 'app-zadaca1',
  templateUrl: './zadaca1.component.html',
  styleUrls: ['./zadaca1.component.scss']
})

export class Zadaca1Component implements AfterViewInit{
  

  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;


  ctx!: CanvasRenderingContext2D;


  tacke: Tacka[] = [];

  prikaziModalTacka = false;
  prikaziModalSegment = false;
  prikaziModalError = false;

  error = '';
  tackaJe = 'van kruznice';
  segmentJe = 'van kruznice';


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

    //provjera da li prve dvije tacke zadovoljavaju sve potrebne uslove za crtanje kruznice
    if (this.tacke.length === 2) {
      if (this.nemogucaKruznica(this.tacke[0], this.tacke[1])) {
        console.log('nemoguca kruznica');
        this.error = 'kruznica ne moze stati na kanvas';
        this.prikaziModalError = true;
      }
      else if (this.jesuLiJednake(this.tacke[0], this.tacke[1])) {
        console.log('jednake tacke');
        this.error = 'poluprecnik kruznice je nula - nije moguce nacrtati kruznicu';
        this.prikaziModalError = true;
      }
        
      else this.crtajKruznicu(this.tacke[0], this.tacke[1]);
    }
  }

  nemogucaKruznica(centar: Tacka, druga: Tacka): boolean {
    const canvas = this.canvasRef.nativeElement;
    const poluprecnik = Math.sqrt(Math.pow(centar.x - druga.x, 2) + Math.pow(centar.y - druga.y, 2));

    if (centar.x - poluprecnik <= 0
      || centar.x + poluprecnik >= canvas.width
      || centar.y - poluprecnik <= 0
      || centar.y + poluprecnik >= canvas.height
    ) return true;

    return false;

  }

  //provjera da li su prve dvije tacke jednake metodom epsilona
  jesuLiJednake(prva: Tacka, druga: Tacka): boolean {
    if (Math.abs(prva.x - druga.x) < epsilon && Math.abs(prva.y - druga.y) < epsilon )  return true;
    return false;
  }
  
  crtajKruznicu(centar: Tacka, druga: Tacka): void {
    const poluprecnik = Math.sqrt(Math.pow(centar.x - druga.x, 2) + Math.pow(centar.y - druga.y, 2));
    this.ctx.beginPath();
    this.ctx.arc(centar.x, centar.y, poluprecnik, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fill();  
    this.ctx.stroke();  

    //crtanje linije poluprecnika
    this.ctx.beginPath();
    this.ctx.moveTo(centar.x, centar.y);
    this.ctx.lineTo(druga.x, druga.y);
    this.ctx.closePath();
    this.ctx.stroke();


  }

  crtajTacku(tacka: Tacka): void {
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI); 
    this.ctx.fillStyle = 'red'; 
    this.ctx.fill();  
    this.ctx.stroke();  
  }

  crtajSegment(prva: Tacka, druga: Tacka): void {
    this.ctx.beginPath();
    this.ctx.moveTo(prva.x, prva.y);
    this.ctx.lineTo(druga.x, druga.y);
    this.ctx.closePath();
    this.ctx.stroke();    
  }



  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = []; 
  }

  //radi na principu uporedjivanja udaljenosti testne tacke od centra i poluprecnika kruznice
  //ako su udaljenost i poluprecnik isti (po epsilon metodi) smatra se da je tacka na kruznici
  tackaUnutarKruga(): void{
    console.log("Tacka u odnosu na krug test")

    if (this.tacke.length > 2) {
      const centar = this.tacke[0];
      const druga = this.tacke[1];
      const poluprecnik = Math.sqrt(Math.pow(centar.x - druga.x, 2) + Math.pow(centar.y - druga.y, 2));

      const testnaTacka = this.tacke[this.tacke.length-1];
      const udaljenostOdCentra = Math.sqrt(Math.pow(centar.x - testnaTacka.x, 2) + Math.pow(centar.y - testnaTacka.y, 2));

      if (Math.abs(poluprecnik-udaljenostOdCentra) < epsilon)
        this.tackaJe = 'na kruznici';
      else if (poluprecnik > udaljenostOdCentra)
        this.tackaJe = 'u kruznici';

      else { this.tackaJe = 'van kruznice'; }

      this.prikaziModalTacka = true;
    }
  }

  odnosSegmentaIKruga(): void{
    console.log("Segment u odnosu na krug test")

    if (this.tacke.length > 3) {
      const centar = this.tacke[0];
      const druga = this.tacke[1];
      const poluprecnik = Math.sqrt(Math.pow(centar.x - druga.x, 2) + Math.pow(centar.y - druga.y, 2));

      const posljednja = this.tacke[this.tacke.length-1];
      const udaljenostOdCentraPosljednja = Math.sqrt(Math.pow(centar.x - posljednja.x, 2) + Math.pow(centar.y - posljednja.y, 2));
      const pretposljednja = this.tacke[this.tacke.length-2];
      const udaljenostOdCentraPretposljednja = Math.sqrt(Math.pow(centar.x - pretposljednja.x, 2) + Math.pow(centar.y - pretposljednja.y, 2));

      this.crtajSegment(posljednja, pretposljednja);

      //provjera da li su tacke segmenta unutar ili van kruznice
      if (poluprecnik >= udaljenostOdCentraPosljednja && poluprecnik >= udaljenostOdCentraPretposljednja) {
        this.segmentJe = 'unutar kruznice';
      }

      else if ((poluprecnik >= udaljenostOdCentraPosljednja && poluprecnik <= udaljenostOdCentraPretposljednja) 
        || (poluprecnik <= udaljenostOdCentraPosljednja && poluprecnik >= udaljenostOdCentraPretposljednja)) {
          this.segmentJe = 'sijece kruznicu';
        }

      //ako su tacke van segmenta, racuna se udaljenost segmenta od tacke i provjerava se da li je najbliza tacka na segmentu
      else {
        console.log('obje tacke izvan kruznice');
        let a = posljednja.y - pretposljednja.y;
        let b = pretposljednja.x - posljednja.x;
        let c = posljednja.x*pretposljednja.y - pretposljednja.x*posljednja.y;

        const udaljenostSegmentaOdCentra = Math.abs(a*centar.x + b*centar.y + c) / (Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
        console.log('udaljenost segmenta od centra pa poluprecnik:', udaljenostSegmentaOdCentra, poluprecnik);

        if (poluprecnik <= udaljenostSegmentaOdCentra) { 
          console.log('segment je dalji od poluprecnika');
          this.segmentJe = 'van kruznice'; 
        }
        else {
          console.log('prava sijece kruznicu');
          const presjecnaTackaX = (b*(b*centar.x - a*centar.y) - a*c)/(Math.pow(a, 2) + Math.pow(b, 2));
          const presjecnaTackaY = (a*((-b)*centar.x + a*centar.y) - b*c)/(Math.pow(a, 2) + Math.pow(b, 2));

          console.log('presjecna tacka ima koordinate: ', presjecnaTackaX, presjecnaTackaY);

          const presjecnaTacka: Tacka = { x:presjecnaTackaX, y:presjecnaTackaY};          

          if (presjecnaTackaX >= Math.min(posljednja.x, pretposljednja.x)
            && presjecnaTackaX <= Math.max(posljednja.x, pretposljednja.x)
            && presjecnaTackaY >= Math.min(posljednja.y, pretposljednja.y)
            && presjecnaTackaY <= Math.max(posljednja.y, pretposljednja.y)) this.segmentJe = 'sijece kruznicu';
          else this.segmentJe = 'van kruznice';
        }

      }
      

      this.prikaziModalSegment = true;
    }
  }

  zatvoriModalTacka() {
    this.prikaziModalTacka = false;
    this.tackaJe = 'van kruznice';
    this.tacke = [];
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  zatvoriModalSegment() {
    this.prikaziModalSegment = false;
    this.segmentJe = 'van kruznice';
    this.tacke = [];
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  zatvoriModalError() {
    this.prikaziModalError = false;
    this.tacke = [];
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }
}