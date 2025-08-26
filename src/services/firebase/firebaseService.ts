// firebaseService.js - Serwis do operacji na zwierzętach w Firestore

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.config';

// ===============================
// 1. DODAWANIE NOWEGO ZWIERZĘCIA
// ===============================

export const addAnimal = async (animalData) => {
    try {
        // Przygotuj dane z timestampami
        const animalToAdd = {
            ...animalData,
            id: null, // Firestore automatycznie wygeneruje ID
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Dodaj do kolekcji "animals"
        const docRef = await addDoc(collection(db, "animals"), animalToAdd);

        console.log("Zwierzę dodane z ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Błąd podczas dodawania zwierzęcia: ", error);
        return { success: false, error: error.message };
    }
};

// Przykład użycia:
const exampleTarantula = {
    name: "Charlotte",
    animalType: "tarantula",
    species: "Grammostola rosea",
    commonName: "Chilean Rose Hair",
    sex: "female",
    stage: "adult",
    dateAcquired: "2024-01-15",
    measurements: {
        length: null,
        width: 12.5,
        weight: 15.3,
        lastMeasured: "2024-01-15"
    },
    housing: {
        terrariumType: "glass",
        dimensions: { length: 30, width: 20, height: 20 },
        substrate: "coconut_fiber",
        heating: "none",
        humidity: 70,
        temperature: { day: 24, night: 20 }
    },
    healthStatus: "healthy",
    isActive: true,
    typeSpecificData: {
        lastMolt: "2023-12-15",
        preMoltSigns: false,
        webType: "minimal"
    },
    feeding: {
        lastFed: "2024-01-30",
        foodType: "cricket",
        foodSize: "medium",
        feedingSchedule: "monthly"
    },
    photos: [],
    notes: "Spokojny ptasznik, idealny dla początkujących",
    behavior: "docile",
    tags: ["beginner_friendly"]
};

// ===============================
// 2. POBIERANIE ZWIERZĄT
// ===============================

// Pobierz wszystkie zwierzęta
export const getAllAnimals = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "animals"));
        const animals = [];

        querySnapshot.forEach((doc) => {
            animals.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, data: animals };
    } catch (error) {
        console.error("Błąd podczas pobierania zwierząt: ", error);
        return { success: false, error: error.message };
    }
};

// Pobierz zwierzęta według typu
export const getAnimalsByType = async (animalType) => {
    try {
        const q = query(
            collection(db, "animals"),
            where("animalType", "==", animalType),
            where("isActive", "==", true),
            orderBy("name")
        );

        const querySnapshot = await getDocs(q);
        const animals = [];

        querySnapshot.forEach((doc) => {
            animals.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, data: animals };
    } catch (error) {
        console.error("Błąd podczas pobierania zwierząt według typu: ", error);
        return { success: false, error: error.message };
    }
};

// Pobierz jedno zwierzę według ID
export const getAnimalById = async (animalId) => {
    try {
        const docRef = doc(db, "animals", animalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                success: true,
                data: { id: docSnap.id, ...docSnap.data() }
            };
        } else {
            return { success: false, error: "Zwierzę nie istnieje" };
        }
    } catch (error) {
        console.error("Błąd podczas pobierania zwierzęcia: ", error);
        return { success: false, error: error.message };
    }
};

// ===============================
// 3. AKTUALIZACJA ZWIERZĘCIA
// ===============================

export const updateAnimal = async (animalId, updates) => {
    try {
        const docRef = doc(db, "animals", animalId);

        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, updateData);

        console.log("Zwierzę zaktualizowane!");
        return { success: true };
    } catch (error) {
        console.error("Błąd podczas aktualizacji zwierzęcia: ", error);
        return { success: false, error: error.message };
    }
};

// ===============================
// 4. USUWANIE ZWIERZĘCIA
// ===============================

// Soft delete - oznacz jako nieaktywne
export const deactivateAnimal = async (animalId) => {
    return await updateAnimal(animalId, {
        isActive: false,
        deactivatedAt: serverTimestamp()
    });
};

