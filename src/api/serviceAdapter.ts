interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    id?: string;
    deletedRecords?: number;
    feedingIds?: string[];
    message?: string;
}

export async function unwrapService<T>(promise: Promise<ServiceResponse<T>>): Promise<T> {
    const result = await promise;
    if (!result.success) {
        throw new Error(result.error || 'Nieznany błąd');
    }
    return result.data as T;
}

export async function unwrapServiceWithMeta<T>(promise: Promise<ServiceResponse<T>>): Promise<ServiceResponse<T>> {
    const result = await promise;
    if (!result.success) {
        throw new Error(result.error || 'Nieznany błąd');
    }
    return result;
}
