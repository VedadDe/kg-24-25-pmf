import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

// 2D Tačka
class Tacka2D {
  constructor(public x: number, public y: number) {}
}

// 2D Poligon (Konveksan)
class Poligon {
  constructor(
    public tacke: Tacka2D[],
    public boja: string = 'rgba(0, 150, 255, 0.5)'
  ) {}
  
  // Oznaka da li je ovaj poligon splitter
  public jeSplitter: boolean = false;

  // Funkcija za određivanje strane tačke u odnosu na splitter ivicu poligona
  // Vraća pozitivan broj ako je tačka lijevo, negativan ako je desno, nula ako je na liniji
  klasificirajTacku(p: Tacka2D): number {
    const splitter = this.tacke[0];
    const splitterSledeca = this.tacke[1];
    return (
      (splitterSledeca.x - splitter.x) * (p.y - splitter.y) -
      (splitterSledeca.y - splitter.y) * (p.x - splitter.x)
    );
  }

  // Funkcija za dijeljenje poligona splitter ivicom
  podijeli(splitterIvica: Poligon): { prednji: Poligon | null; zadnji: Poligon | null } {
    const prednji: Tacka2D[] = [];
    const zadnji: Tacka2D[] = [];

    for (let i = 0; i < this.tacke.length; i++) {
      const trenutni = this.tacke[i];
      const sledeci = this.tacke[(i + 1) % this.tacke.length];
      const klasifikacijaTrenutni = splitterIvica.klasificirajTacku(trenutni);
      const klasifikacijaSledeci = splitterIvica.klasificirajTacku(sledeci);

      if (klasifikacijaTrenutni > 0) {
        prednji.push(trenutni);
      } else if (klasifikacijaTrenutni < 0) {
        zadnji.push(trenutni);
      }

      // Provjera da li se ivica presijeca sa splitterom
      if (klasifikacijaTrenutni * klasifikacijaSledeci < 0) {
        // Presjek se dešava
        const presjek = dohvatiPresjek(trenutni, sledeci, splitterIvica.tacke[0], splitterIvica.tacke[1]);
        if (presjek) {
          prednji.push(presjek);
          zadnji.push(presjek);
        }
      }
    }

    const prednjiPoligon = prednji.length > 2 ? new Poligon(prednji, this.boja) : null;
    const zadnjiPoligon = zadnji.length > 2 ? new Poligon(zadnji, this.boja) : null;

    return { prednji: prednjiPoligon, zadnji: zadnjiPoligon };
  }
}

// Funkcija za računanje presjeka između dvije linijske segmente
function dohvatiPresjek(
  p1: Tacka2D,
  p2: Tacka2D,
  p3: Tacka2D,
  p4: Tacka2D
): Tacka2D | null {
  // Linija AB predstavljena kao a1x + b1y = c1
  const a1 = p2.y - p1.y;
  const b1 = p1.x - p2.x;
  const c1 = a1 * p1.x + b1 * p1.y;

  // Linija CD predstavljena kao a2x + b2y = c2
  const a2 = p4.y - p3.y;
  const b2 = p3.x - p4.x;
  const c2 = a2 * p3.x + b2 * p3.y;

  const determinanta = a1 * b2 - a2 * b1;

  if (determinanta === 0) {
    return null; // Linije su paralelne
  } else {
    const x = (b2 * c1 - b1 * c2) / determinanta;
    const y = (a1 * c2 - a2 * c1) / determinanta;

    // Provjera da li je tačka presjeka na oba segmenta
    if (
      x >= Math.min(p1.x, p2.x) - 1e-6 &&
      x <= Math.max(p1.x, p2.x) + 1e-6 &&
      x >= Math.min(p3.x, p4.x) - 1e-6 &&
      x <= Math.max(p3.x, p4.x) + 1e-6 &&
      y >= Math.min(p1.y, p2.y) - 1e-6 &&
      y <= Math.max(p1.y, p2.y) + 1e-6 &&
      y >= Math.min(p3.y, p4.y) - 1e-6 &&
      y <= Math.max(p3.y, p4.y) + 1e-6
    ) {
      return new Tacka2D(x, y);
    } else {
      return null;
    }
  }
}

// BSP Čvor za 2D
class BSPCvor2D {
  splitter: Poligon; // Poligon koji se koristi za dijeljenje prostora
  prednji: BSPCvor2D | null = null;
  zadnji: BSPCvor2D | null = null;

  constructor(splitter: Poligon) {
    this.splitter = splitter;
  }
}

// BSP Stablo za 2D
class BSPStablo2D {
  korijen: BSPCvor2D | null = null;

  constructor(poligoni: Poligon[]) {
    this.korijen = this.izgradiStablo(poligoni);
  }

