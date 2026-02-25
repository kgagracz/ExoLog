import { useMutation } from '@tanstack/react-query';
import { storageService } from '../../services/firebase/storageService';

interface UploadCitesParams {
    userId: string;
    animalId: string;
    fileUri: string;
}

export function useUploadCitesMutation() {
    return useMutation({
        mutationFn: async ({ userId, animalId, fileUri }: UploadCitesParams) => {
            const result = await storageService.uploadCitesDocument(userId, animalId, fileUri);
            if (!result.success) {
                throw new Error(result.error || 'Nie udało się przesłać dokumentu CITES');
            }
            return { url: result.url!, path: result.path! };
        },
    });
}
