import * as admin from 'firebase-admin';
admin.initializeApp();

export { onMoltingCreated, onAnimalPhotosUpdated } from './activityFunctions';
