# Farm Stack Tycoon (PHP + SQLite)

Eine kleine Farm-Stack-Game Demo im Stil des Screenshots: Hühnerbereich, Eier einsammeln, zur Maschine bringen, Kisten stapeln und an Kunden verkaufen.

## Warum PHP + SQLite?
- Läuft auf typischem Webspace mit PHP.
- Spielstand wird serverseitig in SQLite gespeichert (`data/farm.sqlite`).
- Kein externer Datenbankserver nötig.

## Dateien
- `index.php` → UI + API (`?api=load|save|reset`) + SQLite-Handling
- `game.js` → Canvas-Gameplay (Bewegung, Eier, Maschine, Kunden, Verkauf)
- `styles.css` → Farm-UI Styling

## Lokal starten
```bash
php -S 0.0.0.0:8080
```
Dann öffnen: `http://localhost:8080/index.php`

## Deployment auf Webspace
1. Alle Dateien hochladen.
2. Sicherstellen, dass PHP Schreibrechte auf `data/` hat.
3. `index.php` als Startseite aufrufen.

## Gameplay
- Mit Klick auf den Boden läufst du zur Zielposition.
- Im Hühnerbereich spawnen Eier automatisch.
- Wenn du in die Nähe von Eiern läufst, sammelst du sie ein.
- In der Maschinenzone werden je 6 Eier zu Kisten.
- In der Marktzone verkaufst du Kisten an wartende Kunden.
- Bei vollem Stapel (12) gibt es Bonusgeld.
