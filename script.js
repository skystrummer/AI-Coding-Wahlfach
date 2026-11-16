// script.js – das Verhalten der Seite

// Zustand (state): Wie oft wurde schon geklickt?
let klicks = 0;

// Elemente aus index.html holen
const knopf = document.getElementById("knopf");
const ausgabe = document.getElementById("ausgabe");

// Wenn der Knopf geklickt wird: Zustand ändern und neu anzeigen
knopf.addEventListener("click", function () {
  klicks = klicks + 1;
  ausgabe.textContent = "Jetzt hast du " + klicks + " Mal geklickt, bravo!";

  // Spiel: Der Knopf hüpft an eine neue Stelle
  lasseKnopfHuepfen();

  // Spiel: Mit 20 % Chance (also etwa jedes 5. Mal) verschwindet der Knopf
  if (Math.random() < 0.2) {
    versteckeKnopf();
  }
});

// Zustand: Ist der Knopf gerade versteckt?
let knopfVersteckt = false;

// Zustand: Welche Aufgabe muss man gerade lösen? ("leertaste", "wort" oder "schuetteln")
let aktuelleAufgabe = "";

// Liste aller möglichen Aufgaben mit ihrem Hinweistext
const aufgaben = [
  { name: "leertaste", hinweis: "Drück die Leertaste, um ihn zurückzurufen." },
  { name: "wort", hinweis: "Tippe das Wort «komm», um ihn zurückzurufen." },
  { name: "schuetteln", hinweis: "Schüttle die Maus schnell nach links und rechts!" }
];

// Macht den Knopf unsichtbar und wählt eine zufällige Aufgabe
function versteckeKnopf() {
  knopfVersteckt = true;
  knopf.style.visibility = "hidden";
  // Fokus wegnehmen, sonst würde die Leertaste den Knopf später gleich wieder "klicken"
  knopf.blur();

  // Zufällige Aufgabe aus der Liste wählen (Position 0, 1 oder 2)
  const position = Math.floor(Math.random() * aufgaben.length);
  const aufgabe = aufgaben[position];
  aktuelleAufgabe = aufgabe.name;

  // Zähler für die Aufgaben zurücksetzen
  getippterText = "";
  richtungsWechsel = 0;

  ausgabe.textContent = "Huch, der Knopf ist weg! " + aufgabe.hinweis;
}

// Macht den Knopf wieder sichtbar
function holeKnopfZurueck() {
  knopfVersteckt = false;
  knopf.style.visibility = "visible";
  ausgabe.textContent = "Da ist er wieder! Du hast bisher " + klicks + " Mal geklickt.";
}

// --- Aufgaben mit der Tastatur: Leertaste und Wort tippen ---

// Zustand: Was wurde getippt, seit der Knopf weg ist?
let getippterText = "";

document.addEventListener("keydown", function (ereignis) {
  // Nur reagieren, wenn der Knopf versteckt ist
  if (!knopfVersteckt) {
    return;
  }

  if (aktuelleAufgabe === "leertaste" && ereignis.code === "Space") {
    // Verhindert, dass die Leertaste die Seite nach unten scrollt
    ereignis.preventDefault();
    holeKnopfZurueck();
  }

  if (aktuelleAufgabe === "wort") {
    // Buchstaben anhängen (klein geschrieben, damit "Komm" auch zählt)
    getippterText = getippterText + ereignis.key.toLowerCase();

    // Endet der getippte Text mit "komm"? Dann geschafft!
    if (getippterText.endsWith("komm")) {
      holeKnopfZurueck();
    }
  }
});

// --- Aufgabe mit der Maus: schnell nach links und rechts schütteln ---

// Zustand: Wie oft hat die Maus die Richtung gewechselt?
let richtungsWechsel = 0;
let letzteRichtung = "";        // "links" oder "rechts"
let zeitLetzterWechsel = 0;     // Zeitpunkt in Millisekunden

document.addEventListener("mousemove", function (ereignis) {
  if (!knopfVersteckt || aktuelleAufgabe !== "schuetteln") {
    return;
  }

  // Kleine, langsame Bewegungen ignorieren
  if (Math.abs(ereignis.movementX) < 5) {
    return;
  }

  // In welche Richtung bewegt sich die Maus gerade?
  let richtung = "rechts";
  if (ereignis.movementX < 0) {
    richtung = "links";
  }

  // Hat die Richtung gewechselt?
  if (richtung !== letzteRichtung) {
    const jetzt = Date.now();

    // War der letzte Wechsel zu lange her (mehr als eine halbe Sekunde)? Dann von vorne zählen
    if (jetzt - zeitLetzterWechsel > 500) {
      richtungsWechsel = 0;
    }

    richtungsWechsel = richtungsWechsel + 1;
    letzteRichtung = richtung;
    zeitLetzterWechsel = jetzt;

    // Genug geschüttelt?
    if (richtungsWechsel >= 6) {
      holeKnopfZurueck();
    }
  }
});

// Verschiebt den Knopf an eine zufällige Stelle – aber nur so weit, wie Platz ist
function lasseKnopfHuepfen() {
  // Wie viel Platz hat der Knopf nach rechts? (Breite der Zeile minus Breite des Knopfs)
  const freierPlatz = knopf.parentElement.clientWidth - 48 - knopf.offsetWidth;

  // Math.random() gibt eine Zahl zwischen 0 und 1 – daraus machen wir 0 bis freierPlatz Pixel
  const nachRechts = Math.round(Math.random() * freierPlatz);
  // Nach oben und unten: -80 bis +80 Pixel (minus = nach oben)
  const nachUnten = Math.round(Math.random() * 160 - 80);
  knopf.style.transform = "translate(" + nachRechts + "px, " + nachUnten + "px)";
}
