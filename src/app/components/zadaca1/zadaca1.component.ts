import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
interface Tacka {
  x: number;
  y: number;
}

const epsilon = 1e-2 // za testiranje koristiti veci broj za slucaj kad je tacka na kruznici npr. 1
@Component({
  selector: 'app-zadaca1',
  templateUrl: './zadaca1.component.html',
  styleUrls: ['./zadaca1.component.scss']
})

export class Zadaca1Component implements AfterViewInit{
  

  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  tacke: Tacka[] = [];
  precnikKruznice!: number;
  poruka!: string // poruka koju ispisujemo na ekranu
  kruznicaNacrtana: boolean = false // potrebna u slucaju kada nije moguce nacrtati kruznicu (jer drugu tacku ne spasavam u niz tacke)


  ngAfterViewInit() {

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 1200;  
    canvas.height = 500; 
  }

  onCanvasClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
  
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const tacka: Tacka = { x, y };
    

    if(!this.kruznicaNacrtana && this.tacke.length === 1){
      this.crtajKruznicu(tacka); // crtamo kruznicu ali ne iscrtavamo drugu tacku (na kruznici)
    }
    else {
      this.tacke.push(tacka);
      if(this.tacke.length === 1){
        this.crtajTacku(tacka, 'black'); // drugom bojom crtamo centar kruznice
      }
      else {
        this.crtajTacku(tacka, 'red');
      }
    }

  }

  crtajKruznicu(t2: Tacka): void{
    const t1 = this.tacke[0];
    this.precnikKruznice = Math.sqrt((t1.x - t2.x)**2 + (t1.y - t2.y)**2); // udaljenost izmedju dvije tacke

    // iscrtavamo kruznicu samo ako je validna
    if(this.validnaKruznica(t1.x, t1.y, this.precnikKruznice)){
      this.ctx.beginPath()
      this.ctx.moveTo(t1.x, t1.y) // crta precnik
      this.ctx.arc(t1.x, t1.y, this.precnikKruznice, 0, 2 * Math.PI)
      this.ctx.stroke()
    }
    else {
      // samo spasavamo prvu tacku dok ne budemo mogli nacrtati kruznicu
      this.tacke = [this.tacke[0]] 
    }
  }
  nacrtajSegment(): void {
    // segment crtamo od zadnje dvije tacke
    const t1 = this.tacke[this.tacke.length - 1];
    const t2 = this.tacke[this.tacke.length - 2];

    this.ctx.beginPath();
    this.ctx.moveTo(t1.x, t1.y);
    this.ctx.lineTo(t2.x, t2.y);
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
  }

  crtajTacku(tacka: Tacka, boja: string): void {
    this.poruka = ''
    this.ctx.beginPath();
    this.ctx.arc(tacka.x, tacka.y, 5, 0, 2 * Math.PI); 
    this.ctx.fillStyle = boja; 
    this.ctx.fill();  
    this.ctx.stroke();  
  }

  ocistiCanvas(): void {
    this.poruka = ''
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.tacke = []; 
    this.kruznicaNacrtana = false
  }


  validnaKruznica(x: number, y:number, r: number): boolean {
    const canvas = this.canvasRef.nativeElement;
    if(r < epsilon) {
      this.poruka = "Poluprečnik je nula - nije moguće nacrtati kružnicu."
      this.kruznicaNacrtana = false
      return false
    } 
    // provjera da li kruznica moze stati unutar kanvasa
    const provjera = (x-r >= 0 &&// lijeva strane
                      x+r <= canvas.width && // desna strana
                      y-r >= 0 && // gore
                      y+r <= canvas.height) // dole)
    if(!provjera) {
      this.kruznicaNacrtana = false
      this.poruka = "Kruznica ne moze stajati unutar kanvasa"
    }
    else {
      this.poruka = ''
      this.kruznicaNacrtana = true
    }
    return provjera
  }

  tackaUnutarKruga(): void {
    if(this.tacke.length < 2) {
      this.poruka = "Nacrtajte kružnicu"
      return 
    }
    const provjeraTacke = this.provjeriTacku(this.tacke[this.tacke.length - 1])
    if(provjeraTacke === 0) {
      this.poruka = "Tačka se nalazi na kruznici"
    }
    else if(provjeraTacke === 1) {
      this.poruka = "Tačka se nalazi unutar kruznice"
    }
    else {
      this.poruka = "Tačka se nalazi van kruznice"
    }
    
  }
  provjeriTacku(tacka: Tacka): number {
    // funkcija koja provjerava da li je tacka unutar ili izvan kruznice
    // koristi se i za provjeru da li je tacka unutar kruznice i za provjeru odnosa kruznice i segmenta

    // racunamo udaljenost između prve i zadnje tacke
    const udaljenost = Math.sqrt((tacka.x - this.tacke[0].x)**2 + (tacka.y - this.tacke[0].y)**2);
    if(Math.abs(udaljenost - this.precnikKruznice) <= epsilon) {
      return 0 // tacka se nalazi na kruznici
    }
    else if (udaljenost < this.precnikKruznice) {
      return 1 // tacka se nalazi unutar kruznice
    }
    else {
      return -1 // tacka se nalazi van kruznice
    }
  }

  odnosSegmentaIKruga(): void{
    if(!this.kruznicaNacrtana) {
      this.poruka = "Nacrtajte kružnicu"
      return
    }
    if(this.tacke.length < 3) {
      this.poruka = "Nedovoljno tačaka da se nacrta segment"
      return
    }
    this.nacrtajSegment()

    // a i b tacke koje obrazuju segment
    const a = this.tacke[this.tacke.length - 1]
    const b = this.tacke[this.tacke.length - 2]
    // c centar kruznice
    const c = this.tacke[0]

    // odnos segmenta i kruznice racunamo da osnovu udaljenosti prave od kruznice
    const d = Math.abs((b.x-a.x)*(a.y-c.y) - (a.x-c.x)*(b.y-a.y)) / Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2)

    if(Math.abs(d - this.precnikKruznice) <= epsilon) {
      this.poruka = "Segment je tangenta kruznice"
    }
    else if (d < this.precnikKruznice) {
      // segment ili sijece kruznicu ili se nalazi u njoj
      const provjeraTacke1 = this.provjeriTacku(a)
      const provjeraTacke2 = this.provjeriTacku(b)
      if(provjeraTacke1 === 1 && provjeraTacke2 === 1) {
        this.poruka = "Segment se nalazi unutar kruznice"
      }
      else {
        this.poruka = "Segment se sijece kruznice"
      }

    }
    else {
      this.poruka = "Segment se nalazi van kruznice"
    }
    
  }

}