  private izgradiStablo(poligoni: Poligon[]): BSPCvor2D | null {
    if (poligoni.length === 0) {
      return null;
    }

    // Odabir prvog poligona kao splitter
    const splitter = poligoni[0];
    splitter.jeSplitter = true; // Označavanje kao splitter za vizualizaciju
    const cvor = new BSPCvor2D(splitter);

    const prednjiSpisak: Poligon[] = [];
    const zadnjiSpisak: Poligon[] = [];

    for (let i = 1; i < poligoni.length; i++) {
      const poly = poligoni[i];
      const klasifikacija = this.klasifikujPoligon(poly, splitter);

      if (klasifikacija === 'front') {
        prednjiSpisak.push(poly);
      } else if (klasifikacija === 'back') {
        zadnjiSpisak.push(poly);
      } else if (klasifikacija === 'coplanar') {
        // Za jednostavnost, tretiraj koplanarne poligone kao front
        prednjiSpisak.push(poly);
      } else if (klasifikacija === 'spanning') {
        // Dijeljenje poligona
        const { prednji, zadnji } = poly.podijeli(splitter);
        if (prednji) prednjiSpisak.push(prednji);
        if (zadnji) zadnjiSpisak.push(zadnji);
      }
    }

    cvor.prednji = this.izgradiStablo(prednjiSpisak);
    cvor.zadnji = this.izgradiStablo(zadnjiSpisak);

    return cvor;
  }

  private klasifikujPoligon(poly: Poligon, splitter: Poligon): string {
    let prednje = false;
    let zadnje = false;

    for (const tacka of poly.tacke) {
      const klasifikacija = splitter.klasificirajTacku(tacka);
      if (klasifikacija > 0) prednje = true;
      if (klasifikacija < 0) zadnje = true;
    }

    if (prednje && !zadnje) {
      return 'front';
    } else if (!prednje && zadnje) {
      return 'back';
    } else if (!prednje && !zadnje) {
      return 'coplanar';
    } else {
      return 'spanning';
    }
  }

  // Prolazak kroz BSP Stablo na osnovu tačke pogleda
  prolazi(tackaPogleda: Tacka2D, redoslijedCrtanja: Poligon[]): void {
    this.prolaziCvor(this.korijen, tackaPogleda, redoslijedCrtanja);
  }

  private prolaziCvor(cvor: BSPCvor2D | null, tackaPogleda: Tacka2D, redoslijedCrtanja: Poligon[]): void {
    if (!cvor) return;

    // Određivanje na kojoj strani splittera se nalazi tačka pogleda
    const klasifikacija = cvor.splitter.klasificirajTacku(tackaPogleda);

    if (klasifikacija > 0) {
      // Tačka pogleda je ispred splittera; prvo prolazak kroz zadnji subtree
      this.prolaziCvor(cvor.zadnji, tackaPogleda, redoslijedCrtanja);
      // Dodavanje splitter poligona
      redoslijedCrtanja.push(cvor.splitter);
      // Zatim prolazak kroz prednji subtree
      this.prolaziCvor(cvor.prednji, tackaPogleda, redoslijedCrtanja);
    } else {
      // Tačka pogleda je iza splittera; prvo prolazak kroz prednji subtree
      this.prolaziCvor(cvor.prednji, tackaPogleda, redoslijedCrtanja);
      // Dodavanje splitter poligona
      redoslijedCrtanja.push(cvor.splitter);
      // Zatim prolazak kroz zadnji subtree
      this.prolaziCvor(cvor.zadnji, tackaPogleda, redoslijedCrtanja);
    }
  }

  // Funkcija za prikupljanje svih splitter poligona za vizualizaciju
  dohvatiSplitterPoligone(): Poligon[] {
    const splitters: Poligon[] = [];
    this.prikupiSplitterPoligone(this.korijen, splitters);
    return splitters;
  }

  private prikupiSplitterPoligone(cvor: BSPCvor2D | null, splitters: Poligon[]): void {
    if (!cvor) return;
    if (cvor.splitter.jeSplitter) {
      splitters.push(cvor.splitter);
    }
    this.prikupiSplitterPoligone(cvor.prednji, splitters);
    this.prikupiSplitterPoligone(cvor.zadnji, splitters);
  }
}

@Component({
  selector: 'app-voronoi-diagram',
  templateUrl: './voronoi-diagram.component.html',
  styleUrls: ['./voronoi-diagram.component.scss']
})
export class VoronoiDiagramComponent implements OnInit {
   @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private kontekst!: CanvasRenderingContext2D;
  private bspStablo!: BSPStablo2D;
  private poligoni: Poligon[] = [];
  private redoslijedCrtanja: Poligon[] = [];
  private inicijalnaTackaPogleda: Tacka2D = new Tacka2D(500, 500);
  private tackaPogleda: Tacka2D = new Tacka2D(500, 500);
  public prikaziSplitterLinije: boolean = false; // Kontrola vidljivosti splitter linija
  private splitterPoligoni: Poligon[] = [];

  constructor() {}

  ngOnInit(): void {
    this.kontekst = this.canvasRef.nativeElement.getContext('2d')!;
    this.inicijalizujPoligone();
    this.izgradiBspStablo();
    this.renderuj();
  }

