import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UploadedItem } from '../constants/AppContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GeminiService, AIStylingResult } from '../services/GeminiService';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    OutfitPreview: { outfitItems: UploadedItem[] };
};

type OutfitPreviewRouteProp = RouteProp<RootStackParamList, 'OutfitPreview'>;

export const OutfitPreviewScreen = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const route = useRoute<OutfitPreviewRouteProp>();
    const { outfitItems } = route.params;
    const [aiResult, setAiResult] = useState<AIStylingResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [visualDescription, setVisualDescription] = useState<string | null>(null);
    const [isGeneratingVisualization, setIsGeneratingVisualization] = useState(true);

    useEffect(() => {
        const fetchAIContent = async () => {
            try {
                // Fetch AI analysis and visualization description in parallel
                const [analysisResult, visualResult] = await Promise.all([
                    GeminiService.analyzeOutfit(outfitItems),
                    GeminiService.generateOutfitVisualization(outfitItems)
                ]);
                setAiResult(analysisResult);
                setVisualDescription(visualResult);
            } catch (error) {
                console.error('AI Content Error:', error);
            } finally {
                setIsAnalyzing(false);
                setIsGeneratingVisualization(false);
            }
        };
        fetchAIContent();
    }, [outfitItems]);

    // Sorting items: Top Wear -> Bottom Wear -> Shoe
    const topWear = outfitItems.find(i => i.category === 'Upper Wear');
    const bottomWear = outfitItems.find(i => i.category === 'Bottom Wear');
    const shoes = outfitItems.find(i => i.category === 'Shoe');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Outfit</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* AI Visual Description - Compact */}
                {isGeneratingVisualization ? (
                    <View style={styles.visualizationLoadingContainer}>
                        <ActivityIndicator color={Colors.accent} size="small" />
                        <Text style={styles.visualizationLoadingText}>AI is envisioning...</Text>
                    </View>
                ) : visualDescription && (
                    <View style={styles.magazineDescriptionCard}>
                        <Text style={styles.magazineDescription}>{visualDescription}</Text>
                        <View style={styles.aiBylineContainer}>
                            <MaterialCommunityIcons name={"sparkles" as any} size={12} color={Colors.accent} />
                            <Text style={styles.aiByline}>AI</Text>
                        </View>
                    </View>
                )}

                {/* Premium Outfit Grid */}
                <View style={styles.outfitGrid}>
                    {topWear && (
                        <View style={styles.gridCard}>
                            <View style={styles.gridImageContainer}>
                                <Image source={{ uri: topWear.uri }} style={styles.gridImage} resizeMode="cover" />
                            </View>
                            <View style={styles.gridLabel}>
                                <Text style={styles.gridLabelText}>UPPER WEAR</Text>
                            </View>
                        </View>
                    )}

                    {bottomWear && (
                        <View style={styles.gridCard}>
                            <View style={styles.gridImageContainer}>
                                <Image source={{ uri: bottomWear.uri }} style={styles.gridImage} resizeMode="cover" />
                            </View>
                            <View style={styles.gridLabel}>
                                <Text style={styles.gridLabelText}>BOTTOM WEAR</Text>
                            </View>
                        </View>
                    )}

                    {shoes && (
                        <View style={styles.gridCard}>
                            <View style={styles.gridImageContainer}>
                                <Image source={{ uri: shoes.uri }} style={styles.gridImage} resizeMode="cover" />
                            </View>
                            <View style={styles.gridLabel}>
                                <Text style={styles.gridLabelText}>FOOTWEAR</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* AI Stylist Section */}
                <View style={styles.aiSection}>
                    {isAnalyzing ? (
                        <View style={styles.aiLoadingContainer}>
                            <ActivityIndicator color={Colors.accent} size="large" />
                            <Text style={styles.aiLoadingText}>AI Stylist is thinking...</Text>
                        </View>
                    ) : aiResult && (
                        <View style={styles.aiCard}>
                            <View style={styles.aiCardHeader}>
                                <MaterialCommunityIcons name={"sparkles" as any} size={20} color={Colors.accent} />
                                <Text style={styles.aiCardTitle}>{aiResult.title}</Text>
                            </View>
                            <Text style={styles.aiAnalysis}>{aiResult.analysis}</Text>
                            <View style={styles.occasionContainer}>
                                <Text style={styles.occasionLabel}>BEST FOR: </Text>
                                <Text style={styles.occasionValue}>{aiResult.occasion.toUpperCase()}</Text>
                            </View>
                        </View>
                    )}
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
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.m,
        paddingBottom: Spacing.l,
    },
    // Magazine-style AI Visualization
    visualizationLoadingContainer: {
        width: '100%',
        padding: Spacing.m,
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        marginBottom: Spacing.s,
    },
    visualizationLoadingText: {
        marginTop: Spacing.s,
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        textAlign: 'center',
    },
    magazineDescriptionCard: {
        width: '100%',
        padding: Spacing.m,
        paddingVertical: Spacing.s,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: Spacing.s,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    magazineDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#2A2A2A',
        fontWeight: '400',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    aiBylineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    aiByline: {
        fontSize: 10,
        color: Colors.accent,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Compact Outfit Grid
    outfitGrid: {
        width: '100%',
        gap: 6,
        marginBottom: Spacing.m,
    },
    gridCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    gridImageContainer: {
        width: '100%',
        height: 140,
        backgroundColor: '#F8F8F8',
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridLabel: {
        padding: 8,
        paddingHorizontal: Spacing.s,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    gridLabelText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#666',
        letterSpacing: 1.2,
    },
    aiSection: {
        width: '100%',
        marginBottom: Spacing.m,
    },
    aiLoadingContainer: {
        padding: Spacing.m,
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    aiLoadingText: {
        marginTop: Spacing.s,
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    aiCard: {
        backgroundColor: '#F5F0FF',
        borderRadius: 16,
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: '#EBDDFF',
    },
    aiCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    aiCardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#000',
        marginLeft: 6,
        flex: 1,
    },
    aiAnalysis: {
        fontSize: 13,
        lineHeight: 19,
        color: '#444',
        marginBottom: 8,
    },
    occasionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    occasionLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: Colors.accent,
        letterSpacing: 0.5,
    },
    occasionValue: {
        fontSize: 11,
        color: '#666',
        fontWeight: '700',
    },
    doneButton: {
        backgroundColor: '#000',
        width: '100%',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.m,
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
