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
      console.log("nova tacka: ", {x,y});

      if (this.generisaniOmotači) {
        // Provjera za tačku nakon generisanja omotača
        this.provjeraTacke({ x, y });
        //kada generisemo omotace iscrtavamo novu tacku
        kontekst?.beginPath();
        kontekst?.arc(x, y, 2, 0, 2 * Math.PI);
        kontekst?.fill();
        kontekst?.stroke();
      } else {
        // dodavanje tački ako omotači nisu generisani
        this.tacke.push({ x, y });
        if (kontekst) {
          this.crtajTacke(kontekst);
        }
      }
    });
  }

  // funkcija generisiTacke2 je prekopirana Vaša funkcija, samo što generiše manje tačaka - radi lakšeg tesiranja
  generisiTacke2(): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');
    const brojTacka = 60;
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

  // ModifikovanGrahamovAlgoritam - jedina razlika je ta što je dodana još jedna petlja u cilju brisanja tačaka koje se nalaze na konveksnom omotacu iz skupa svih tacaka.
  ModifikovanGrahamovAlgoritam(): { x: number; y: number }[] {
    let najniziIndeks = 0;
    for (let i = 1; i < this.tacke.length; i++) {
        if (this.tacke[i].y < this.tacke[najniziIndeks].y || (this.tacke[i].y === this.tacke[najniziIndeks].y && this.tacke[i].x < this.tacke[najniziIndeks].x)) {
            najniziIndeks = i;
        }
    }

    const omotac: { x: number; y: number }[] = [this.tacke[najniziIndeks]];

    let najniziIndeksTacka = this.tacke[najniziIndeks];

    this.tacke.sort((a, b) => this.porediPolarniUgao(najniziIndeksTacka, a, b));
    omotac.push(this.tacke[0]);

    for (let i = 0; i < this.tacke.length; i++) {
        while (
            omotac.length >= 2 &&
            this.vektorskiProizvod(
                omotac[omotac.length - 2],
                omotac[omotac.length - 1],
                this.tacke[i]
            ) <= 0
        ) {
            omotac.pop();
        }
        omotac.push(this.tacke[i]);
    }
    
    // console.log("tacke: ", this.tacke);
    // console.log("omotac: ", omotac);
   
    // Prvi nacin na koji sam uradila ovaj dio zadatka je bio da, prilikom svakog dodavanja i brisanja tacka iz niza "omotac", azuriram niz koji cuva indekse tacka koje su na omotacu.
    // Međutim, kada sam pronašla ugrađenu funkciju indexOf, uradila sam na ovaj način kako bih izbjegla potencijalne bug-ove.
    // Dakle, koristila sam funkciju indexOf u cilju pronalaska indeksa na kojem se nalazi odgovarajuca tacka konveksnog omotaca u nizu "tacke".
    for (let i=0;i<omotac.length; i++){
      let indeks = this.tacke.indexOf(omotac[i]);
      this.tacke.splice(indeks,1);
    }

    return omotac;
}


DivideIntoConvex(): void {
    this.generisaniOmotači = true;
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');

    // Sve dok ima dovoljno tacaka da bi se mogao napraviti novi konveksni omotac, pozivam funkciju ModifikovanGrahamovAlgoritam.
    // Kada se napravi novi omotac, onda ga dodajem u niz omotaci.
    while (this.tacke.length >= 3) {
        let omotac = this.ModifikovanGrahamovAlgoritam();
        this.omotaci.push(omotac);
        this.crtajOmotac(kontekst, omotac);
    }
}

  // provjeraTacke: 
  provjeraTacke(point: { x: number; y: number }): void {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const kontekst = canvasEl.getContext('2d');

    // Ovdje su napravljena dva niza, jer sam uradila ovaj dio zadatka na dva nacina
    const indeksiOmotaca: number [] = [];
    const indeksiOmotaca2: number [] = [];
    
    // Prvi način: binarna pretraga
    let p: number = 0; 
    let k: number = this.omotaci.length - 1;

    // Prvo moram provjeriti da li ima vise od dva omotaca, jer ako ima 1 ili 2 omotaca to je specijalni slucaj i ne bi bio zadovoljen uslov donje petlje.
    if (this.omotaci.length <= 2) {
      for (let i = 0; i < this.omotaci.length; i++) {
        if (!this.tackaUOmotacu(point, this.omotaci[i])) {
          indeksiOmotaca2.push(i);
        }
      }
    } else {
        while (k - p > 1) {
          let s: number = Math.floor(p + (k - p) / 2);
          if (this.tackaUOmotacu(point, this.omotaci[s])) {
            p = s; // Tacka je unutar omotaca, pretrazujemo desno
          } else {
            k = s; // Tacka nije unutar omotaca, pretrazujemo lijevo
          }
        }
        // k cuva indeks prvog omotaca koji ne sadrzi tačku koju ispitujemo.
        // Zbog toga u nizu čuvamo sve indekse od k do najmanjeg omotaca.
        for (let i = k; i < this.omotaci.length; i++) {
          indeksiOmotaca2.push(i);
        }
    }

    // Sada bojim sve omotace u zutu koji ne obuhvataju tacku koju ispitujemo.
    for(let i=0; i<indeksiOmotaca2.length; i++){
      this.crtajOmotac(kontekst, this.omotaci[indeksiOmotaca2[i]], 'yellow')
    }

    // Drugi nacin: za svaki omotac provjeravam da li sadrzi tacku, ako ne sadrzi onda cuvam njegov indeks.
    for(let i=0; i<this.omotaci.length; i++){
      if(!this.tackaUOmotacu(point, this.omotaci[i])){
        indeksiOmotaca.push(i);
      }
    }

    // Provjera jesu li isti nizovi:
    console.log("indeksi omotaca: ", indeksiOmotaca);
    console.log("indeksi omotaca2: ", indeksiOmotaca2);
    
    for(let i=0; i<indeksiOmotaca.length; i++){
      this.crtajOmotac(kontekst, this.omotaci[indeksiOmotaca[i]], 'yellow')
    }

    // Ostavila sam obije implementacije, za ne daj Boze, nek se nađe
  }
  
  tackaUOmotacu(point: { x: number; y: number }, hull: { x: number; y: number }[]): boolean {
    // Ideja je da napravim novi omotac koji će sadrzavati sve tacke kao omotac koji je proslijedjen kao parametar, a osim tih tacaka, sadrzavat ce i novu, proslijedjenu, tacku.
    // Prvo, pravim pomocni niz u koji cu dodati novu tacku.
    const pomocni: { x: number; y: number }[] = [...hull];
    pomocni.push(point);

    // Nakon toga pravim novi omotac.
    let omotac = this.grahamovAlgoritam(pomocni);
    // Sada je ostalo jos da vratim iz funkcije da li su omotaci isti, ako jedu, onda se tacka nalazi unutar proslijedjenog omotaca.

    // console.log("novi omotac:", omotac);
    // console.log("stari omotac:", hull);

    return JSON.stringify(omotac) === JSON.stringify(hull);
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
            omotac.pop();
        }
        omotac.push(tacke[i]); 
    }

    return omotac;
  }



  
  
  vektorskiProizvod(o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
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