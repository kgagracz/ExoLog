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
    - [x] API do listy pająków podczas wpisywania gatunku
    - [X] Dokument CITES (tak/nie + upload pliku)
    - [x] Częstotliwość karmienia
        - [x] Własna (pole numeryczne - dni)
- [x] Dodaj wiele ptaszników jednocześnie 

#### Edytowanie ptasznika
- [X] Ekran edycji ptasznika
    - [x] Gatunek
    - [x] Imię
    - [x] Płeć
    - [x] Stadium wylinkowe
    - [x] Rozmiar ciała
    - [x] Data urodzenia
    - [x] Data nabycia
    - [x] Częstotliwość karmienia (własna/automatyczna)
    - [X] Dokument CITES
- [x] Aktualizacja danych w Firestore
- [X] Zarządzanie dokumentem CITES (upload/usuwanie)

#### Usuwanie ptasznika
- [x] Funkcja usuwania ptasznika
- [x] Dialog potwierdzenia usunięcia
- [x] Usuwanie z Firestore
- [x] Usuwanie powiązanych zdjęć z Storage
- [x] Usuwanie powiązanych dokumentów CITES

#### Wyświetlanie ptaszników
- [x] Lista wszystkich ptaszników
- [x] Karta pojedynczego ptasznika
  - [x] Informacja o kokonie
  - [x] Informacja o kopulacji
  - [x] Informacja o ostatniej wylince jeśli mniej niż 14 dni temu (potrzebne do karmienia)
- [x] Wyszukiwarka ptaszników
  - [x] Po nazwie
  - [x] Po gatunku
- [x] Filtrowanie ptaszników
    - [x] Po gatunku
    - [x] Po płci
- [x] Sortowanie ptaszników
    - [x] Po nazwie
    - [x] Po dacie dodania
    - [x] Po gatunku

---

### 📅 WYDARZENIA PTASZNIKA

#### Karmienie
- [x] Dodawanie wydarzenia karmienia
    - [x] Nakarm wszystkie ptaszniki
        - [x] Automatyczne dodanie wydarzenia dla wszystkich
        - [x] Możliwość wykluczenia wybranych
        - [x] Zapis daty i godziny
    - [x] Nakarm pojedynczego ptasznika
- [x] Historia karmienia
- [ ] Przypomnienia o karmieniu
    - [ ] Notyfikacje push
    - [ ] Lista ptaszników do nakarmienia

#### Wylinka
- [x] Dodawanie wydarzenia wylinki
    - [x] Data wylinki
    - [x] Nowe stadium (automatyczna inkrementacja)
    - [x] Nowy rozmiar (opcjonalnie)
    - [x] Notatki
- [x] Automatyczna aktualizacja stadium ptasznika
- [x] Historia wyliniek

#### Dopuszczanie samicy
- [x] Dodawanie wydarzenia dopuszczania
    - [x] Wybór samicy
    - [x] Wybór samca
    - [x] Data dopuszczenia
    - [x] Wynik (sukces/porażka/w trakcie)
    - [x] Notatki
- [ ] Historia dopuszczeń
- [ ] Tracking par hodowlanych

#### Złożenie kokonu
- [x] Dodawanie wydarzenia złożenia kokonu
    - [x] Wybór samicy
    - [x] Data złożenia
    - [x] Przewidywana data wyjścia młodych
    - [x] Notatki
- [] Przypomnienie o zbliżającej się dacie wyjścia młodych
- [] Historia kokonów
- [x] Otwieranie kokonu
  - [x] Dodawanie ilości młodych i wprowadzanie ich do systemu

[//]: # (#### Napełnianie się samca - nie w MVP)

[//]: # (- [ ] Dodawanie wydarzenia napełnienia)

[//]: # (    - [ ] Wybór samca)

[//]: # (    - [ ] Data napełnienia)

[//]: # (    - [ ] Stadium &#40;subadult/adult&#41;)

[//]: # (    - [ ] Notatki)

[//]: # (    - [ ] Zdjęcia &#40;opcjonalnie&#41;)

[//]: # (- [ ] Oznaczenie samca jako gotowego do rozmnażania)

[//]: # (- [ ] Historia napełnień)

#### Zdjęcia
- [ ] Dodawanie zdjęć ptasznika
    - [x] Upload z galerii
    - [x] Zdjęcie z aparatu
    - [ ] Opis zdjęcia (opcjonalnie)
    - [ ] Zapisywanie rozmiarów ptasznika
    - [x] Data automatyczna
- [x] Galeria zdjęć ptasznika
- [x] Usuwanie zdjęć
- [x] Upload do Firebase Storage

---

### 🔧 FUNKCJE KODU QR
- [x] Generowanie kodu QR 
- [x] Skanowanie kodu QR i przenoszenie na strone pająka


### 🔧 FUNKCJE DODATKOWE

#### Autoryzacja
- [x] Rejestracja użytkownika
- [x] Logowanie
- [x] Wylogowanie
- [ ] Reset hasła
- [x] Profil użytkownika

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

### 👥 SPOŁECZNOŚĆ

#### Profile użytkowników
- [x] Publiczny profil użytkownika (nazwa, bio, statystyki)
- [x] Przełącznik widoczności profilu (publiczny/prywatny)
- [x] Automatyczne tworzenie profilu przy rejestracji
- [x] Lazy tworzenie profilu dla istniejących użytkowników

#### Wyszukiwanie użytkowników
- [x] Wyszukiwarka użytkowników (prefix search)
- [x] Debounce 300ms
- [x] Wyświetlanie statusu relacji przy wynikach

#### Zaproszenia do znajomych
- [x] Wysyłanie zaproszeń
- [x] Lista otrzymanych zaproszeń (akceptuj/odrzuć)
- [x] Lista wysłanych zaproszeń (status oczekiwania)
- [x] Badge z liczbą oczekujących zaproszeń
- [x] Walidacja duplikatów (nie można wysłać ponownie)

#### Lista znajomych
- [x] Wyświetlanie listy znajomych
- [x] Usuwanie znajomych (z potwierdzeniem)
- [x] Przejście na profil znajomego

#### Przeglądanie profili
- [x] Widok profilu innego użytkownika (avatar, nazwa, bio, statystyki)
- [x] Lista zwierząt użytkownika (jeśli profil publiczny lub znajomy)
- [x] Informacja o prywatnym profilu dla niezalogowanych
- [x] Przycisk relacji (wyślij zaproszenie / oczekuje / usuń znajomego)

#### Nawigacja
- [x] Zakładka "Społeczność" w bottom tabs (ikona account-group)
- [x] Stack: Społeczność → Wyszukiwanie → Profil użytkownika → Zaproszenia

---
