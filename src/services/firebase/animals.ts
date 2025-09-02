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
  serverTimestamp 
} from 'firebase/firestore';
import {db} from "./firebase.config";
import {Animal} from "../../types";

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
  }
};
