import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

interface Tacka {
  x: number;
  y: number;
}

interface Trougao {
  t1: Tacka;
  t2: Tacka;
  t3: Tacka;
}
function tackaUOpisanomKrugu(tacka: Tacka, trougao: Trougao): boolean {
  let { t1, t2, t3 } = trougao;

  // Metoda determinanta matrice
  let ax = t1.x - tacka.x;
  let ay = t1.y - tacka.y;
  let bx = t2.x - tacka.x;
  let by = t2.y - tacka.y;
  let cx = t3.x - tacka.x;
  let cy = t3.y - tacka.y;

  let determinanta = (ax * (by * (cx * cx + cy * cy) - cy * (bx * bx + by * by))
    - ay * (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by))
    + (ax * ax + ay * ay) * (bx * cy - cx * by));

  return determinanta > 0;
}
function jednakeIvice(ivica1: { t1: Tacka; t2: Tacka }, ivica2: { t1: Tacka; t2: Tacka }): boolean {
  return (
    (ivica1.t1.x === ivica2.t1.x && ivica1.t1.y === ivica2.t1.y && ivica1.t2.x === ivica2.t2.x && ivica1.t2.y === ivica2.t2.y) ||
    (ivica1.t1.x === ivica2.t2.x && ivica1.t1.y === ivica2.t2.y && ivica1.t2.x === ivica2.t1.x && ivica1.t2.y === ivica2.t1.y)
  );
}

