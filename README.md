# Farm Stack Tycoon (HTML/JS)

Kleines Browser-Game im Farm-Stil, inspiriert von typischen Idle/Stack-Spielen.

## Features
- Automatische Eierproduktion durch Hühner
- Hühner kaufen und Wiese upgraden
- Eier in Kisten verpacken
- Kisten verkaufen (mit Kunden-Queue Bonus)
- Stapel-Mechanik: bei 10 Kisten gibt es Bonusgeld

## Start lokal
```bash
python3 -m http.server 8080
```
Dann im Browser öffnen:
`http://localhost:8080`

## Deployment auf Webspace
Einfach alle Dateien (`index.html`, `styles.css`, `game.js`) in dein Webspace-Verzeichnis hochladen.

> Keine Datenbank nötig, da der Spielstand nur im Browser läuft.
> Wenn du später persistent speichern willst, kann ich dir eine PHP + SQLite Version nachreichen.
