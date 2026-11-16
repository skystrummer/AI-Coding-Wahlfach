// script.js – das Verhalten der Seite

// Zustand (state): Wie oft wurde schon geklickt?
let klicks = 0;

// Elemente aus index.html holen
const knopf = document.getElementById("knopf");
const ausgabe = document.getElementById("ausgabe");
const ueberschrift = document.querySelector("h1");

// Ist das ein Handy/Tablet? ("coarse" = grober Zeiger, also ein Finger statt einer Maus)
const istHandy = window.matchMedia("(pointer: coarse)").matches;

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


// ===== Verschwinden und Zurückholen =====

// Zustand: Ist der Knopf gerade versteckt? Und welche Aufgabe gilt gerade?
let knopfVersteckt = false;
let aktuelleAufgabe = "";

// Liste aller Aufgaben.
// geraet sagt, wo die Aufgabe funktioniert: "computer", "handy" oder "alle"
const aufgaben = [
  { name: "leertaste", geraet: "computer", hinweis: "Drück die Leertaste, um ihn zurückzurufen." },
  { name: "wort", geraet: "computer", hinweis: "Tippe das Wort «komm», um ihn zurückzurufen." },
  { name: "mausSchuetteln", geraet: "computer", hinweis: "Schüttle die Maus schnell nach links und rechts!" },
  { name: "handySchuetteln", geraet: "handy", hinweis: "Schüttle dein Handy kräftig!" },
  { name: "zweiFinger", geraet: "handy", hinweis: "Tippe mit zwei Fingern gleichzeitig auf den Bildschirm." },
  { name: "ueberschrift", geraet: "alle", hinweis: "Tippe 5 Mal schnell auf die Überschrift «Hallo!»." },
  { name: "stillhalten", geraet: "alle", hinweis: "Halte still! 5 Sekunden nichts berühren, nichts bewegen …" }
];

// Gibt nur die Aufgaben zurück, die auf diesem Gerät funktionieren
function passendeAufgaben() {
  const passende = [];
  for (const aufgabe of aufgaben) {
    if (aufgabe.geraet === "alle") {
      passende.push(aufgabe);
    } else if (aufgabe.geraet === "handy" && istHandy) {
      passende.push(aufgabe);
    } else if (aufgabe.geraet === "computer" && !istHandy) {
      passende.push(aufgabe);
    }
  }
  return passende;
}

// Macht den Knopf unsichtbar und wählt eine zufällige Aufgabe
function versteckeKnopf() {
  knopfVersteckt = true;
  knopf.style.visibility = "hidden";
  // Fokus wegnehmen, sonst würde die Leertaste den Knopf später gleich wieder "klicken"
  knopf.blur();

  // Zufällige Aufgabe wählen – aber nicht dieselbe wie beim letzten Mal
  const moegliche = passendeAufgaben();
  let aufgabe = moegliche[Math.floor(Math.random() * moegliche.length)];
  while (aufgabe.name === aktuelleAufgabe) {
    aufgabe = moegliche[Math.floor(Math.random() * moegliche.length)];
  }
  aktuelleAufgabe = aufgabe.name;

  // Zähler für alle Aufgaben zurücksetzen
  getippterText = "";
  richtungsWechsel = 0;
  starkeStoesse = 0;
  ueberschriftKlicks = 0;

  ausgabe.textContent = "Huch, der Knopf ist weg! " + aufgabe.hinweis;

  // Sonderfälle, die beim Start der Aufgabe etwas brauchen
  if (aufgabe.name === "handySchuetteln") {
    frageNachBewegungsErlaubnis();
  }
  if (aufgabe.name === "stillhalten") {
    starteStillhalteUhr();
  }
}

// Macht den Knopf wieder sichtbar
function holeKnopfZurueck() {
  knopfVersteckt = false;
  clearTimeout(stillhalteUhr);
  knopf.style.visibility = "visible";
  ausgabe.textContent = "Da ist er wieder! Du hast bisher " + klicks + " Mal geklickt.";
}


// ===== Aufgaben mit der Tastatur: Leertaste und Wort tippen =====

// Zustand: Was wurde getippt, seit der Knopf weg ist?
let getippterText = "";

document.addEventListener("keydown", function (ereignis) {
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
    if (getippterText.endsWith("komm")) {
      holeKnopfZurueck();
    }
  }
});


// ===== Aufgabe: Maus schnell nach links und rechts schütteln =====