@Component({
  selector: 'app-delaunay',
  templateUrl: './delaunay.component.html',
  styleUrls: ['./delaunay.component.scss']
})
export class DelaunayComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef;
  private kontekst!: CanvasRenderingContext2D;
  private tacke: Tacka[] = [];
  private trouglovi: Trougao[] = [];

  ngAfterViewInit() {
    const platno = this.canvasRef.nativeElement;
    this.kontekst = platno.getContext('2d')!;
    this.crtaj();
  }

  onCanvasClick(dogadjaj: MouseEvent) {
    const okvir = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = dogadjaj.clientX - okvir.left;
    const y = dogadjaj.clientY - okvir.top;

    let novaTacka: Tacka = { x, y };
    this.tacke.push(novaTacka);

    this.triangulacija();
    this.crtaj();
  }


  crtaj() {
    this.kontekst.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    // Nacrtaj trouglove
    this.kontekst.strokeStyle = 'blue';
    for (let trougao of this.trouglovi) {
      this.kontekst.beginPath();
      this.kontekst.moveTo(trougao.t1.x, trougao.t1.y);
      this.kontekst.lineTo(trougao.t2.x, trougao.t2.y);
      this.kontekst.lineTo(trougao.t3.x, trougao.t3.y);
      this.kontekst.closePath();
      this.kontekst.stroke();
    }

    // Nacrtaj tačke
    this.kontekst.fillStyle = 'red';
    for (let tacka of this.tacke) {
      this.kontekst.beginPath();
      this.kontekst.arc(tacka.x, tacka.y, 2, 0, Math.PI * 2);
      this.kontekst.fill();
    }
  }
  pronadjiTrougaoSaZajednickomIvicom(t1: Tacka, t2: Tacka, iskljucenaTacka: Tacka): Trougao | null {
    for (let trougao of this.trouglovi) {
      if ([trougao.t1, trougao.t2, trougao.t3].includes(t1) &&
        [trougao.t1, trougao.t2, trougao.t3].includes(t2) &&
        ![trougao.t1, trougao.t2, trougao.t3].includes(iskljucenaTacka)) {
        return trougao;
      }
    }
    return null;
  }

  provjeriLegalnostIvice(t: Tacka, pocetakIvice: Tacka, krajIvice: Tacka) {
    // Pronađi trougao suprotan tački t preko ivice
    let suprotanTrougao = this.pronadjiTrougaoSaZajednickomIvicom(pocetakIvice, krajIvice, t);
    if (!suprotanTrougao) return;

    // Tačka suprotna ivici u suprotnom trouglu
    let suprotnaTacka = [suprotanTrougao.t1, suprotanTrougao.t2, suprotanTrougao.t3]
      .find(tacka => tacka !== pocetakIvice && tacka !== krajIvice);

    if (!suprotnaTacka) return;

    // Provjera da li je ivica nelegalna
    if (tackaUOpisanomKrugu(suprotnaTacka, { t1: t, t2: pocetakIvice, t3: krajIvice })) {
      // Flipuj ivicu
      this.trouglovi = this.trouglovi.filter(
        trougao => trougao !== suprotanTrougao &&
          ![t, pocetakIvice, krajIvice].every(tacka => [trougao.t1, trougao.t2, trougao.t3].includes(tacka))
      );

      // Dodaj nove trouglove
      this.trouglovi.push({ t1: t, t2: suprotnaTacka, t3: pocetakIvice });
      this.trouglovi.push({ t1: t, t2: suprotnaTacka, t3: krajIvice });

      // Rekurzivno provjeri ivice
      this.provjeriLegalnostIvice(t, t, suprotnaTacka);
      this.provjeriLegalnostIvice(t, pocetakIvice, suprotnaTacka);
      this.provjeriLegalnostIvice(t, krajIvice, suprotnaTacka);
    }
  }

  triangulacija() {
    // Korak 1: Inicijalizacija super-trougla
    const superTrougao: Trougao = {
      t1: { x: -1000, y: -1000 },
      t2: { x: 3000, y: -1000 },
      t3: { x: -1000, y: 3000 },
    };

    // Početak sa super-trouglom
    this.trouglovi = [superTrougao];

    // Korak 2: Permutacija tačaka (može se promiješati niz tačaka)
    let permutovaneTacke = this.tacke.slice(); // Kopija niza tačaka

    // Korak 3: Umetanje svake tačke u triangulaciju
    for (let tacka of permutovaneTacke) {
      let losiTrouglovi: Trougao[] = [];

      // Pronađi sve trouglove koji više nisu validni zbog umetanja
      for (let trougao of this.trouglovi) {
        if (tackaUOpisanomKrugu(tacka, trougao)) {
          losiTrouglovi.push(trougao);
        }
      }

      // Pronađi granicu poligonalne rupe
      let poligon: { t1: Tacka; t2: Tacka }[] = [];
      for (let trougao of losiTrouglovi) {
        let ivice = [
          { t1: trougao.t1, t2: trougao.t2 },
          { t1: trougao.t2, t2: trougao.t3 },
          { t1: trougao.t3, t2: trougao.t1 },
        ];

        for (let ivica of ivice) {
          let zajednicka = false;
          for (let drugiTrougao of losiTrouglovi) {
            if (trougao === drugiTrougao) continue;
            if (jednakeIvice(ivica, { t1: drugiTrougao.t1, t2: drugiTrougao.t2 }) ||
              jednakeIvice(ivica, { t1: drugiTrougao.t2, t2: drugiTrougao.t3 }) ||
              jednakeIvice(ivica, { t1: drugiTrougao.t3, t2: drugiTrougao.t1 })) {
              zajednicka = true;
              break;
            }
          }
          if (!zajednicka) {
            poligon.push(ivica);
          }
        }
      }

      // Ukloni loše trouglove
      this.trouglovi = this.trouglovi.filter(trougao => !losiTrouglovi.includes(trougao));

      // Ponovna triangulacija poligonalne rupe
      for (let ivica of poligon) {
        let noviTrougao: Trougao = {
          t1: ivica.t1,
          t2: ivica.t2,
          t3: tacka,
        };
        this.trouglovi.push(noviTrougao);

        // Provjeri i flipuj nelegalne ivice
        this.provjeriLegalnostIvice(tacka, ivica.t1, ivica.t2);
      }
    }

    // Korak 4: Ukloni trouglove koji dijele vrhove sa super-trouglom
    this.trouglovi = this.trouglovi.filter(trougao => {
      return ![superTrougao.t1, superTrougao.t2, superTrougao.t3].includes(trougao.t1) &&
        ![superTrougao.t1, superTrougao.t2, superTrougao.t3].includes(trougao.t2) &&
        ![superTrougao.t1, superTrougao.t2, superTrougao.t3].includes(trougao.t3);
    });
  }
}
