import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { getOriginFromHttpUrl, normalizeOptionalHttpUrl } from '../utils/urlHelpers';

export type Category = 'Upper Wear' | 'Bottom Wear' | 'Shoe' | 'Accessory';

export interface UploadedItem {
    id: string;
    uri: string;
    name: string;
    category: Category;
    sourcePageUrl?: string;
    timestamp: number;
}

interface AppContextType {
    items: UploadedItem[];
    addItem: (item: Omit<UploadedItem, 'id' | 'timestamp'>) => Promise<UploadedItem>;
    isLoading: boolean;
}

const STORAGE_KEY = '@digidrobe_items';
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<UploadedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load items on startup
    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const savedItems = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedItems) {
                setItems(JSON.parse(savedItems));
            }
        } catch (error) {
            console.error('Failed to load items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveItems = async (newItems: UploadedItem[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        } catch (error) {
            console.error('Failed to save items:', error);
        }
    };

    const getFileExtension = (uri: string) => {
        const cleanUri = uri.split('#')[0].split('?')[0];
        const match = cleanUri.match(/\.([a-zA-Z0-9]{2,5})$/);
        const extension = (match?.[1] || 'jpg').toLowerCase();
        const allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
        if (!allowed.includes(extension)) return 'jpg';
        return extension === 'jpeg' ? 'jpg' : extension;
    };

    const addItem = async (item: Omit<UploadedItem, 'id' | 'timestamp'>) => {
        try {
            console.log('--- START ADD ITEM (RNFS) ---');

            const id = Math.random().toString(36).substring(2, 11);
            const timestamp = Date.now();

            // Prepare directory
            const permanentDir = `${RNFS.DocumentDirectoryPath}/wardrobe`;
            console.log('Target Directory:', permanentDir);

            const exists = await RNFS.exists(permanentDir);
            if (!exists) {
                await RNFS.mkdir(permanentDir);
            }

            // Prepare URI
            const sourceUri = item.uri.trim();
            const fileExtension = getFileExtension(sourceUri);
            const permanentUri = `${permanentDir}/${id}.${fileExtension}`;

            console.log('Source URI:', sourceUri);
            console.log('Permanent URI:', permanentUri);

            let finalUri = `file://${permanentUri}`;

            if (/^https?:\/\//i.test(sourceUri)) {
                const encodedUrl = encodeURI(sourceUri);
                const sourcePageUrl = normalizeOptionalHttpUrl(item.sourcePageUrl);
                const origin = getOriginFromHttpUrl(encodedUrl) || '';
                const sourceOrigin = sourcePageUrl ? getOriginFromHttpUrl(sourcePageUrl) || '' : '';

                const result = await RNFS.downloadFile({
                    fromUrl: encodedUrl,
                    toFile: permanentUri,
                    background: true,
                    headers: {
                        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; DigidrobeApp)',
                        ...(sourcePageUrl ? { Referer: sourcePageUrl } : {}),
                        ...(sourceOrigin ? { Origin: sourceOrigin } : {}),
                        ...(origin ? { 'X-Requested-With': origin } : {}),
                    },
                }).promise;

                if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
                    console.warn(
                        `Remote image download failed (status ${result.statusCode ?? 'unknown'}). Falling back to URL.`
                    );
                    finalUri = encodedUrl;
                }
            } else {
                // RNFS.copyFile expects absolute paths. For some picked files on Android, we might need content:// handling,
                // but for now we assume standard file paths or file://
                const sourcePath = sourceUri.replace('file://', '');
                await RNFS.copyFile(sourcePath, permanentUri);
            }

            const newItem: UploadedItem = {
                ...item,
                uri: finalUri,
                sourcePageUrl: normalizeOptionalHttpUrl(item.sourcePageUrl),
                id,
                timestamp,
            };

            setItems((prev) => {
                const next = [newItem, ...prev];
                void saveItems(next);
                return next;
            });
            console.log('--- SAVE SUCCESSFUL (RNFS) ---');
            return newItem;
        } catch (error: any) {
            const errorMsg = error?.message || String(error);
            console.error('SAVE FAILURE:', error);
            Alert.alert('Save Error', `Could not save item.\n\nDetails: ${errorMsg}`);
            throw error;
        }
    };

    return (
        <AppContext.Provider value={{ items, addItem, isLoading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
