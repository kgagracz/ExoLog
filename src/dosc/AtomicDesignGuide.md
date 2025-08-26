// docs/AtomicDesignGuide.md

/**
* ATOMIC DESIGN STRUCTURE
*
* Nasza aplikacja używa metodologii Atomic Design dla organizacji komponentów:
*
* ATOMS (Atomy) - Najmniejsze, podstawowe komponenty UI
* └── Nie można ich podzielić na mniejsze części
* └── Przykłady: Text, LoadingSpinner, Avatar, Separator
*
* MOLECULES (Molekuły) - Kombinacje atomów tworzące funkcjonalne komponenty
* └── Łączą atomy w użyteczne elementy UI
* └── Przykłady: SearchInput, StatCard, AnimalInfo
*
* ORGANISMS (Organizmy) - Złożone komponenty z molekuł i atomów
* └── Sekcje interfejsu z określoną funkcjonalnością
* └── Przykłady: AnimalCard, AnimalList, SearchBar
*
* TEMPLATES (Szablony) - Układy stron definiujące strukturę
* └── Definiują rozmieszczenie organizmów na stronie
* └── Przykłady: ScreenLayout, ListScreenLayout
*
* PAGES (Strony) - Konkretne instancje szablonów z danymi
* └── Nasze screen komponenty (AnimalsListScreen, etc.)
  */

// === PRZYKŁADY UŻYCIA ===

// 1. ATOM - Podstawowy tekst
import { Text } from '../../components';

<Text variant="h1" color="#ff0000">
  Tytuł strony
</Text>

// 2. MOLECULE - Karta statystyki
import { StatCard } from '../../components';

<StatCard
value={25}
label="miesięcy"
/>

// 3. ORGANISM - Karta zwierzęcia
import { AnimalCard } from '../../components';

<AnimalCard
animal={animalData}
onPress={handlePress}
/>

// 4. TEMPLATE - Layout ekranu
import { ListScreenLayout } from '../../components';

<ListScreenLayout
title="Moje Ptaszniki"
searchComponent={<SearchBar />}
listComponent={<AnimalList />}
showAddButton={true}
onAddPress={handleAdd}
/>

// === ZALETY ATOMIC DESIGN ===

/**
* 1. REUSABILITY (Wielokrotne użycie)
*    - Komponenty mogą być używane w różnych kontekstach
*    - DRY principle - Don't Repeat Yourself
*
* 2. CONSISTENCY (Spójność)
*    - Jednolity design system
*    - Łatwiejsze utrzymanie spójności UI
*
* 3. SCALABILITY (Skalowalność)
*    - Łatwe dodawanie nowych funkcji
*    - Strukturalne podejście do rozwoju
*
* 4. TESTING (Testowanie)
*    - Małe komponenty łatwiej testować
*    - Izolowane testy jednostkowe
*
* 5. TEAM COLLABORATION (Współpraca zespołowa)
*    - Jasny podział odpowiedzialności
*    - Łatwiejsze code review
       */

// === KONWENCJE NAZEWNICTWA ===

/**
* ATOMS:
* - Pojedyncze słowo lub krótka nazwa
* - Przykłady: Text, Avatar, Button, Input
*
* MOLECULES:
* - Opisowa nazwa funkcjonalności
* - Przykłady: SearchInput, UserCard, StatCard
*
* ORGANISMS:
* - Nazwa sekcji lub funkcjonalności
* - Przykłady: AnimalCard, AnimalList, NavigationBar
*
* TEMPLATES:
* - Layout + typ ekranu
* - Przykłady: ScreenLayout, ListScreenLayout, FormLayout
    */

// === IMPORT GUIDELINES ===

// ✅ DOBRZE - Import z głównego index
import { Text, Avatar, AnimalCard, ScreenLayout } from '../../components';

// ❌ ŹLE - Import bezpośredni z folderu
import Text from '../../components/atoms/Text/Text';

// ✅ DOBRZE - Import specyficznych komponentów
import {
LoadingSpinner,
SearchInput,
AnimalList
} from '../../components';

// === STYLE GUIDELINES ===

/**
* 1. Wszystkie style w createStyles funkcji
* 2. Używaj theme object dla kolorów/spacingu
* 3. Props dla customizacji zachowania
* 4. style prop dla zewnętrznych modyfikacji
     */

// Przykład dobrej struktury komponentu:
/*
interface ComponentProps {
// Required props
title: string;
// Optional props z defaultami
variant?: 'primary' | 'secondary';
// Style override
style?: any;
// Callback functions
onPress?: () => void;
}

const Component: React.FC<ComponentProps> = ({
title,
variant = 'primary',
style,
onPress,
}) => {
const { theme } = useTheme();
const styles = createStyles(theme, variant);

return (
<TouchableOpacity
style={[styles.container, style]}
onPress={onPress}
>
<Text style={styles.title}>{title}</Text>
</TouchableOpacity>
);
};
*/

// === FOLDER STRUCTURE ===
/*
src/
├── components/
│   ├── atoms/           # Podstawowe elementy
│   ├── molecules/       # Kombinacje atomów  
│   ├── organisms/       # Złożone komponenty
│   ├── templates/       # Layout templates
│   └── index.ts         # Główny export
├── screens/             # Page components
├── hooks/               # Custom hooks
├── context/             # React contexts
├── theme/               # Theme configuration
└── types/               # TypeScript types
*/

export {}; // Make this a module