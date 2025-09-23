import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { SEED_CATEGORIES, SEED_ANIMAL_TYPES, SEED_EVENT_TYPES } from '../../data/seedData';
import {auth, db} from "./firebase.config";

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  // Sprawdź czy użytkownik jest zalogowany
  if (!auth.currentUser) {
    console.error('❌ User not authenticated');
    return { success: false, error: 'User must be logged in to initialize database' };
  }

  try {
    // Sprawdź czy kategorie już istnieją
    const existingCategories = await getDocs(query(collection(db, "categories"), limit(1)));
    if (!existingCategories.empty) {
      console.log('ℹ️ Database already initialized');
      return { success: true, message: 'Database already contains data' };
    }

    // Seed categories
    console.log('📁 Seeding categories...');
    const categoryIds: Record<string, string> = {};

    for (const category of SEED_CATEGORIES) {
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      categoryIds[category.name] = docRef.id;
      console.log(`✅ Added category: ${category.displayName.pl}`);
    }

    // Seed animal types
    console.log('🐾 Seeding animal types...');
    for (const [categoryName, animalTypes] of Object.entries(SEED_ANIMAL_TYPES)) {
      const categoryId = categoryIds[categoryName];
      if (!categoryId) {
        console.warn(`⚠️ Category ID not found for: ${categoryName}`);
        continue;
      }

      for (const animalType of animalTypes) {
        await addDoc(collection(db, "animal_types"), {
          ...animalType,
          categoryId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added animal type: ${animalType.displayName.pl} to ${categoryName}`);
      }
    }

    // Seed event types
    console.log('📅 Seeding event types...');
    for (const eventType of SEED_EVENT_TYPES) {
      await addDoc(collection(db, "event_types"), {
        ...eventType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Added event type: ${eventType.displayName.pl}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };

  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja do wywołania w aplikacji
export const initializeAppData = async () => {
  // Sprawdź czy użytkownik jest zalogowany
  if (!auth.currentUser) {
    return { success: false, error: 'You must be logged in to initialize the database' };
  }

  const result = await seedDatabase();
  if (result.success) {
    console.log('✅ App data initialized');
  } else {
    console.error('❌ Failed to initialize app data:', result.error);
  }
  return result;
};
