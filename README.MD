# ExoLog - Aplikacja do zarządzania hodowlą ptaszników

## 📋 Stack Technologiczny
- **Frontend:** React Native + Expo
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **UI:** React Native Paper
- **Język:** TypeScript

---

## ✅ TODO Lista Funkcjonalności V1.0.0

### 🕷️ PTASZNIK

#### Dodawanie ptasznika
- [ ] Formularz dodawania ptasznika
    - [x] Gatunek (pole tekstowe z autocomplete)
    - [x] Imię (pole tekstowe)
    - [x] Płeć (wybór: samiec/samica/nieokreślona)
    - [x] Stadium wylinkowe (wybór: L1-L10, subadult, adult)
    - [x] Rozmiar ciała (pole numeryczne w cm)
    - [x] Data urodzenia (date picker)
    - [x] Data nabycia (date picker)
    - [ ] Dokument CITES (tak/nie + upload pliku)
    - [ ] Częstotliwość karmienia
        - [ ] Własna (pole numeryczne - dni)
        - [x] Na podstawie rozmiaru (automatyczne wyliczenie)
- [x] Dodaj wiele ptaszników jednocześnie 

#### Edytowanie ptasznika
- [ ] Ekran edycji ptasznika
    - [x] Gatunek
    - [x] Imię
    - [x] Płeć
    - [x] Stadium wylinkowe
    - [x] Rozmiar ciała
    - [x] Data urodzenia
    - [x] Data nabycia
    - [x] Częstotliwość karmienia (własna/automatyczna)
    - [ ] Dokument CITES
- [x] Aktualizacja danych w Firestore
- [ ] Zarządzanie dokumentem CITES (upload/usuwanie)

#### Usuwanie ptasznika
- [ ] Funkcja usuwania ptasznika
- [ ] Dialog potwierdzenia usunięcia
- [ ] Usuwanie z Firestore
- [ ] Usuwanie powiązanych zdjęć z Storage
- [ ] Usuwanie powiązanych dokumentów CITES

#### Wyświetlanie ptaszników
- [x] Lista wszystkich ptaszników
- [x] Karta pojedynczego ptasznika
- [x] Wyszukiwarka ptaszników
  - [x] Po nazwie
  - [x] Po gatunku
- [ ] Filtrowanie ptaszników
    - [ ] Po gatunku
    - [ ] Po płci
    - [ ] Po stadium
- [ ] Sortowanie ptaszników
    - [ ] Po nazwie
    - [ ] Po dacie dodania
    - [ ] Po gatunku

---

### 📅 WYDARZENIA PTASZNIKA

#### Karmienie
- [x] Dodawanie wydarzenia karmienia
    - [x] Nakarm wszystkie ptaszniki
        - [x] Automatyczne dodanie wydarzenia dla wszystkich
        - [x] Możliwość wykluczenia wybranych
        - [x] Zapis daty i godziny
    - [x] Nakarm pojedynczego ptasznika
- [ ] Historia karmienia
- [ ] Przypomnienia o karmieniu
    - [ ] Notyfikacje push
    - [ ] Lista ptaszników do nakarmienia

#### Wylinka
- [ ] Dodawanie wydarzenia wylinki
    - [ ] Data wylinki
    - [ ] Nowe stadium (automatyczna inkrementacja)
    - [ ] Nowy rozmiar (opcjonalnie)
    - [ ] Notatki
- [ ] Automatyczna aktualizacja stadium ptasznika
- [ ] Historia wyliniek

#### Dopuszczanie samicy
- [ ] Dodawanie wydarzenia dopuszczania
    - [ ] Wybór samicy
    - [ ] Wybór samca
    - [ ] Data dopuszczenia
    - [ ] Wynik (sukces/porażka/w trakcie)
    - [ ] Notatki
- [ ] Historia dopuszczeń
- [ ] Tracking par hodowlanych

#### Złożenie kokonu
- [ ] Dodawanie wydarzenia złożenia kokonu
    - [ ] Wybór samicy
    - [ ] Data złożenia
    - [ ] Przewidywana data wyjścia młodych
    - [ ] Notatki
- [ ] Przypomnienie o zbliżającej się dacie wyjścia młodych
- [ ] Historia kokonów

#### Napełnianie się samca
- [ ] Dodawanie wydarzenia napełnienia
    - [ ] Wybór samca
    - [ ] Data napełnienia
    - [ ] Stadium (subadult/adult)
    - [ ] Notatki
    - [ ] Zdjęcia (opcjonalnie)
- [ ] Oznaczenie samca jako gotowego do rozmnażania
- [ ] Historia napełnień

#### Zdjęcia
- [ ] Dodawanie zdjęć ptasznika
    - [ ] Upload z galerii
    - [ ] Zdjęcie z aparatu
    - [ ] Opis zdjęcia (opcjonalnie)
    - [ ] Data automatyczna
- [ ] Galeria zdjęć ptasznika
- [ ] Usuwanie zdjęć
- [ ] Upload do Firebase Storage

---

### 🔧 FUNKCJE DODATKOWE

#### Autoryzacja
- [x] Rejestracja użytkownika
- [x] Logowanie
- [ ] Wylogowanie
- [ ] Reset hasła
- [ ] Profil użytkownika

#### Powiadomienia
- [ ] System powiadomień push
- [ ] Przypomnienia o karmieniu
- [ ] Przypomnienia o przewidywanych wylinkach
- [ ] Przypomnienia o wyjściu młodych z kokonu

#### Statystyki
- [ ] Dashboard z statystykami
    - [ ] Liczba ptaszników
    - [ ] Rozkład płci
    - [ ] Rozkład stadiów
    - [ ] Ostatnie wydarzenia
- [ ] Wykresy i wizualizacje

#### Eksport danych
- [ ] Eksport listy ptaszników (CSV/PDF)
- [ ] Eksport historii wydarzeń
- [ ] Backup danych

---
