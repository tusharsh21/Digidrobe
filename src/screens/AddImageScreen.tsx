import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors, Spacing } from '../constants/theme';
import { Button } from '../components/Button';
import { useAppContext, Category } from '../constants/AppContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { removeBackground } from 'react-native-background-remover';

const { height } = Dimensions.get('window');
const CATEGORIES: Category[] = ['Upper Wear', 'Bottom Wear', 'Shoe', 'Accessory'];

export const AddImageScreen = () => {
    const [images, setImages] = useState<string[]>([]);
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [removeBackgroundEnabled, setRemoveBackgroundEnabled] = useState(false);
    const { addItem } = useAppContext();
    const navigation = useNavigation();

    const pickImage = async () => {
        if (images.length >= 4) {
            Alert.alert('Limit Reached', 'You can upload up to 4 images.');
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            // Android 11 DocumentsUI in some emulators/devices is unstable with multi-select.
            // Keep total cap at 4, but pick one item per open on Android for reliability.
            selectionLimit: Platform.OS === 'android' ? 1 : 4 - images.length,
            quality: 0.7,
            maxWidth: 1280,
            maxHeight: 1280,
        });

        if (result.errorCode) {
            Alert.alert('Image Picker Error', result.errorMessage || 'Could not open image picker.');
            return;
        }

        if (result.didCancel) {
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const candidateUris = result.assets
                .map((asset) => asset.uri || '')
                .filter((uri) => !!uri);

            setImages((prev) => [...prev, ...candidateUris].slice(0, 4));
        }
    };

    const handleSave = async () => {
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

        try {
            setIsSaving(true);
            let finalUri = images[0];

            if (removeBackgroundEnabled) {
                try {
                    finalUri = await removeBackground(images[0]);
                } catch (bgError: any) {
                    const msg = bgError?.message || String(bgError);
                    Alert.alert(
                        'Background Removal Failed',
                        `Could not remove background. The original image will be saved.\n\nDetails: ${msg}`
                    );
                }
            }

            await addItem({
                uri: finalUri,
                name: name.trim(),
                category: selectedCategory,
            });
            navigation.goBack();
        } catch (error: any) {
            const msg = error?.message || String(error);
            Alert.alert('Error', `Failed to save items: ${msg}`);
        } finally {
            setIsSaving(false);
        }
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
                                    <View key={index} style={styles.thumbnailContainer}>
                                        <Image source={{ uri }} style={styles.thumbnail} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => setImages(images.filter((_, i) => i !== index))}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#FF4B4B" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {images.length < 4 && (
                                    <View style={styles.addMoreThumbnail}>
                                        <Ionicons name="add" size={32} color="#999" />
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>

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

                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.toggleRow, removeBackgroundEnabled && styles.toggleRowActive]}
                            onPress={() => setRemoveBackgroundEnabled((prev) => !prev)}
                            activeOpacity={0.8}
                        >
                            <View>
                                <Text style={styles.toggleTitle}>Remove Background</Text>
                                <Text style={styles.toggleSubtitle}>Uses on-device ML processing</Text>
                            </View>
                            <View style={[styles.togglePill, removeBackgroundEnabled && styles.togglePillActive]}>
                                {removeBackgroundEnabled && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtons}>
                        <Button
                            title={isSaving ? 'Saving...' : 'Save Items'}
                            onPress={handleSave}
                            disabled={images.length === 0 || !name || !selectedCategory || isSaving}
                            style={[styles.saveButton, (images.length === 0 || !name || !selectedCategory || isSaving) && styles.disabledButton]}
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
        backgroundColor: 'rgba(0,0,0,0.4)',
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
    thumbnailContainer: {
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FFF',
        borderRadius: 10,
        zIndex: 1,
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
    toggleRow: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FAFAFA',
    },
    toggleRowActive: {
        borderColor: Colors.accent,
        backgroundColor: '#F3F0FF',
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    toggleSubtitle: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    togglePill: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#BDBDBD',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    togglePillActive: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    actionButtons: {
        marginTop: Spacing.xxl,
        gap: Spacing.m,
    },
    saveButton: {
        height: 52,
    },
    disabledButton: {
        opacity: 0.5,
    },
    cancelButton: {
        height: 52,
    },
});