let richtungsWechsel = 0;
let letzteRichtung = "";        // "links" oder "rechts"
let zeitLetzterWechsel = 0;     // Zeitpunkt in Millisekunden

document.addEventListener("mousemove", function (ereignis) {
  if (!knopfVersteckt || aktuelleAufgabe !== "mausSchuetteln") {
    return;
  }

  // Kleine, langsame Bewegungen ignorieren
  if (Math.abs(ereignis.movementX) < 5) {
    return;
  }

  let richtung = "rechts";
  if (ereignis.movementX < 0) {
    richtung = "links";
  }

  if (richtung !== letzteRichtung) {
    const jetzt = Date.now();
    // Letzter Wechsel länger als eine halbe Sekunde her? Dann von vorne zählen
    if (jetzt - zeitLetzterWechsel > 500) {
      richtungsWechsel = 0;
    }
    richtungsWechsel = richtungsWechsel + 1;
    letzteRichtung = richtung;
    zeitLetzterWechsel = jetzt;

    if (richtungsWechsel >= 6) {
      holeKnopfZurueck();
    }
  }
});


// ===== Aufgabe: Handy schütteln =====

let starkeStoesse = 0;
let zeitLetzterStoss = 0;

// iPhones fragen zuerst um Erlaubnis, bevor eine Webseite die Bewegung lesen darf
function frageNachBewegungsErlaubnis() {
  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission();
  }
}

// "devicemotion" meldet laufend, wie stark das Handy beschleunigt wird
window.addEventListener("devicemotion", function (ereignis) {
  if (!knopfVersteckt || aktuelleAufgabe !== "handySchuetteln") {
    return;
  }

  const b = ereignis.accelerationIncludingGravity;
  if (!b || b.x === null) {
    return;
  }

  // Gesamtstärke der Bewegung (in Ruhe ca. 9.8 wegen der Erdanziehung)
  const staerke = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);

  if (staerke > 20) {
    const jetzt = Date.now();
    // Letzter Stoss länger als 1 Sekunde her? Dann von vorne zählen
    if (jetzt - zeitLetzterStoss > 1000) {
      starkeStoesse = 0;
    }
    starkeStoesse = starkeStoesse + 1;
    zeitLetzterStoss = jetzt;

    if (starkeStoesse >= 10) {
      holeKnopfZurueck();
    }
  }
});


// ===== Aufgabe: Mit zwei Fingern tippen =====

document.addEventListener("touchstart", function (ereignis) {
  if (!knopfVersteckt || aktuelleAufgabe !== "zweiFinger") {
    return;
  }
  // ereignis.touches enthält alle Finger, die gerade den Bildschirm berühren
  if (ereignis.touches.length >= 2) {
    holeKnopfZurueck();
  }
});


// ===== Aufgabe: 5 Mal schnell auf die Überschrift tippen =====

let ueberschriftKlicks = 0;
let zeitLetzterUeberschriftKlick = 0;

ueberschrift.addEventListener("click", function () {
  if (!knopfVersteckt || aktuelleAufgabe !== "ueberschrift") {
    return;
  }

  const jetzt = Date.now();
  // Zu langsam (mehr als 1 Sekunde Pause)? Dann von vorne zählen
  if (jetzt - zeitLetzterUeberschriftKlick > 1000) {
    ueberschriftKlicks = 0;
  }
  ueberschriftKlicks = ueberschriftKlicks + 1;
  zeitLetzterUeberschriftKlick = jetzt;

  if (ueberschriftKlicks >= 5) {
    holeKnopfZurueck();
  }
});


// ===== Aufgabe: 5 Sekunden stillhalten =====

let stillhalteUhr;   // merkt sich den laufenden Timer

// Startet (oder startet neu) einen 5-Sekunden-Timer
function starteStillhalteUhr() {
  clearTimeout(stillhalteUhr);
  stillhalteUhr = setTimeout(holeKnopfZurueck, 5000);
}

// Jede Bewegung, Berührung oder Taste startet den Timer neu
function stoereStille() {
  if (!knopfVersteckt || aktuelleAufgabe !== "stillhalten") {
    return;
  }
  ausgabe.textContent = "Zu unruhig! Nochmal 5 Sekunden ganz still halten …";
  starteStillhalteUhr();
}

document.addEventListener("mousemove", stoereStille);
document.addEventListener("pointerdown", stoereStille);
document.addEventListener("keydown", stoereStille);
