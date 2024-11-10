import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-triangulation',
  templateUrl: './triangulation.component.html',
  styleUrls: ['./triangulation.component.scss'],
})
export class TriangulationComponent implements AfterViewInit {
  @ViewChild('polygonCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private kontekst!: CanvasRenderingContext2D;
  private tacke: { x: number; y: number }[] = [];
  n: number = 3;
  pocetakSegmenta: { x: number; y: number } | null = null;
  krajSegmenta: { x: number; y: number } | null = null;
  segment: boolean = false;

  // Dodana svojstva za triangulaciju
  private trouglovi: number[][] = [];

  ngAfterViewInit(): void {
    const kontekst = this.canvasRef.nativeElement.getContext('2d');
    if (!kontekst) {
      throw new Error('Ne može se dobiti 2D kontekst za canvas.');
    }
    this.kontekst = kontekst;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Dodavanje event listenera za klikove na canvas
    this.canvasRef.nativeElement.addEventListener('click', (event) => this.onCanvasClick(event));
  }

  private resizeCanvas(): void {
    this.canvasRef.nativeElement.width = window.innerWidth * 0.8;
    this.canvasRef.nativeElement.height = window.innerHeight * 0.8;
    console.log('Canvas promijenjen na veličinu:', this.canvasRef.nativeElement.width, 'x', this.canvasRef.nativeElement.height);
  }

  generisiPoligon(): void {
    if (this.n >= 3) {
      console.log(`Generisanje poligona sa ${this.n} tačaka.`);
      this.tacke = this.generisiRandomtacke(this.n);
      this.tacke = this.sortirajTackePoPolarnomUglu(this.tacke);
      this.kontekst.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      this.kontekst.beginPath();
      this.kontekst.moveTo(this.tacke[0].x, this.tacke[0].y);

      for (let i = 1; i < this.tacke.length; i++) {
        this.kontekst.lineTo(this.tacke[i].x, this.tacke[i].y);
      }

      this.kontekst.closePath();
      this.kontekst.stroke();
      console.log('Poligon nacrtan na canvas.');

      for (let i = 0; i < this.tacke.length; i++) {
        this.crtajTacku(i, this.tacke[i].x, this.tacke[i].y);
      }
    }
  }

  segmentIliTacka() {
    this.segment = !this.segment;
    console.log(`Mod promijenjen na: ${this.segment ? 'Segment' : 'Tačka'}`);
  }

  private generisiRandomtacke(n: number): { x: number; y: number }[] {
    const tacke: { x: number; y: number }[] = [];
    const sirina = this.canvasRef.nativeElement.width;
    const visina = this.canvasRef.nativeElement.height;

    for (let i = 0; i < n; i++) {
      const tacka = {
        x: Math.random() * sirina,
        y: Math.random() * visina,
      };
      tacke.push(tacka);
      console.log(`Generisana tačka ${i}: indeks ${i}`);
    }

    return tacke;
  }

  private sortirajTackePoPolarnomUglu(tacke: { x: number; y: number }[]): { x: number; y: number }[] {
    const centroid = this.izracunajCentroid(tacke);
    console.log(`Centroid poligona: (${centroid.x.toFixed(2)}, ${centroid.y.toFixed(2)})`);

    tacke.sort((a, b) => {
      const ugaoA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const ugaoB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return ugaoA - ugaoB;
    });

    console.log('Tačke sortirane po polarnom uglu.');
    return tacke;
  }

  private izracunajCentroid(tacke: { x: number; y: number }[]): { x: number; y: number } {
    const centroid = { x: 0, y: 0 };

    for (const tacka of tacke) {
      centroid.x += tacka.x;
      centroid.y += tacka.y;
    }

    centroid.x /= tacke.length;
    centroid.y /= tacke.length;

    return centroid;
  }

  private crtajTacku(index: number, x: number, y: number): void {
    this.kontekst.beginPath();
    this.kontekst.arc(x, y, 3, 0, 2 * Math.PI);
    this.kontekst.fillStyle = 'black';
    this.kontekst.fill();
    console.log(`Tačka indeks ${index} nacrtana.`);
  }

  jeLiTackaUPoligonu(tacka: { x: number; y: number }): boolean {
    let presjeci = 0;
    const testLinija = { a: tacka, b: { x: this.canvasRef.nativeElement.width + 1, y: tacka.y } };

    for (let i = 0; i < this.tacke.length; i++) {
      const a = this.tacke[i];
      const b = this.tacke[(i + 1) % this.tacke.length];

      const sePresjecu = this.daLiSeLinijePresjecu(a, b, testLinija.a, testLinija.b);
      if (sePresjecu) {
        presjeci++;
        console.log(`Linije presjecu: indeks ${i} - indeks ${(i + 1) % this.tacke.length}`);
      }
    }

    console.log(`Broj presjeka: ${presjeci}`);
    return presjeci % 2 !== 0;
  }

  daLiSeLinijePresjecu(a1: { x: number; y: number }, a2: { x: number; y: number }, b1: { x: number; y: number }, b2: { x: number; y: number }): boolean {
    const d = (a1.x - a2.x) * (b2.y - b1.y) - (a1.y - a2.y) * (b2.x - b1.x);
    if (d === 0) return false;

    const s = ((a1.x - b1.x) * (b2.y - b1.y) - (a1.y - b1.y) * (b2.x - b1.x)) / d;
    const t = ((a1.x - a2.x) * (a1.y - b1.y) - (a1.y - a2.y) * (a1.x - b1.x)) / d;

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  }

  onCanvasClick(event: MouseEvent): void {
    if (this.segment) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (!this.pocetakSegmenta) {
        this.pocetakSegmenta = { x, y };
        console.log(`Početak segmenta postavljen na (${x.toFixed(2)}, ${y.toFixed(2)})`);
      } else if (!this.krajSegmenta) {
        this.krajSegmenta = { x, y };
        console.log(`Kraj segmenta postavljen na (${x.toFixed(2)}, ${y.toFixed(2)})`);
        this.crtajSegment(this.pocetakSegmenta, this.krajSegmenta);

        if (this.ispitivanjePresjeka(this.pocetakSegmenta, this.krajSegmenta)) {
          alert('Segment siječe poligon.');
          console.log('Segment siječe poligon.');
        } else {
          const midtacka = { x: (this.pocetakSegmenta.x + this.krajSegmenta.x) / 2, y: (this.pocetakSegmenta.y + this.krajSegmenta.y) / 2 };
          if (this.jeLiTackaUPoligonu(midtacka)) {
            alert('Segment je u poligonu.');
            console.log('Segment je u poligonu.');
          } else {
            alert('Segment je van poligona.');
            console.log('Segment je van poligona.');
          }
        }

        this.pocetakSegmenta = null;
        this.krajSegmenta = null;
      }
    } else {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const uPoligonu = this.jeLiTackaUPoligonu({ x, y });
      if (uPoligonu) {
        alert('Tačka je u poligonu.');
        console.log(`Tačka (${x.toFixed(2)}, ${y.toFixed(2)}) je u poligonu.`);
      } else {
        alert('Tačka nije u poligonu.');
        console.log(`Tačka (${x.toFixed(2)}, ${y.toFixed(2)}) nije u poligonu.`);
      }
    }
  }

