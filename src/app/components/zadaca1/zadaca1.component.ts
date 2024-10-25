import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
interface Tacka {
  x: number;
  y: number;
}
const epsilon: number = 1e-9;

function prikaziPoruku(msg: string) {
  const poruka: HTMLElement | null = document.getElementById("poruka");
  if(poruka) {
    poruka.innerText = msg;
  } 
}


// Pomoćna funkcija koja računa udaljenost izdmeđu dvije tačke
function udaljenostTacaka(A: Tacka, B: Tacka): number {
  const dx = A.x - B.x;
  const dy = A.y - B.y; 
  const udaljenost = Math.sqrt(dx*dx + dy*dy);
  return udaljenost;
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

  ngAfterViewInit() {

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 1900;  
    canvas.height = 800; 
  }

  // Metoda koja računa poluprečnik kružnice
  getPoluprecnik(): number {
    return udaljenostTacaka(this.tacke[0], this.tacke[1]);
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
        prikaziPoruku("Poluprečnik kružnice je nula – nije moguće nacrtati kružnicu");
        const canvas = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.tacke = [];
      }
      // Provjeravamo da li kruznica moze stati na kanvas
      else if((this.tacke[0].x - radius < 0) || (this.tacke[0].y - radius < 0) || (this.tacke[0].x + radius >= rect.width) || this.tacke[0].y + radius >= rect.height) {
        prikaziPoruku("Kružnica ne može stati unutar kanvasa");
        const canvas = this.canvasRef.nativeElement;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.tacke = [];        
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

  crtajSegment(): void {
    this.ctx.beginPath();
    this.ctx.moveTo(this.tacke[this.tacke.length-2].x, this.tacke[this.tacke.length-2].y);
    this.ctx.lineTo(this.tacke[this.tacke.length-1].x, this.tacke[this.tacke.length-1].y);    
    this.ctx.stroke();
  }


  ocistiCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = [];
    prikaziPoruku("") 
  }
  
  tackaUnutarKruga(): void {
    if(this.tacke.length < 2) {
      return;
    }
    const radius = this.getPoluprecnik();
    
    // Racunamo udaljenost posljednje dodane tacke od centra kruznice i taj rezultat cemo uporediti sa poluprecnikom
    const udaljenost: number = udaljenostTacaka(this.tacke[0], this.tacke[this.tacke.length-1]);
    if(Math.abs(udaljenost - radius) < epsilon) {
      // Tacka je na kruznici
      prikaziPoruku("Tačka se nalazi na kružnici");

    } else if(udaljenost < radius) {
      // Tacka je unutar kruznice
      prikaziPoruku("Tačka se nalazi unutar kružnice");
    
    } else {
      // Tacka je van kruznice
      prikaziPoruku("Tačka se nalazi van kružnice")
    }
  }

  odnosSegmentaIKruga(): void {
    if(this.tacke.length < 2) {
      return;
    }

    this.crtajSegment();
   
    // Uzimamo krajnje tacke segmenta
    const tackaA: Tacka = this.tacke[this.tacke.length-2];
    const tackaB: Tacka = this.tacke[this.tacke.length-1];

    const udaljenostA: number = udaljenostTacaka(tackaA, this.tacke[0]); // udaljenost tacke A od centra kruznice
    const udaljenostB: number = udaljenostTacaka(tackaB, this.tacke[0]); // udaljenost tacke B od centra kruznice

    const radius: number = this.getPoluprecnik(); // poluprecnik kruznice

    const povrsinaTrougla: number = tackaA.x * (tackaB.y - this.tacke[0].y) + tackaB.x * (this.tacke[0].y - tackaA.y) + this.tacke[0].x * (tackaA.y - tackaB.y);

    // Racunamo duzinu projekcije centra kruznice na pravu AB.
    const projekcijaCentra: number = Math.abs(povrsinaTrougla) / udaljenostTacaka(tackaA, tackaB);

    // Ukoliko je bar jedna od tacaka A ili B na kruznici onda segment sijece kruznicu
    if(Math.abs(udaljenostA - radius) < epsilon || Math.abs(udaljenostB - radius) < epsilon) {
      prikaziPoruku("Segment siječe kružnicu.");
    }
    // Segment se nalazi unutar kruznice ukoliko se i tacka A i tacka B nalaze unutar kruznice
    else if(udaljenostA < radius && udaljenostB < radius) {
      prikaziPoruku("Segment je unutar kružnice.");
    }
    //  Ako se jedna od tačaka A ili B nalazi unutar kruznice, a druga van, onda segment siječe kružnicu
    else if( (udaljenostA < radius && udaljenostB > radius) || (udaljenostA > radius && udaljenostB < radius)) {
      prikaziPoruku("Segment siječe kružnicu.");
    }
    // Ako je duzina projekcije centra kruznice jednaka poluprecniku, onda segment sijece kruznicu (tada je on tangenta kruznice).
    else if(Math.abs(projekcijaCentra - radius) < epsilon) {
      prikaziPoruku("Segment siječe kružnicu.");
    }
    // Ako je duzina projekcije centra kruznice veca od poluprecnika, onda se segment nalazi izvan kruznice
    else if(projekcijaCentra > radius) {
      prikaziPoruku("Segment je van kružnice.")
    }
    // Ako je duzina projekcije centra kruznice manja od poluprecnika onda je dovoljno provjeriti da li se tacka projekcija nalazi na segmentu
    else {
      /*
        Neka je dat segment AB i centar kruznice C. Projekcija tacke C lezi na segmentu AB ako i samo ako su uglovi CAB i CBA oštri.
        Ugao CAB je oštar samo ako je skalarni proizvod vektora CA i BA veci od 0. Analogno provjeravamo da li je CBA ošar (skalarni proizvod CB i AB).

        Napomena: mogli smo izracunati i tacne koordinate projekcije, pa onda provjeriti da li je ta tacka na segmentu, ali ovako je jednostavnije :)
      */
      
      if(((tackaA.x - this.tacke[0].x)*(tackaA.x - tackaB.x) + (tackaA.y - this.tacke[0].y)*(tackaA.y - tackaB.y)  > 0) && 
      ((tackaB.x - this.tacke[0].x)*(tackaB.x - tackaA.x) + (tackaB.y - this.tacke[0].y)*(tackaB.y - tackaA.y)  > 0)) {
        prikaziPoruku("Segment siječe kružnicu.");
      }

      else {
        prikaziPoruku("Segment je van kružnice.")
      }
    } 

  }

}