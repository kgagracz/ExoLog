import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import {AnimalCategory} from "../../types";
import {db} from "./firebase.config";

export const categoriesService = {
  async getAll(): Promise<{ success: boolean; data?: AnimalCategory[]; error?: string }> {
    try {
      const q = query(
        collection(db, "categories"),
        where("isActive", "==", true),
        orderBy("order", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const categories: AnimalCategory[] = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as AnimalCategory);
      });
      
      return { success: true, data: categories };
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      return { success: false, error: error.message };
    }
  },

  async add(category: Omit<AnimalCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding category:", error);
      return { success: false, error: error.message };
    }
  }
};