  crtajSegment(start: { x: number; y: number }, end: { x: number; y: number }): void {
    this.kontekst.beginPath();
    this.kontekst.moveTo(start.x, start.y);
    this.kontekst.lineTo(end.x, end.y);
    this.kontekst.stroke();
    console.log(`Segment nacrtan od (${start.x.toFixed(2)}, ${start.y.toFixed(2)}) do (${end.x.toFixed(2)}, ${end.y.toFixed(2)})`);
  }

  ispitivanjePresjeka(pocetakSegmenta: { x: number; y: number }, krajSegmenta: { x: number; y: number }): boolean {
    for (let i = 0; i < this.tacke.length; i++) {
      const a = this.tacke[i];
      const b = this.tacke[(i + 1) % this.tacke.length];

      if (this.daLiSeLinijePresjecu(a, b, pocetakSegmenta, krajSegmenta)) {
        console.log(`Segment presjekao ivicu poligona: indeks ${i} - indeks ${(i + 1) % this.tacke.length}`);
        return true;
      }
    }

    return false;
  }

  orjentacijaPoligona() {
    const n = this.tacke.length;
    let povrsina = 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      povrsina += (this.tacke[i].x * this.tacke[j].y) - (this.tacke[j].x * this.tacke[i].y);
    }

    console.log(`Izračunata površina: ${povrsina}`);
    if (povrsina < 0) {
      alert('Poligon je u smjeru kazaljke na satu.');
      console.log('Poligon je u smjeru kazaljke na satu.');
    } else if (povrsina > 0) {
      alert('Poligon je u smjeru suprotnom od kazaljke na satu.');
      console.log('Poligon je u smjeru suprotnom od kazaljke na satu.');
    } else {
      alert('Poligon nije definisan.');
      console.log('Poligon nije definisan.');
    }
  }

  generisiIIspitajNTacaka(): void {
    const slucajneTacke = this.generisiRandomtacke(1000);
    console.log('Generisano 1000 nasumičnih tačaka za ispitivanje.');

    for (let i = 0; i < slucajneTacke.length; i++) {
      const tacka = slucajneTacke[i];
      if (this.jeLiTackaUPoligonu(tacka)) {
        this.crtajTackuUBoji(i, tacka.x, tacka.y, 'red');
      } else {
        this.crtajTackuUBoji(i, tacka.x, tacka.y, 'blue');
      }
    }
  }

  crtajTackuUBoji(index: number, x: number, y: number, boja: string): void {
    this.kontekst.beginPath();
    this.kontekst.arc(x, y, 3, 0, 2 * Math.PI);
    this.kontekst.fillStyle = boja;
    this.kontekst.fill();
    console.log(`Tačka indeks ${index} nacrtana u boji ${boja}.`);
  }

  triangulirajPoligon(): void {
    if (this.tacke.length < 3) {
      alert('Poligon mora imati najmanje 3 tačke za triangulaciju.');
      console.log('Triangulacija nije moguća: poligon ima manje od 3 tačke.');
      return;
    }

    console.log('Početak triangulacije poligona.');

    // Napravi kopiju vrhova sa indeksima
    const vrhovi = this.tacke.map((tacka, index) => ({
      index: index,
      x: tacka.x,
      y: tacka.y,
    }));

    const trouglovi: number[][] = [];

    // Odredi orijentaciju poligona
    const povrsina = this.izracunajPovrsinu(vrhovi);
    const jeKazaljkaNaSatu = povrsina < 0;
    console.log(`Orijentacija poligona: ${jeKazaljkaNaSatu ? 'U smjeru kazaljke na satu' : 'Suprotno od smjera kazaljke na satu'}`);

    // Ako poligon nije u smjeru kazaljke na satu, obrni ga
    if (!jeKazaljkaNaSatu) {
      vrhovi.reverse();
      console.log('Poligon je obrnut kako bi bio u smjeru kazaljke na satu.');
    }

    let preostaliVrhovi = vrhovi.slice();

    let iteracija = 0;

    while (preostaliVrhovi.length > 3) {
      iteracija++;
      console.log(`Iteracija triangulacije: ${iteracija}`);
      let jePronadjenUho = false;

      for (let i = 0; i < preostaliVrhovi.length; i++) {
        const prethodniIndex = (i - 1 + preostaliVrhovi.length) % preostaliVrhovi.length;
        const sljedeciIndex = (i + 1) % preostaliVrhovi.length;

        const prethodniVrh = preostaliVrhovi[prethodniIndex];
        const trenutniVrh = preostaliVrhovi[i];
        const sljedeciVrh = preostaliVrhovi[sljedeciIndex];

        console.log(`Provjera uha na indeksu ${trenutniVrh.index}:`);
        console.log(`Prethodni vrh indeks ${prethodniVrh.index}, Trenutni vrh indeks ${trenutniVrh.index}, Sljedeci vrh indeks ${sljedeciVrh.index}`);

        if (this.jeUho(prethodniVrh, trenutniVrh, sljedeciVrh, preostaliVrhovi)) {
          console.log(`Uho pronađeno na indeksu ${trenutniVrh.index}.`);
          // Dodaj trougao koristeći indekse
          trouglovi.push([
            prethodniVrh.index,
            trenutniVrh.index,
            sljedeciVrh.index,
          ]);
          console.log(`Dodavanje trougla: indeks ${prethodniVrh.index}, indeks ${trenutniVrh.index}, indeks ${sljedeciVrh.index}`);

          // Ukloni trenutni vrh iz preostalih
          preostaliVrhovi.splice(i, 1);
          jePronadjenUho = true;
          break;
        }
      }

      if (!jePronadjenUho) {
        alert('Triangulacija nije uspjela. Poligon možda nije jednostavan.');
        console.log('Triangulacija nije uspjela: nije pronađeno uho.');
        return;
      }
    }

    // Dodaj posljednji trougao
    if (preostaliVrhovi.length === 3) {
      trouglovi.push([
        preostaliVrhovi[0].index,
        preostaliVrhovi[1].index,
        preostaliVrhovi[2].index,
      ]);
      console.log(`Dodavanje posljednjeg trougla: indeks ${preostaliVrhovi[0].index}, indeks ${preostaliVrhovi[1].index}, indeks ${preostaliVrhovi[2].index}`);
    }

    this.trouglovi = trouglovi;
    console.log('Triangulacija završena. Ukupno trouglova:', this.trouglovi.length);
    this.crtajTrouglove();
  }

  izracunajPovrsinu(vrhovi: { index: number; x: number; y: number }[]): number {
    let povrsina = 0;
    for (let i = 0; i < vrhovi.length; i++) {
      const j = (i + 1) % vrhovi.length;
      povrsina += (vrhovi[i].x * vrhovi[j].y) - (vrhovi[j].x * vrhovi[i].y);
    }
    console.log(`Izračunata površina: ${povrsina}`);
    return povrsina / 2;
  }

  jeUho(prethodni: any, trenutni: any, sljedeci: any, vrhovi: any[]): boolean {
    if (!this.jeKonveksan(prethodni, trenutni, sljedeci)) {
      console.log('Uho nije konveksno.');
      return false;
    }

    // Formiraj trougao koristeći indekse
    const trougao = [prethodni, trenutni, sljedeci];

    // Provjeri da li bilo koji drugi vrh leži unutar trougla
    for (const vrh of vrhovi) {
      if (vrh === prethodni || vrh === trenutni || vrh === sljedeci) {
        continue;
      }

      if (this.jeTackaUTrouglu(vrh, trougao)) {
        console.log(`Vrh indeks ${vrh.index} (${vrh.x.toFixed(2)}, ${vrh.y.toFixed(2)}) leži unutar trougla.`);
        return false;
      }
    }

    return true;
  }

  jeKonveksan(a: { index: number; x: number; y: number }, b: { index: number; x: number; y: number }, c: { index: number; x: number; y: number }): boolean {
    const konveksnost = ((b.x - a.x) * (c.y - a.y)) - ((b.y - a.y) * (c.x - a.x));
    console.log(`Konveksnost za trougao (indeksi ${a.index}, ${b.index}, ${c.index}): ${konveksnost < 0 ? 'Konveksno' : 'Konkavno'}`);
    return konveksnost < 0;
  }

  jeTackaUTrouglu(p: { x: number; y: number }, trougao: { index: number; x: number; y: number }[]): boolean {
    const [a, b, c] = trougao;

    const areaOrig = Math.abs(
      (a.x * (b.y - c.y) +
        b.x * (c.y - a.y) +
        c.x * (a.y - b.y)) / 2
    );

    const area1 = Math.abs(
      (p.x * (b.y - c.y) +
        b.x * (c.y - p.y) +
        c.x * (p.y - b.y)) / 2
    );
    const area2 = Math.abs(
      (a.x * (p.y - c.y) +
        p.x * (c.y - a.y) +
        c.x * (a.y - p.y)) / 2
    );
    const area3 = Math.abs(
      (a.x * (b.y - p.y) +
        b.x * (p.y - a.y) +
        p.x * (a.y - b.y)) / 2
    );

    const uTrouglu = Math.abs(areaOrig - (area1 + area2 + area3)) < 1e-6;
    console.log(`Provjera da li tačka (${p.x.toFixed(2)}, ${p.y.toFixed(2)}) leži unutar trougla: ${uTrouglu}`);
    return uTrouglu;
  }

  crtajTrouglove(): void {
    // Očisti canvas
    this.kontekst.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    console.log('Canvas očišćen za crtanje trouglova.');

    // Nacrtaj poligon
    this.kontekst.beginPath();
    this.kontekst.moveTo(this.tacke[0].x, this.tacke[0].y);
    for (let i = 1; i < this.tacke.length; i++) {
      this.kontekst.lineTo(this.tacke[i].x, this.tacke[i].y);
    }
    this.kontekst.closePath();
    this.kontekst.strokeStyle = 'black';
    this.kontekst.stroke();
    console.log('Poligon ponovo nacrtan na canvas.');

    // Nacrtaj trouglove koristeći indekse
    for (const trougao of this.trouglovi) {
      const [indexA, indexB, indexC] = trougao;
      const a = this.tacke[indexA];
      const b = this.tacke[indexB];
      const c = this.tacke[indexC];

      this.kontekst.beginPath();
      this.kontekst.moveTo(a.x, a.y);
      this.kontekst.lineTo(b.x, b.y);
      this.kontekst.lineTo(c.x, c.y);
      this.kontekst.closePath();

      this.kontekst.fillStyle = 'rgba(0, 0, 255, 0.2)';
      this.kontekst.fill();
      this.kontekst.strokeStyle = 'blue';
      this.kontekst.stroke();
      console.log(`Trougao nacrtan: indeks ${indexA}, indeks ${indexB}, indeks ${indexC}`);
    }

    // Nacrtaj tačke
    for (let i = 0; i < this.tacke.length; i++) {
      this.crtajTacku(i, this.tacke[i].x, this.tacke[i].y);
    }

    console.log('Svi trouglovi nacrtani.');
  }
}
