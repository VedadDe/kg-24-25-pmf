import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-jarvis-march',
  templateUrl: './jarvis-march.component.html',
  styleUrls: ['./jarvis-march.component.scss']
})
export class JarvisMarchComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>; 
  tacke: { x: number; y: number }[] = [];
  omotaci: { x: number; y: number }[][] = []; 
  generisaniOmotači: boolean = false;  // Flag za provjeru da su omotači generisani, nakon kliknutog dugmeta za poziv DivideIntoConvex postavlja se na true 

  ngOnInit(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    canvasEl.addEventListener('click', (dogadjaj: MouseEvent) => {
      const pravougaonik = canvasEl.getBoundingClientRect();
      const x = dogadjaj.clientX - pravougaonik.left;
      const y = dogadjaj.clientY - pravougaonik.top;

      if (this.generisaniOmotači) {
        // Provjera za tačku nakon generisanja omotača
        this.provjeraTacke({ x, y });
      } else {
        // dodavanje tački ako omotači nisu generisani
        this.tacke.push({ x, y });
        if (kontekst) {
          this.crtajTacke(kontekst);
        }
      }
    });
  }

  // u niz omotaci smjesta sve omotace od veceg ka manjem
  DivideIntoConvex(): void {
    this.generisaniOmotači = true
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');


    // najmanji omotac se moze napraviti sa 3 tacke (trougao) pa sve dok postoje
    // tri tacke koje ne pripadaju nekom od omotaca prave se novi omotaci
    while (this.tacke.length >= 3) {
      
      // grahamAlgoritam modifikovan tako da u nizu this.tacke ostaju samo 
      // tacke koje nisu iskoristene u nekom od omotaca
      let omotac = this.grahamovAlgoritam(this.tacke) // O(n^2)
      this.omotaci.push(omotac)
      this.crtajOmotac(kontekst, omotac)
    }

    // ostatak tacaka nije u omotacima tako da ih vise ne posmatramo (nije neophodno)
    this.tacke = []

  }

  // provjeraTacke: 
  provjeraTacke(point: { x: number; y: number }): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');

    this.binarnaPretragaOmotaca(point) 
    
  }
  
  // binarna pretraga omotaca koji su poredani od veceg ka manjem
  // sama pretraga po nizu omotaci je O(log(broj_omotaca)) dok je funkcija tackaUOmotacu
  // takodjer implementirana kao binarna pretraga - O(log(broj_tacaka_omotaca)
  // ukupna kompleksnost funkcije binarnaPretragaOmotaca je O(log^2(n))
  binarnaPretragaOmotaca(point: {x: number, y: number}) {
    let lijevo = 0;
    let desno = this.omotaci.length

    while(desno - lijevo > 1) {
      let srednjiIndeks = lijevo + Math.floor((desno - lijevo)/2)

      if(this.tackaUOmotacu(point, this.omotaci[srednjiIndeks])) {
        // tacka se mozda nalazi u omotacu manjem od srednjeg omotaca pa pomijeramo 
        // lijevu granicu na srednjiIndeks
        lijevo = srednjiIndeks
      }
      else {
        // moguce da se nalazi samo u vecim omotacima pa pomijeramo
        // desnu granicu na srednjiIndeks
        desno = srednjiIndeks
      }
    }
    //console.log("lijevo ", lijevo, "desno ", desno)

    if(lijevo === 0) { // treba provjeriti da li se uopste nalazi u najvecem omotacu
      if(this.tackaUOmotacu(point, this.omotaci[0])) {
        // obojati samo najveci omotac
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        const kontekst = canvasEl.getContext('2d');
        this.crtajOmotac(kontekst, this.omotaci[0], 'yellow')
      }
      // inace se ne nalazi niti u jednom

    }
    else {
      // treba obojati od lijevog omotaca pa sve manje indekse
      const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
      const kontekst = canvasEl.getContext('2d');
      for(let i = 0; i<=lijevo; i++) {
        this.crtajOmotac(kontekst, this.omotaci[i], 'yellow')
      }
    }
  }

  racunajPovrsinuTrokuta(p1: {x: number, y:number}, p2: {x: number, y:number}, p3: {x: number, y:number}) {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
  }
  
  jeLiTackaUnutarTrokuta(a: {x: number, y:number}, b: {x: number, y:number}, c: {x: number, y:number}, p: {x: number, y:number}) {
    // Izračunaj površinu trokuta koju čini tačka i svaki rub trokuta
    const povrsina1 = this.racunajPovrsinuTrokuta(p, a, b);
    const povrsina2 = this.racunajPovrsinuTrokuta(p, b, c);
    const povrsina3 = this.racunajPovrsinuTrokuta(p, c, a);
  
    // Izračunaj ukupnu površinu trokuta
    const ukupnaPovrsina = this.racunajPovrsinuTrokuta(a, b, c);
  
    // Provjeri da li je zbir površina trokuta koje čini tačka i svaki rub jednak ukupnoj površini trokuta
    return (povrsina1 + povrsina2 + povrsina3) - ukupnaPovrsina<0.001;
  }



  tackaUOmotacu(point: { x: number; y: number }, hull: { x: number; y: number }[]): boolean {
    
    // binarna pretraga da li se tacka nalazi u konveksnom omotacu - O(log(broj_tacaka_omotaca))
    // na kraju pretrage ostanemo sa samo 3 tacke nakon cega odredjujemo da li se tacka 
    // nalazi u trouglu koje obrazuju te tri tacke te na osnovu toga odredjujemo da li je tacka u
    // posmatranom poligonu ili ne
    while (hull.length > 3) {
        let srednjiIndeks = Math.floor(hull.length / 2);
        
        if (this.vektorskiProizvod(hull[0], hull[srednjiIndeks], point) <= 0) {
            console.log("Pozitivna orijentacija");
            // potrebno posmatrati niz od 0 do srednjiIndeks
            hull = hull.slice(0, srednjiIndeks + 1);
        } else {
            console.log("Negativna orijentacija");
            // potrebno posmatrati niz koji se sastoji od hull[0] te svih tacaka od srednjiIndeks pa nadalje
            hull = [hull[0]].concat(hull.slice(srednjiIndeks));
        }
    }

    // Provjeri da li je tačka unutar trougla definisanog sa tri preostale tačke u hull
    // funkcije uzete iz point-inside-triangle
    let uTrouglu = this.jeLiTackaUnutarTrokuta(hull[0], hull[1], hull[2], point);
   
    return uTrouglu;
}


  crtajOmotac(kontekst: CanvasRenderingContext2D | null, omotac: { x: number; y: number }[], color: string = 'red'): void {
    if (!kontekst) return;
    kontekst.strokeStyle = color;
    kontekst.beginPath();
    kontekst.moveTo(omotac[0].x, omotac[0].y);
    for (let i = 1; i < omotac.length; i++) {
      kontekst.lineTo(omotac[i].x, omotac[i].y);
    }
    kontekst.closePath();
    kontekst.stroke();
  }


  //invertovan koordinatni sistem, kako bi se poklapao sa tradicionalnim pogledom
