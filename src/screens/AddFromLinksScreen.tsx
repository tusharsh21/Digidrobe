import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../components/Button';
import { useAppContext } from '../constants/AppContext';
import { Colors, Spacing } from '../constants/theme';
import { resolveImageUrlFromProductLink } from '../utils/linkImageResolver';
import { getHostnameFromHttpUrl } from '../utils/urlHelpers';

const toHostname = (rawUrl: string) => getHostnameFromHttpUrl(rawUrl);

const AddFromLinksScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { addItem } = useAppContext();

  const [upperLink, setUpperLink] = useState('');
  const [bottomLink, setBottomLink] = useState('');
  const [upperName, setUpperName] = useState('');
  const [bottomName, setBottomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isSubmitDisabled = useMemo(
    () => !upperLink.trim() || !bottomLink.trim() || isCreating,
    [upperLink, bottomLink, isCreating]
  );

  const handleCreateFromLinks = async () => {
    if (isSubmitDisabled) return;

    try {
      setIsCreating(true);

      const [upperImageUrl, bottomImageUrl] = await Promise.all([
        resolveImageUrlFromProductLink(upperLink),
        resolveImageUrlFromProductLink(bottomLink),
      ]);

      const upperHost = toHostname(upperLink);
      const bottomHost = toHostname(bottomLink);

      const upperItem = await addItem({
        uri: upperImageUrl,
        name: upperName.trim() || `Upper Wear${upperHost ? ` (${upperHost})` : ''}`,
        category: 'Upper Wear',
        sourcePageUrl: upperLink.trim(),
      });

      const bottomItem = await addItem({
        uri: bottomImageUrl,
        name: bottomName.trim() || `Bottom Wear${bottomHost ? ` (${bottomHost})` : ''}`,
        category: 'Bottom Wear',
        sourcePageUrl: bottomLink.trim(),
      });

      navigation.navigate('OutfitPreview', { outfitItems: [upperItem, bottomItem] });
    } catch (error: any) {
      const message = error?.message || 'Could not import outfit from the provided links.';
      Alert.alert('Import Failed', message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Outfit from Links</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upper Wear Link</Text>
            <TextInput
              style={styles.input}
              placeholder="Paste Myntra / Amazon / Flipkart product link"
              placeholderTextColor="#9CA3AF"
              value={upperLink}
              onChangeText={setUpperLink}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TextInput
              style={styles.input}
              placeholder="Optional name (e.g. Black Shirt)"
              placeholderTextColor="#9CA3AF"
              value={upperName}
              onChangeText={setUpperName}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bottom Wear Link</Text>
            <TextInput
              style={styles.input}
              placeholder="Paste Myntra / Amazon / Flipkart product link"
              placeholderTextColor="#9CA3AF"
              value={bottomLink}
              onChangeText={setBottomLink}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TextInput
              style={styles.input}
              placeholder="Optional name (e.g. Blue Jeans)"
              placeholderTextColor="#9CA3AF"
              value={bottomName}
              onChangeText={setBottomName}
            />
          </View>

          <Text style={styles.helperText}>
            Tip: Product page links work when the website exposes an image in OG/Twitter metadata.
            Direct image links are supported too.
          </Text>

          <Button
            title={isCreating ? 'Importing and Creating...' : 'Create Outfit'}
            onPress={handleCreateFromLinks}
            disabled={isSubmitDisabled}
            loading={isCreating}
            style={styles.primaryAction}
          />

          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.secondaryAction}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export { AddFromLinksScreen };
export default AddFromLinksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    padding: Spacing.l,
    gap: Spacing.m,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: Spacing.s,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: Spacing.m,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginHorizontal: 2,
  },
  primaryAction: {
    marginTop: Spacing.s,
  },
  secondaryAction: {
    marginTop: Spacing.s,
    marginBottom: Spacing.l,
  },
});
