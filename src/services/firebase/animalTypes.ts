import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import {db} from "./firebase.config";
import {AnimalType} from "../../types";

export const animalTypesService = {
  async getByCategory(categoryId: string): Promise<{ success: boolean; data?: AnimalType[]; error?: string }> {
    try {
      const q = query(
        collection(db, "animal_types"),
        where("categoryId", "==", categoryId),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const types: AnimalType[] = [];
      
      querySnapshot.forEach((doc) => {
        types.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as AnimalType);
      });
      
      return { success: true, data: types };
    } catch (error: any) {
      console.error("Error fetching animal types:", error);
      return { success: false, error: error.message };
    }
  },

  async getAll(): Promise<{ success: boolean; data?: AnimalType[]; error?: string }> {
    try {
      const q = query(
        collection(db, "animal_types"),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const types: AnimalType[] = [];
      
      querySnapshot.forEach((doc) => {
        types.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as AnimalType);
      });
      
      return { success: true, data: types };
    } catch (error: any) {
      console.error("Error fetching all animal types:", error);
      return { success: false, error: error.message };
    }
  },

  async getById(typeId: string): Promise<{ success: boolean; data?: AnimalType; error?: string }> {
    try {
      const docRef = doc(db, "animal_types", typeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt,
          updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt
        } as AnimalType;
        
        return { success: true, data };
      } else {
        return { success: false, error: "Animal type not found" };
      }
    } catch (error: any) {
      console.error("Error fetching animal type:", error);
      return { success: false, error: error.message };
    }
  },

  async add(animalType: Omit<AnimalType, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, "animal_types"), {
        ...animalType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding animal type:", error);
      return { success: false, error: error.message };
    }
  }
};
