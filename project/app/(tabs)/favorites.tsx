import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Share, Platform } from 'react-native';
import { Heart, Trash2, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );
  
  const removeFavorite = async (id: string) => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const updatedFavorites = favorites.filter(quote => quote.id !== id);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };
  
  const confirmRemove = (id: string) => {
    if (Platform.OS === 'web') {
      // On web, just remove without confirmation
      removeFavorite(id);
    } else {
      Alert.alert(
        'Remove from Favorites',
        'Are you sure you want to remove this quote from your favorites?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFavorite(id) }
        ]
      );
    }
  };
  
  const clearAllFavorites = async () => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      await AsyncStorage.removeItem('favorites');
      setFavorites([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };
  
  const confirmClearAll = () => {
    if (favorites.length === 0) return;
    
    if (Platform.OS === 'web') {
      // On web, just clear without confirmation
      clearAllFavorites();
    } else {
      Alert.alert(
        'Clear All Favorites',
        'Are you sure you want to remove all quotes from your favorites? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: clearAllFavorites }
        ]
      );
    }
  };
  
  const shareQuote = async (quote: any) => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const shareMessage = `"${quote.text}" - ${quote.author}\n\nShared from MotiQuote`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Daily Motivation',
            text: shareMessage,
          });
        } else {
          alert('Sharing is not supported in this browser');
        }
      } else {
        await Share.share({
          message: shareMessage,
        });
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  const renderQuoteItem = ({ item }: { item: any }) => (
    <View style={styles.quoteCard}>
      <Image source={{ uri: item.image }} style={styles.quoteImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      <View style={styles.quoteContent}>
        <Text style={styles.quoteText}>"{item.text}"</Text>
        <Text style={styles.quoteAuthor}>— {item.author}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => confirmRemove(item.id)}
          >
            <Trash2 size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => shareQuote(item)}
          >
            <Share2 size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Your Favorites</Text>
        {favorites.length > 0 && (
          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: currentTheme.cardBackground }]}
            onPress={confirmClearAll}
          >
            <Text style={[styles.clearButtonText, { color: currentTheme.secondaryText }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.quotesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={60} color={currentTheme.border} />
            <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>No favorites yet</Text>
            <Text style={[styles.emptyText, { color: currentTheme.secondaryText }]}>
              Quotes you favorite will appear here for easy access.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  quotesList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  quoteCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quoteImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 16,
  },
  quoteContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  quoteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quoteAuthor: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});