  // Inicijalizacija uzoraka poligona
  private inicijalizujPoligone(): void {
    this.poligoni = [
      new Poligon(
        [
          new Tacka2D(100, 100),
          new Tacka2D(300, 100),
          new Tacka2D(200, 300)
        ],
        'rgba(255, 0, 0, 0.5)'
      ),
      new Poligon(
        [
          new Tacka2D(150, 150),
          new Tacka2D(350, 150),
          new Tacka2D(250, 350)
        ],
        'rgba(0, 255, 0, 0.5)'
      ),
      new Poligon(
        [
          new Tacka2D(200, 200),
          new Tacka2D(400, 200),
          new Tacka2D(300, 400)
        ],
        'rgba(0, 0, 255, 0.5)'
      ),
      new Poligon(
        [
          new Tacka2D(250, 250),
          new Tacka2D(450, 250),
          new Tacka2D(350, 450)
        ],
        'rgba(255, 255, 0, 0.5)'
      )
    ];
  }

  // Izgradnja BSP stabla
  private izgradiBspStablo(): void {
    this.bspStablo = new BSPStablo2D(this.poligoni);
    this.splitterPoligoni = this.bspStablo.dohvatiSplitterPoligone();
    this.azurirajRedoslijedCrtanja();
  }

  // Ažuriranje reda crtanja na osnovu trenutne tačke pogleda
  private azurirajRedoslijedCrtanja(): void {
    this.redoslijedCrtanja = [];
    this.bspStablo.prolazi(this.tackaPogleda, this.redoslijedCrtanja);
  }

  // Renderovanje poligona na platnu
  private renderuj(): void {
    this.kontekst.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    for (const poly of this.redoslijedCrtanja) {
      this.crtajPoligon(poly);
    }

    if (this.prikaziSplitterLinije) {
      this.crtajSplitterLinije();
    }
  }

  // Funkcija za crtanje pojedinačnog poligona
  private crtajPoligon(poly: Poligon): void {
    this.kontekst.beginPath();
    this.kontekst.moveTo(poly.tacke[0].x, poly.tacke[0].y);
    for (let i = 1; i < poly.tacke.length; i++) {
      this.kontekst.lineTo(poly.tacke[i].x, poly.tacke[i].y);
    }
    this.kontekst.closePath();
    this.kontekst.fillStyle = poly.boja;
    this.kontekst.fill();
    this.kontekst.strokeStyle = 'black';
    this.kontekst.stroke();
  }

  // Funkcija za crtanje splitter linija
  private crtajSplitterLinije(): void {
    this.kontekst.strokeStyle = 'black';
    this.kontekst.lineWidth = 2;
    for (const splitter of this.splitterPoligoni) {
      this.kontekst.beginPath();
      this.kontekst.moveTo(splitter.tacke[0].x, splitter.tacke[0].y);
      for (let i = 1; i < splitter.tacke.length; i++) {
        this.kontekst.lineTo(splitter.tacke[i].x, splitter.tacke[i].y);
      }
      this.kontekst.closePath();
      this.kontekst.stroke();
    }
    this.kontekst.lineWidth = 1; // Resetovanje na podrazumevanu širinu
  }

  // Rukovanje klikom na platno za ažuriranje tačke pogleda
  @HostListener('window:click', ['$event'])
  onCanvasClick(event: MouseEvent): void {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.tackaPogleda = new Tacka2D(x, y);
    this.azurirajRedoslijedCrtanja();
    this.renderuj();
  }

  // Resetovanje tačke pogleda na početnu poziciju
  resetujTackuPogleda(): void {
    this.tackaPogleda = new Tacka2D(this.inicijalnaTackaPogleda.x, this.inicijalnaTackaPogleda.y);
    this.azurirajRedoslijedCrtanja();
    this.renderuj();
  }

  // Prebacivanje vidljivosti splitter linija
  prebaciSplitterLinije(): void {
    this.prikaziSplitterLinije = !this.prikaziSplitterLinije;
    this.renderuj();
  }

  // : Funkcija za generisanje nasumične boje
  private dohvatiNasumicnuBoju(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }

  // : Funkcija za generisanje nasumičnog konveksnog poligona (jednostavno trougao)
  private generisiNasumicniPoligon(): Poligon {
    const centarX = Math.random() * 600 + 100;
    const centarY = Math.random() * 400 + 100;
    const velicina = Math.random() * 50 + 50;
    const ugao = Math.random() * Math.PI * 2;

    const tacke = [
      new Tacka2D(centarX + velicina * Math.cos(ugao), centarY + velicina * Math.sin(ugao)),
      new Tacka2D(centarX + velicina * Math.cos(ugao + (2 * Math.PI) / 3), centarY + velicina * Math.sin(ugao + (2 * Math.PI) / 3)),
      new Tacka2D(centarX + velicina * Math.cos(ugao + (4 * Math.PI) / 3), centarY + velicina * Math.sin(ugao + (4 * Math.PI) / 3))
    ];

    return new Poligon(tacke, this.dohvatiNasumicnuBoju());
  }

  // : Funkcija za dodavanje nasumičnog poligona
  dodajNasumicniPoligon(): void {
    const noviPoligon = this.generisiNasumicniPoligon();
    this.poligoni.push(noviPoligon);
    this.izgradiBspStablo();
    this.renderuj();
  }
}
