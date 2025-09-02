import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import {EventType} from "../../types";
import {db} from "./firebase.config";

export const eventTypesService = {
  async getForAnimalType(animalTypeId: string): Promise<{ success: boolean; data?: EventType[]; error?: string }> {
    try {
      const q = query(
        collection(db, "event_types"),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const eventTypes: EventType[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.applicableToTypes.includes('*') || 
            data.applicableToTypes.includes(animalTypeId)) {
          eventTypes.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
          } as EventType);
        }
      });
      
      return { success: true, data: eventTypes };
    } catch (error: any) {
      console.error("Error fetching event types:", error);
      return { success: false, error: error.message };
    }
  },

  async getAll(): Promise<{ success: boolean; data?: EventType[]; error?: string }> {
    try {
      const q = query(
        collection(db, "event_types"),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const eventTypes: EventType[] = [];
      
      querySnapshot.forEach((doc) => {
        eventTypes.push({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
        } as EventType);
      });
      
      return { success: true, data: eventTypes };
    } catch (error: any) {
      console.error("Error fetching all event types:", error);
      return { success: false, error: error.message };
    }
  }
};