//   jarvisMarch(tacke: { x: number; y: number }[], canvasHeight: number): { x: number; y: number }[] { 
//     const transformedPoints = tacke.map(point => ({ x: point.x, y: canvasHeight - point.y }));
//     let najniziIndeks = 0;
//     for (let i = 1; i < transformedPoints.length; i++) {
//       if (
//         transformedPoints[i].y < transformedPoints[najniziIndeks].y || 
//         (transformedPoints[i].y === transformedPoints[najniziIndeks].y && transformedPoints[i].x < transformedPoints[najniziIndeks].x)
//       ) {
//         najniziIndeks = i;
//       }
//     }
//     console.log(najniziIndeks)


//     const omotac: { x: number; y: number }[] = [transformedPoints[najniziIndeks]];
  
//     let trenutnaTacka = najniziIndeks;
//     let krajnjaTacka: number;
//     do {
//       krajnjaTacka = 0;
//       for (let i = 1; i < transformedPoints.length; i++) {
//         if (
//           trenutnaTacka === krajnjaTacka || 
//           this.jeSuprotnoOdSata(transformedPoints[trenutnaTacka], transformedPoints[i], transformedPoints[krajnjaTacka])
//         ) {
//           krajnjaTacka = i;
//         }
//       }
//       omotac.push(transformedPoints[krajnjaTacka]);
//       trenutnaTacka = krajnjaTacka;
//     } while (trenutnaTacka !== najniziIndeks);

