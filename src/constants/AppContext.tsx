import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    addItem: (item: Omit<UploadedItem, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<UploadedItem[]>([]);

    const addItem = (item: Omit<UploadedItem, 'id' | 'timestamp'>) => {
        const newItem: UploadedItem = {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
        };
        setItems((prev) => [newItem, ...prev]);
    };

    return (
        <AppContext.Provider value={{ items, addItem }}>
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
