import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UploadedItem } from '../constants/AppContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    OutfitPreview: { outfitItems: UploadedItem[] };
};

type OutfitPreviewRouteProp = RouteProp<RootStackParamList, 'OutfitPreview'>;

export const OutfitPreviewScreen = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const route = useRoute<OutfitPreviewRouteProp>();
    const { outfitItems } = route.params;

    // Sorting items: Top Wear -> Bottom Wear -> Shoe
    const order = ['Upper Wear', 'Bottom Wear', 'Shoe'];
    const sortedItems = [...outfitItems].sort((a, b) => {
        return order.indexOf(a.category) - order.indexOf(b.category);
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Daily Outfit</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.outfitStack}>
                    {sortedItems.map((item, index) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.uri }} style={styles.itemImage} resizeMode="contain" />
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.chip}>
                                    <Text style={Typography.chip}>{item.category.replace(' Wear', '')}</Text>
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                            </View>
                            {index < sortedItems.length - 1 && (
                                <View style={styles.connector} />
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.9}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
    },
    backButton: {
        padding: Spacing.s,
        marginLeft: -Spacing.s,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 1,
    },
    scrollContent: {
        padding: Spacing.l,
        alignItems: 'center',
        paddingBottom: Spacing.xxl,
    },
    outfitStack: {
        width: '100%',
        alignItems: 'center',
    },
    itemWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1.2,
        backgroundColor: '#F9F9F9',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '90%',
        height: '90%',
    },
    infoRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.m,
        gap: Spacing.s,
    },
    chip: {
        backgroundColor: Colors.secondary,
        paddingHorizontal: Spacing.m,
        paddingVertical: 4,
        borderRadius: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        flex: 1,
    },
    connector: {
        width: 2,
        height: 30,
        backgroundColor: '#F0F0F0',
        marginVertical: Spacing.m,
    },
    doneButton: {
        backgroundColor: '#000',
        width: '100%',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xxl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    doneButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