// Hard delete - usuń z bazy
export const deleteAnimal = async (animalId) => {
    try {
        await deleteDoc(doc(db, "animals", animalId));
        console.log("Zwierzę usunięte!");
        return { success: true };
    } catch (error) {
        console.error("Błąd podczas usuwania zwierzęcia: ", error);
        return { success: false, error: error.message };
    }
};

// ===============================
// 5. FUNKCJE POMOCNICZE
// ===============================

// Szablony dla różnych typów zwierząt
export const getAnimalTemplate = (animalType) => {
    const baseTemplate = {
        name: "",
        animalType: animalType,
        species: "",
        commonName: "",
        sex: "unknown",
        stage: "juvenile",
        dateAcquired: new Date().toISOString().split('T')[0],
        measurements: {
            length: null,
            width: null,
            weight: null,
            lastMeasured: new Date().toISOString().split('T')[0]
        },
        housing: {
            terrariumType: "glass",
            dimensions: { length: null, width: null, height: null },
            substrate: "",
            heating: "none",
            humidity: null,
            temperature: { day: null, night: null }
        },
        healthStatus: "healthy",
        isActive: true,
        feeding: {
            lastFed: null,
            foodType: "",
            foodSize: "medium",
            feedingSchedule: "weekly"
        },
        photos: [],
        notes: "",
        behavior: "unknown",
        tags: []
    };

    // // Dodaj specyficzne pola dla typu
    // switch (animalType) {
    //     case "tarantula":
    //         baseTemplate.typeSpecificData = {
    //             lastMolt: null,
    //             preMoltSigns: false,
    //             webType: "minimal"
    //         };
    //         baseTemplate.feeding.feedingSchedule = "weekly";
    //         break;
    //
    //     case "snake":
    //         baseTemplate.typeSpecificData = {
    //             lastShed: null,
    //             inShed: false,
    //             feedingResponse: "good"
    //         };
    //         baseTemplate.feeding.feedingSchedule = "biweekly";
    //         break;
    //
    //     case "lizard":
    //     case "gecko":
    //         baseTemplate.typeSpecificData = {
    //             lastShed: null,
    //             baskingBehavior: "normal",
    //             tailFat: "good"
    //         };
    //         baseTemplate.feeding.feedingSchedule = "daily";
    //         break;
    //
    //     default:
    //         baseTemplate.typeSpecificData = {};
    // }

    return baseTemplate;
};

// Statystyki
export const getAnimalStats = async () => {
    try {
        const animals = await getAllAnimals();
        if (!animals.success) return animals;

        const stats = {
            total: animals.data.length,
            active: animals.data.filter(a => a.isActive).length,
            byType: {},
            bySex: { male: 0, female: 0, unknown: 0 },
            byStage: { juvenile: 0, adult: 0, subadult: 0 }
        };

        animals.data.forEach(animal => {
            // Zlicz według typu
            stats.byType[animal.animalType] = (stats.byType[animal.animalType] || 0) + 1;

            // Zlicz według płci
            stats.bySex[animal.sex] = (stats.bySex[animal.sex] || 0) + 1;

            // Zlicz według stadium
            stats.byStage[animal.stage] = (stats.byStage[animal.stage] || 0) + 1;
        });

        return { success: true, data: stats };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ===============================
// PRZYKŁADY UŻYCIA:
// ===============================

/*
// 1. Dodaj nowego ptasznika
const newTarantula = getAnimalTemplate("tarantula");
newTarantula.name = "Charlotte";
newTarantula.species = "Grammostola rosea";
const result = await addAnimal(newTarantula);

// 2. Pobierz wszystkie ptaszniki
const tarantulas = await getAnimalsByType("tarantula");

// 3. Zaktualizuj wagę
await updateAnimal("animal-id", {
  "measurements.weight": 18.5,
  "measurements.lastMeasured": new Date().toISOString().split('T')[0]
});

// 4. Dodaj notatkę o karmieniu
await updateAnimal("animal-id", {
  "feeding.lastFed": new Date().toISOString().split('T')[0],
  notes: "Zjadł cały świerszcz w 2 minuty"
});

// 5. Pobierz statystyki
const stats = await getAnimalStats();
*/