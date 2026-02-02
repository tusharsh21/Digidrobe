import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';

export type Category = 'Upper Wear' | 'Bottom Wear' | 'Shoe' | 'Accessory';

export interface UploadedItem {
    id: string;
    uri: string;
    name: string;
    category: Category;
    timestamp: number;
}

interface AppContextType {
    items: UploadedItem[];
    addItem: (item: Omit<UploadedItem, 'id' | 'timestamp'>) => Promise<void>;
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

    const addItem = async (item: Omit<UploadedItem, 'id' | 'timestamp'>) => {
        try {
            console.log('--- START ADD ITEM (RNFS) ---');

            // RNFS.DocumentDirectoryPath is a string constant, reliable on native
            const docDir = RNFS.DocumentDirectoryPath;

            if (!docDir) {
                throw new Error('RNFS.DocumentDirectoryPath is null');
            }

            const id = Math.random().toString(36).substr(2, 9);
            const timestamp = Date.now();

            // Prepare directory
            // Note: RNFS paths usually don't need trailing slash if joining with /
            const permanentDir = `${docDir}/wardrobe`;
            console.log('Target Directory:', permanentDir);

            try {
                // RNFS.mkdir creates intermediates by default on Android
                await RNFS.mkdir(permanentDir);
            } catch (err) {
                console.log('Dir check/create:', err);
            }

            // Prepare URI
            const cleanUri = item.uri.split('?')[0];
            const fileExtension = cleanUri.split('.').pop() || 'jpg';
            const permanentUri = `file://${permanentDir}/${id}.${fileExtension}`;

            console.log('Source URI:', item.uri);
            console.log('Permanent URI:', permanentUri);

            // Copy file to permanent storage
            // Handle file:// prefix for copyFile if needed, usually RNFS handles paths
            const sourcePath = item.uri.startsWith('file://') ? item.uri.replace('file://', '') : item.uri;
            const destPath = permanentUri.replace('file://', '');

            await RNFS.copyFile(sourcePath, destPath);

            const newItem: UploadedItem = {
                ...item,
                uri: permanentUri, // Store with file:// prefix for Image component
                id,
                timestamp,
            };

            const updatedItems = [newItem, ...items];
            setItems(updatedItems);
            await saveItems(updatedItems);
            console.log('--- SAVE SUCCESSFUL (RNFS) ---');
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