//     const result = omotac.map(point => ({ x: point.x, y: canvasHeight - point.y }));
//     return result;
// }

  jarvisMarch(tacke: { x: number; y: number }[]): { x: number; y: number }[] {
    let najniziIndeks = 0;
    for (let i = 1; i < tacke.length; i++) {
      if (tacke[i].y < tacke[najniziIndeks].y || (tacke[i].y === tacke[najniziIndeks].y && tacke[i].x < tacke[najniziIndeks].x)) {
        najniziIndeks = i;
      }
    }
    console.log(najniziIndeks)
    const omotac: { x: number; y: number }[] = [tacke[najniziIndeks]];
  
    let trenutnaTacka = najniziIndeks;
    let krajnjaTacka: number;
    do {
      krajnjaTacka = 0;
      for (let i = 1; i < tacke.length; i++) {
        if (trenutnaTacka === krajnjaTacka || this.jeSuprotnoOdSata(tacke[trenutnaTacka], tacke[i], tacke[krajnjaTacka])) {
          console.log(trenutnaTacka, i, krajnjaTacka, "test1")
          krajnjaTacka = i;
        }
      }
      omotac.push(tacke[krajnjaTacka]);
      trenutnaTacka = krajnjaTacka;
      console.log(trenutnaTacka, najniziIndeks, "test2")
    } while (trenutnaTacka !== najniziIndeks);
  
     return omotac;
  }


  grahamovAlgoritam(tacke: { x: number; y: number }[]): { x: number; y: number }[] {
    let najniziIndeks = 0;
    let ostaleTacke: { x: number; y: number }[] = [] // cuva sve tacke koje nisu na omotacu i njih smjesta u niz tacke
    for (let i = 1; i < tacke.length; i++) {
      if (tacke[i].y < tacke[najniziIndeks].y || (tacke[i].y === tacke[najniziIndeks].y && tacke[i].x < tacke[najniziIndeks].x)) {
        najniziIndeks = i;
      }
    }
    const omotac: { x: number; y: number }[] = [tacke[najniziIndeks]];
    
    let najniziIndeksTacka = tacke[najniziIndeks]
    tacke.splice(najniziIndeks, 1); 

    tacke.sort((a, b) => this.porediPolarniUgao(najniziIndeksTacka, a, b));
    omotac.push(tacke[0])
    tacke.splice(0, 1); 

    for (let i = 0; i < tacke.length; i++) {

        while (
            omotac.length >= 2 &&
            this.vektorskiProizvod(
                omotac[omotac.length - 2],
                omotac[omotac.length - 1],
                tacke[i]
            ) <= 0
        ) {
            ostaleTacke.push(omotac.pop() as { x: number; y: number });
        }
        omotac.push(tacke[i]); 
    }

    this.tacke = ostaleTacke
    
    return omotac;
  }



  
  
  vektorskiProizvod(o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
    console.log(o, a, b)
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  porediPolarniUgao(tacka0: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
    const vp = this.vektorskiProizvod(tacka0, a, b);
    if (vp === 0) {
      return Math.sqrt(Math.pow(a.x - tacka0.x, 2) + Math.pow(a.y - tacka0.y, 2)) - Math.sqrt(Math.pow(b.x - tacka0.x, 2) + Math.pow(b.y - tacka0.y, 2));
    }
    return Math.atan2(a.y - tacka0.y, a.x - tacka0.x) - Math.atan2(b.y - tacka0.y, b.x - tacka0.x);
  }


  pokreniJarvisMarch(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');
    // const omotac = this.jarvisMarch(this.tacke, canvasEl.height);
    const omotac = this.jarvisMarch(this.tacke,);
    this.crtajOmotac(kontekst, omotac);
    console.log("gotovo")
  }
  pokreniGrahamScan(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');
    const omotac = this.grahamovAlgoritam(this.tacke);
    this.crtajOmotac(kontekst, omotac);
    console.log("gotovo")
  }
  jeSuprotnoOdSata(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): boolean {
    const vektorskiProizvod = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    return vektorskiProizvod > 0;
}


  crtajTacke(kontekst: CanvasRenderingContext2D): void {
      const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
      kontekst.clearRect(0, 0, canvasEl.width, canvasEl.height);
      kontekst.lineWidth = 1;

      this.tacke.forEach((tacka) => {
          kontekst.beginPath();
          kontekst.arc(tacka.x, tacka.y, 2, 0, 2 * Math.PI);
          kontekst.fill();
          kontekst.stroke();
      });
  }

  generisiTacke(): void {
      const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
      const kontekst = canvasEl.getContext('2d');
      const brojTacka = 100000;
      this.tacke = [];
      for (let i = 0; i < brojTacka; i++) {
          const x = Math.floor(Math.random() * canvasEl.width);
          const y = Math.floor(Math.random() * canvasEl.height);
          this.tacke.push({ x, y });
      }
      if (kontekst) {
          this.crtajTacke(kontekst);
      }
  }

}