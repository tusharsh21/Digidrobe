import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Button } from '../components/Button';
import { useAppContext, Category } from '../constants/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const CATEGORIES: Category[] = ['Upper Wear', 'Bottom Wear', 'Shoe', 'Accessory'];

export const AddImageScreen = () => {
    const [images, setImages] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const { addItem } = useAppContext();
    const navigation = useNavigation();

    const pickImage = async () => {
        if (images.length >= 4) {
            Alert.alert('Limit Reached', 'You can upload up to 4 images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 4 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages([...images, ...newUris].slice(0, 4));
        }
    };

    const handleSave = () => {
        if (images.length === 0) {
            Alert.alert('Error', 'Please add at least one image.');
            return;
        }
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name for the item.');
            return;
        }
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category.');
            return;
        }

        addItem({
            uri: images[0],
            name: name,
            category: selectedCategory,
        });

        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.modalContent}>
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <Text style={styles.title}>Add Wardrobe Items</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Dash Area Upload */}
                    <TouchableOpacity
                        style={[styles.uploadArea, images.length > 0 && styles.uploadAreaActive]}
                        onPress={pickImage}
                    >
                        {images.length === 0 ? (
                            <>
                                <Text style={styles.uploadText}>Click to upload images (0/4)</Text>
                                <Text style={styles.uploadSubtext}>You can upload up to 4 images (minimum 1)</Text>
                            </>
                        ) : (
                            <View style={styles.imageGrid}>
                                {images.map((uri, index) => (
                                    <Image key={index} source={{ uri }} style={styles.thumbnail} />
                                ))}
                                {images.length < 4 && (
                                    <View style={styles.addMoreThumbnail}>
                                        <Ionicons name="add" size={32} color="#999" />
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Name Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Item Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Nike Dunk Low"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#AAA"
                        />
                    </View>

                    {/* Category Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Select Category</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && styles.selectedChip
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === cat && styles.selectedCategoryText
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <Button
                            title="Save Items"
                            onPress={handleSave}
                            disabled={images.length === 0 || !name || !selectedCategory}
                            style={[styles.saveButton, (images.length === 0 || !name || !selectedCategory) && styles.disabledButton]}
                        />
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={styles.cancelButton}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // Overlay look
        justifyContent: 'center',
        padding: Spacing.m,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        maxHeight: height * 0.85,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    scrollContent: {
        padding: Spacing.l,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F9F9',
        minHeight: 180,
    },
    uploadAreaActive: {
        borderStyle: 'solid',
        borderColor: '#EEE',
        padding: Spacing.m,
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#AAA',
        marginTop: 8,
        textAlign: 'center',
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
        justifyContent: 'center',
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    addMoreThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#EEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        marginTop: Spacing.xl,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: Spacing.s,
        color: '#333',
    },
    input: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#EEE',
        paddingVertical: Spacing.s,
        fontSize: 16,
        color: Colors.text,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    categoryChip: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectedChip: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.accent,
    },
    categoryText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    selectedCategoryText: {
        color: Colors.accent,
    },
    actionButtons: {
        marginTop: Spacing.xxl,
        gap: Spacing.m,
    },
    saveButton: {
        height: 52,
        backgroundColor: '#8E8E93', // Matches the greyed button in screenshot 3
    },
    disabledButton: {
        backgroundColor: '#D1D1D6',
    },
    cancelButton: {
        height: 52,
    },
});
