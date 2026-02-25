import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, Dimensions, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Button } from '../components/Button';
import { useAppContext, Category, UploadedItem } from '../constants/AppContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Spacing.l * 3) / 2;

const CATEGORIES_FILTER: (Category | 'All')[] = ['All', 'Upper Wear', 'Bottom Wear', 'Shoe', 'Accessory'];

export const HomeScreen = () => {
    const { items, isLoading } = useAppContext();
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [selectedFilter, setSelectedFilter] = useState<Category | 'All'>('All');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedOutfit, setSelectedOutfit] = useState<{ [key: string]: UploadedItem | null }>({
        'Upper Wear': null,
        'Bottom Wear': null,
    });

    const isOutfitReady = !!selectedOutfit['Upper Wear'] && !!selectedOutfit['Bottom Wear'];

    const filteredItems = useMemo(() => {
        if (selectedFilter === 'All') return items;
        return items.filter(item => item.category === selectedFilter);
    }, [items, selectedFilter]);

    const handleItemPress = (item: UploadedItem) => {
        if (!selectionMode) return;
        if (item.category !== 'Upper Wear' && item.category !== 'Bottom Wear') return;

        setSelectedOutfit((prev) => ({
            ...prev,
            [item.category]: prev[item.category]?.id === item.id ? null : item,
        }));
    };

    const handleCreateOutfit = () => {
        const selectedList = [selectedOutfit['Upper Wear'], selectedOutfit['Bottom Wear']].filter(Boolean) as UploadedItem[];
        if (selectedList.length !== 2) return;
        navigation.navigate('OutfitPreview', { outfitItems: selectedList });
    };

    const renderProductCard = ({ item }: { item: UploadedItem }) => {
        const isSelected = selectedOutfit[item.category]?.id === item.id;
        const canSelect = selectionMode && (item.category === 'Upper Wear' || item.category === 'Bottom Wear');

        return (
            <TouchableOpacity
                style={[styles.productCard, isSelected && styles.selectedProductCard]}
                activeOpacity={0.8}
                onPress={() => (selectionMode ? handleItemPress(item) : null)}
            >
                <View style={styles.productImageWrap}>
                    <Image source={{ uri: item.uri }} style={styles.productImage} resizeMode="contain" />
                </View>
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
            <RNStatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={Typography.header}>My Wardrobe</Text>
                {!selectionMode && (
                    <View style={styles.headerActions}>
                        <Button
                            title="Add Image"
                            variant="black"
                            onPress={() => navigation.navigate('AddImage')}
                            style={styles.headerAddButton}
                            textStyle={{ fontWeight: '600' }}
                        />
                        <Button
                            title="Add Links"
                            variant="outline"
                            onPress={() => navigation.navigate('AddFromLinks')}
                            style={styles.headerLinkButton}
                            textStyle={{ fontWeight: '700' }}
                        />
                    </View>
                )}
            </View>

            {/* Category Filter */}
            {!selectionMode && (
                <View style={styles.filterBar}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {CATEGORIES_FILTER.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.filterChip,
                                    selectedFilter === cat && styles.selectedFilterChip
                                ]}
                                onPress={() => setSelectedFilter(cat)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedFilter === cat && styles.selectedFilterText
                                ]}>
                                    {cat.replace(' Wear', '')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Grid Content */}
            {isLoading ? (
                <View style={styles.emptyContainer}>
                    <Text style={[Typography.body, { color: '#999' }]}>Loading your wardrobe...</Text>
                </View>
            ) : filteredItems.length > 0 ? (
                <FlatList
                    data={filteredItems}
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
                    <Text style={[Typography.subheader, { marginTop: Spacing.m, color: '#999' }]}>
                        {selectedFilter === 'All' ? 'No items yet' : `No ${selectedFilter} items`}
                    </Text>
                </View>
            )}

            {/* Selection Mode Actions */}
            {selectionMode && (
                <View style={styles.selectionFooter}>
                    <View style={styles.selectionHint}>
                        <Text style={styles.selectionHintText}>Select 1 Upper Wear and 1 Bottom Wear</Text>
                    </View>
                    <View style={styles.selectionButtons}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => {
                                setSelectionMode(false);
                                setSelectedOutfit({ 'Upper Wear': null, 'Bottom Wear': null });
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
                    onPress={() => {
                        setSelectedFilter('All');
                        setSelectionMode(true);
                    }}
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
        paddingHorizontal: Spacing.m,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    headerLinkButton: {
        height: 40,
        borderRadius: 20,
        paddingHorizontal: Spacing.m,
    },
    filterBar: {
        paddingVertical: Spacing.m,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterScroll: {
        paddingHorizontal: Spacing.l,
        gap: Spacing.s,
    },
    filterChip: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectedFilterChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedFilterText: {
        color: '#FFF',
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
    productImageWrap: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F9F9F9',
        padding: Spacing.s,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
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
