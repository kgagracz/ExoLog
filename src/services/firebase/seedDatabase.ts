import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEED_CATEGORIES, SEED_ANIMAL_TYPES, SEED_EVENT_TYPES } from '../../data/seedData';
import {db} from "./firebase.config";

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
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
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

// Funkcja do wywołania w aplikacji lub konsoli
export const initializeAppData = async () => {
  const result = await seedDatabase();
  if (result.success) {
    console.log('✅ App data initialized');
  } else {
    console.error('❌ Failed to initialize app data:', result.error);
  }
  return result;
};
