import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Colors, Spacing } from '../constants/theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UploadedItem, useAppContext } from '../constants/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  OutfitPreview: { outfitItems: UploadedItem[] };
};

type OutfitPreviewRouteProp = RouteProp<RootStackParamList, 'OutfitPreview'>;

export const OutfitPreviewScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<OutfitPreviewRouteProp>();
  const { items } = useAppContext();
  const { outfitItems } = route.params;

  const upperItems = useMemo(
    () => items.filter((item) => item.category === 'Upper Wear'),
    [items]
  );

  const bottomItems = useMemo(
    () => items.filter((item) => item.category === 'Bottom Wear'),
    [items]
  );

  const selectedUpperId = outfitItems.find((item) => item.category === 'Upper Wear')?.id;
  const selectedBottomId = outfitItems.find((item) => item.category === 'Bottom Wear')?.id;

  const [upperIndex, setUpperIndex] = useState(() => {
    if (upperItems.length === 0) return 0;
    const found = upperItems.findIndex((item) => item.id === selectedUpperId);
    return found >= 0 ? found : 0;
  });

  const [bottomIndex, setBottomIndex] = useState(() => {
    if (bottomItems.length === 0) return 0;
    const found = bottomItems.findIndex((item) => item.id === selectedBottomId);
    return found >= 0 ? found : 0;
  });

  useEffect(() => {
    if (upperItems.length === 0) return setUpperIndex(0);
    const selectedIndex = selectedUpperId
      ? upperItems.findIndex((item) => item.id === selectedUpperId)
      : -1;
    if (selectedIndex >= 0) return setUpperIndex(selectedIndex);
    setUpperIndex((prev) => Math.min(prev, upperItems.length - 1));
  }, [upperItems, selectedUpperId]);

  useEffect(() => {
    if (bottomItems.length === 0) return setBottomIndex(0);
    const selectedIndex = selectedBottomId
      ? bottomItems.findIndex((item) => item.id === selectedBottomId)
      : -1;
    if (selectedIndex >= 0) return setBottomIndex(selectedIndex);
    setBottomIndex((prev) => Math.min(prev, bottomItems.length - 1));
  }, [bottomItems, selectedBottomId]);

  const currentUpper = upperItems[upperIndex] || null;
  const currentBottom = bottomItems[bottomIndex] || null;

  const cycleIndex = (current: number, total: number, direction: -1 | 1) => {
    if (total <= 1) return current;
    return (current + direction + total) % total;
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit Builder</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* ✅ Two images, no text, no gaps */}
      <View style={styles.body}>
        {/* Upper image (top half) */}
        <View style={styles.imageHalf}>
          {currentUpper ? (
            <Image source={{ uri: currentUpper.uri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View />
          )}

          <TouchableOpacity
            style={[styles.arrow, styles.leftArrow, upperItems.length <= 1 && styles.arrowDisabled]}
            onPress={() => setUpperIndex((idx) => cycleIndex(idx, upperItems.length, -1))}
            disabled={upperItems.length <= 1}
            activeOpacity={0.9}
          >
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrow, styles.rightArrow, upperItems.length <= 1 && styles.arrowDisabled]}
            onPress={() => setUpperIndex((idx) => cycleIndex(idx, upperItems.length, 1))}
            disabled={upperItems.length <= 1}
            activeOpacity={0.9}
          >
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Bottom image (bottom half) */}
        <View style={styles.imageHalf}>
          {currentBottom ? (
            <Image source={{ uri: currentBottom.uri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View />
          )}

          <TouchableOpacity
            style={[styles.arrow, styles.leftArrow, bottomItems.length <= 1 && styles.arrowDisabled]}
            onPress={() => setBottomIndex((idx) => cycleIndex(idx, bottomItems.length, -1))}
            disabled={bottomItems.length <= 1}
            activeOpacity={0.9}
          >
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrow, styles.rightArrow, bottomItems.length <= 1 && styles.arrowDisabled]}
            onPress={() => setBottomIndex((idx) => cycleIndex(idx, bottomItems.length, 1))}
            disabled={bottomItems.length <= 1}
            activeOpacity={0.9}
          >
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.9}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 6, marginLeft: -6 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#000' },

  body: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  // ✅ No gap: two halves stacked with flex
  imageHalf: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  leftArrow: { left: 10 },
  rightArrow: { right: 10 },
  arrowDisabled: { opacity: 0.35 },

  doneButton: {
    backgroundColor: '#000',
    height: 52,
    marginHorizontal: Spacing.m,
    marginVertical: Spacing.m,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },
});
