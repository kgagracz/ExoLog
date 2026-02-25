import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import {db, storage} from "./firebase.config";
import {Animal} from "../../types";

// Typ dla danych karmienia
interface FeedingData {
  animalId: string;
  foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
  foodSize: 'small' | 'medium' | 'large';
  quantity: number;
  date: string;
  notes?: string;
  userId: string;
}

interface BulkFeedingData {
  animalIds: string[];
  foodType: 'cricket' | 'roach' | 'mealworm' | 'superworm' | 'other';
  foodSize: 'small' | 'medium' | 'large';
  quantity: number;
  date: string;
  notes?: string;
  userId: string;
}

export const animalsService = {
  async add(animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, "animals"), {
        ...animal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding animal:", error);
      return { success: false, error: error.message };
    }
  },

  async getUserAnimals(userId: string): Promise<{ success: boolean; data?: Animal[]; error?: string }> {
    try {
      const q = query(
          collection(db, "animals"),
          where("userId", "==", userId),
          where("isActive", "==", true),
          orderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);
      const animals: Animal[] = [];

      querySnapshot.forEach((doc) => {
        animals.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as Animal);
      });

      return { success: true, data: animals };
    } catch (error: any) {
      console.error("Error fetching user animals:", error);
      return { success: false, error: error.message };
    }
  },

  async getById(animalId: string): Promise<{ success: boolean; data?: Animal; error?: string }> {
    try {
      const docRef = doc(db, "animals", animalId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
          updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt
        } as Animal;

        return { success: true, data };
      } else {
        return { success: false, error: "Animal not found" };
      }
    } catch (error: any) {
      console.error("Error fetching animal:", error);
      return { success: false, error: error.message };
    }
  },

  async update(animalId: string, updates: Partial<Animal>): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, "animals", animalId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error updating animal:", error);
      return { success: false, error: error.message };
    }
  },

  async deactivate(animalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, "animals", animalId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error deactivating animal:", error);
      return { success: false, error: error.message };
    }
  },

  async delete(animalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, "animals", animalId));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting animal:", error);
      return { success: false, error: error.message };
    }
  },

  async getByCategory(userId: string, categoryId: string): Promise<{ success: boolean; data?: Animal[]; error?: string }> {
    try {
      const q = query(
          collection(db, "animals"),
          where("userId", "==", userId),
          where("categoryId", "==", categoryId),
          where("isActive", "==", true),
          orderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);
      const animals: Animal[] = [];

      querySnapshot.forEach((doc) => {
        animals.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as Animal);
      });

      return { success: true, data: animals };
    } catch (error: any) {
      console.error("Error fetching animals by category:", error);
      return { success: false, error: error.message };
    }
  },

  // NOWE FUNKCJE KARMIENIA

  /**
   * Nakarm pojedyncze zwierzę
   */
  async feedAnimal(feedingData: FeedingData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const batch = writeBatch(db);

      // 1. Dodaj rekord karmienia do kolekcji "feedings"
      const feedingRef = doc(collection(db, "feedings"));
      batch.set(feedingRef, {
        animalId: feedingData.animalId,
        foodType: feedingData.foodType,
        foodSize: feedingData.foodSize,
        quantity: feedingData.quantity,
        date: feedingData.date,
        notes: feedingData.notes || '',
        userId: feedingData.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Zaktualizuj zwierzę - ustaw ostatnią datę karmienia
      const animalRef = doc(db, "animals", feedingData.animalId);
      batch.update(animalRef, {
        'feeding.lastFed': feedingData.date,
        'feeding.lastFoodType': feedingData.foodType,
        'feeding.lastQuantity': feedingData.quantity,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      return { success: true, id: feedingRef.id };
    } catch (error: any) {
      console.error("Error feeding animal:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Nakarm wiele zwierząt jednocześnie (bulk feeding)
   */
  async feedMultipleAnimals(bulkFeedingData: BulkFeedingData): Promise<{ success: boolean; feedingIds?: string[]; error?: string }> {
    try {
      const batch = writeBatch(db);
      const feedingIds: string[] = [];

      // Dla każdego zwierzęcia
      for (const animalId of bulkFeedingData.animalIds) {
        // 1. Dodaj rekord karmienia
        const feedingRef = doc(collection(db, "feedings"));
        batch.set(feedingRef, {
          animalId: animalId,
          foodType: bulkFeedingData.foodType,
          foodSize: bulkFeedingData.foodSize,
          quantity: bulkFeedingData.quantity,
          date: bulkFeedingData.date,
          notes: bulkFeedingData.notes || '',
          userId: bulkFeedingData.userId,
          isBulkFeeding: true, // oznacz jako grupowe karmienie
          bulkFeedingId: `bulk_${Date.now()}`, // grupuj pod jednym ID
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        feedingIds.push(feedingRef.id);

        // 2. Zaktualizuj zwierzę
        const animalRef = doc(db, "animals", animalId);
        batch.update(animalRef, {
          'feeding.lastFed': bulkFeedingData.date,
          'feeding.lastFoodType': bulkFeedingData.foodType,
          'feeding.lastQuantity': bulkFeedingData.quantity,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      return { success: true, feedingIds };
    } catch (error: any) {
      console.error("Error feeding multiple animals:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Pobierz historię karmienia dla zwierzęcia
   */
  async getFeedingHistory(animalId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const q = query(
          collection(db, "feedings"),
          where("animalId", "==", animalId),
          orderBy("date", "desc")
      );

      const querySnapshot = await getDocs(q);
      const feedings: any[] = [];

      querySnapshot.forEach((doc) => {
        feedings.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        });
      });

      return { success: true, data: feedings };
    } catch (error: any) {
      console.error("Error fetching feeding history:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Pobierz wszystkie karmienia użytkownika (dla statystyk)
   */
  async getUserFeedings(userId: string, limit?: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      let q = query(
          collection(db, "feedings"),
          where("userId", "==", userId),
          orderBy("date", "desc")
      );

      if (limit) {
        // Jeśli chcesz limit, dodaj: q = query(..., limit(limit));
      }

      const querySnapshot = await getDocs(q);
      const feedings: any[] = [];

      querySnapshot.forEach((doc) => {
        feedings.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        });
      });

      return { success: true, data: feedings };
    } catch (error: any) {
      console.error("Error fetching user feedings:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Usuń rekord karmienia
   */
  async deleteFeedingRecord(feedingId: string, animalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const batch = writeBatch(db);

      // 1. Usuń rekord karmienia
      const feedingRef = doc(db, "feedings", feedingId);
      batch.delete(feedingRef);

      // 2. Opcjonalnie: zaktualizuj ostatnią datę karmienia zwierzęcia
      // (wymagałoby to sprawdzenia poprzedniego karmienia)

      await batch.commit();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting feeding record:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Usuń zwierzę na stałe (hard delete)
   */
  async deleteAnimal(animalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const batch = writeBatch(db);

      // 1. Usuń wszystkie rekordy karmienia dla tego zwierzęcia
      const feedingsQuery = query(
          collection(db, "feedings"),
          where("animalId", "==", animalId)
      );
      const feedingsSnapshot = await getDocs(feedingsQuery);

      feedingsSnapshot.forEach((feedingDoc) => {
        batch.delete(doc(db, "feedings", feedingDoc.id));
      });

      // 2. Usuń dokument zwierzęcia
      const animalRef = doc(db, "animals", animalId);
      batch.delete(animalRef);

      await batch.commit();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting animal permanently:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Usuń zwierzę wraz z jego historią karmienia i wszystkimi powiązanymi danymi
   */
  async deleteAnimalCompletely(animalId: string): Promise<{ success: boolean; deletedRecords?: number; error?: string }> {
    try {
      // Pobierz dane zwierzęcia przed usunięciem (potrzebne do czyszczenia Storage)
      const animalRef = doc(db, "animals", animalId);
      const animalDoc = await getDoc(animalRef);
      const animalData = animalDoc.exists() ? animalDoc.data() as Animal : null;

      const batch = writeBatch(db);
      let deletedRecords = 0;

      // 1. Usuń wszystkie karmienia
      const feedingsQuery = query(
          collection(db, "feedings"),
          where("animalId", "==", animalId)
      );
      const feedingsSnapshot = await getDocs(feedingsQuery);
      feedingsSnapshot.forEach((feedingDoc) => {
        batch.delete(doc(db, "feedings", feedingDoc.id));
        deletedRecords++;
      });

      // 2. Usuń wszystkie wydarzenia (wylinki, kopulacje, kokony)
      const eventsQuery = query(
          collection(db, "events"),
          where("animalId", "==", animalId)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      eventsSnapshot.forEach((eventDoc) => {
        batch.delete(doc(db, "events", eventDoc.id));
        deletedRecords++;
      });

      // 3. Usuń główny dokument zwierzęcia
      batch.delete(animalRef);
      deletedRecords++;

      await batch.commit();

      // 4. Usuń pliki ze Storage (zdjęcia + CITES)
      if (animalData?.userId) {
        const basePath = `users/${animalData.userId}/animals/${animalId}`;
        const foldersToClean = ['photos', 'cites'];

        for (const folder of foldersToClean) {
          try {
            const folderRef = ref(storage, `${basePath}/${folder}`);
            const fileList = await listAll(folderRef);
            await Promise.all(fileList.items.map(item => deleteObject(item)));
          } catch {
            // Folder may not exist — ignore
          }
        }

        // Usuń main.jpg jeśli istnieje
        try {
          await deleteObject(ref(storage, `${basePath}/main.jpg`));
        } catch {
          // May not exist
        }
      }

      return {
        success: true,
        deletedRecords
      };
    } catch (error: any) {
      console.error("Error deleting animal completely:", error);
      return { success: false, error: error.message };
    }
  },
  async deleteMultipleAnimals(animalIds: string[]): Promise<{ success: boolean; deletedCount?: number; failedCount?: number; error?: string }> {
    try {
      const results = await Promise.allSettled(
          animalIds.map(id => this.deleteAnimalCompletely(id))
      );

      let deletedCount = 0;
      let failedCount = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          deletedCount++;
        } else {
          failedCount++;
        }
      });

      return { success: true, deletedCount, failedCount };
    } catch (error: any) {
      console.error("Error deleting multiple animals:", error);
      return { success: false, error: error.message };
    }
  },

  async getAnimalsDueForFeeding(userId: string, daysSinceLastFeeding: number = 7): Promise<{ success: boolean; data?: Animal[]; error?: string }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastFeeding);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      // Pobierz wszystkie zwierzęta użytkownika
      const animalsResult = await this.getUserAnimals(userId);
      if (!animalsResult.success || !animalsResult.data) {
        return animalsResult;
      }

      // Filtruj te które nie były karmione lub były karmione dawno
      const animalsDue = animalsResult.data.filter(animal => {
        const lastFed = animal.feeding?.lastFed;
        if (!lastFed) return true; // nigdy nie karmione
        return lastFed < cutoffDateString; // karmione dawno
      });

      return { success: true, data: animalsDue };
    } catch (error: any) {
      console.error("Error getting animals due for feeding:", error);
      return { success: false, error: error.message };
    }
  }
};

// Export typów dla użycia w komponenach
export type { FeedingData, BulkFeedingData };