import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Button } from '../components/Button';
import { StatusBar } from 'expo-status-bar';
import { useAppContext, Category, UploadedItem } from '../constants/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.l * 3) / 2;

export const HomeScreen = () => {
    const { items } = useAppContext();
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedOutfit, setSelectedOutfit] = useState<{ [key: string]: UploadedItem | null }>({
        'Upper Wear': null,
        'Bottom Wear': null,
        'Shoe': null,
    });

    const isOutfitReady = selectedOutfit['Upper Wear'] || selectedOutfit['Bottom Wear'] || selectedOutfit['Shoe'];

    const handleItemPress = (item: UploadedItem) => {
        if (!selectionMode) return;
        if (item.category === 'Accessory') return;

        setSelectedOutfit((prev) => ({
            ...prev,
            [item.category]: prev[item.category]?.id === item.id ? null : item,
        }));
    };

    const handleCreateOutfit = () => {
        const selectedList = Object.values(selectedOutfit).filter(Boolean) as UploadedItem[];
        navigation.navigate('OutfitPreview', { outfitItems: selectedList });
    };

    const renderProductCard = ({ item }: { item: UploadedItem }) => {
        const isSelected = selectedOutfit[item.category]?.id === item.id;
        const canSelect = selectionMode && item.category !== 'Accessory';

        return (
            <TouchableOpacity
                style={[styles.productCard, isSelected && styles.selectedProductCard]}
                activeOpacity={0.8}
                onPress={() => (selectionMode ? handleItemPress(item) : null)}
            >
                <Image source={{ uri: item.uri }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <View style={styles.chip}>
                        <Text style={Typography.chip}>{item.category.replace(' Wear', '')}</Text>
                    </View>
                    <Text style={styles.productName} numberOfLines={1}>{item.name.toUpperCase()}</Text>
                </View>

                {canSelect && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={Typography.header}>My Wardrobe</Text>
                {!selectionMode && (
                    <Button
                        title="Add an Image"
                        variant="black"
                        onPress={() => navigation.navigate('AddImage')}
                        style={styles.headerAddButton}
                        textStyle={{ fontWeight: '600' }}
                    />
                )}
            </View>

            {/* Grid Content */}
            {items.length > 0 ? (
                <FlatList
                    data={items}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="tshirt-crew-outline" size={80} color="#DDD" />
                    <Text style={[Typography.subheader, { marginTop: Spacing.m, color: '#999' }]}>No items yet</Text>
                </View>
            )}

            {/* Selection Mode Actions */}
            {selectionMode && (
                <View style={styles.selectionFooter}>
                    <View style={styles.selectionHint}>
                        <Text style={styles.selectionHintText}>Select 1 Top, 1 Bottom, 1 Shoe</Text>
                    </View>
                    <View style={styles.selectionButtons}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => {
                                setSelectionMode(false);
                                setSelectedOutfit({ 'Upper Wear': null, 'Bottom Wear': null, 'Shoe': null });
                            }}
                            style={styles.footerButton}
                        />
                        {isOutfitReady && (
                            <Button
                                title="Create Outfit"
                                onPress={handleCreateOutfit}
                                style={[styles.footerButton, { flex: 2 }]}
                            />
                        )}
                    </View>
                </View>
            )}

            {/* T-Shirt FAB for Outfit Creation */}
            {!selectionMode && items.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setSelectionMode(true)}
                    activeOpacity={0.9}
                >
                    <MaterialCommunityIcons name="tshirt-crew-outline" size={28} color="white" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerAddButton: {
        paddingLeft: Spacing.m,
    },
    gridContainer: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.l,
        paddingBottom: 120,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: Spacing.l,
    },
    productCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    selectedProductCard: {
        borderColor: Colors.accent,
        borderWidth: 2,
    },
    productImage: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F9F9F9',
    },
    productInfo: {
        padding: Spacing.s,
        paddingBottom: Spacing.m,
    },
    chip: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.s,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    productName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
        letterSpacing: 0.5,
    },
    checkbox: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1.5,
        borderColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.accent,
    },
    fab: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.l,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#05070A',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    selectionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: Spacing.l,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 20,
    },
    selectionHint: {
        marginBottom: Spacing.m,
        alignItems: 'center',
    },
    selectionHintText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.accent,
    },
    selectionButtons: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    footerButton: {
        flex: 1,
        height: 52,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
    },
});
