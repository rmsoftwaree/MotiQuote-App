import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Search, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/theme';

// Sample quotes data
export const quotesData = [
  {
    id: '2',
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "Life",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80"
  },
  {
    id: '3',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "Dreams",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: '4',
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "Perseverance",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: '5',
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Belief",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: '6',
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "Doubt",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: '7',
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "Action",
    image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
  },
  {
    id: '8',
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "Perseverance",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
  },
  {
    id: '9',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Success",
    image: "https://images.unsplash.com/photo-1682686581580-d99b0230064e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '10',
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "Life",
    image: "https://images.unsplash.com/photo-1682686579976-879b74d19a29?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '11',
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Opportunity",
    image: "https://images.unsplash.com/photo-1682686580024-c1b2b87a4cc1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '12',
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Work",
    image: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '13',
    text: "Change your thoughts and you change your world.",
    author: "Norman Vincent Peale",
    category: "Mindset",
    image: "https://images.unsplash.com/photo-1682687218147-9806132dc697?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '14',
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "Fear",
    image: "https://images.unsplash.com/photo-1682687220989-cbbd30c433ee?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '15',
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    category: "Future",
    image: "https://images.unsplash.com/photo-1682687220067-dced84a2941b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '16',
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar",
    category: "Goals",
    image: "https://images.unsplash.com/photo-1682687221248-3116ba6ab483?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '17',
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
    category: "Journey",
    image: "https://images.unsplash.com/photo-1682687221080-5cb261c645cb?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '18',
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "Present",
    image: "https://images.unsplash.com/photo-1682687220742-02c40c5f3e4b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '19',
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
    category: "Action",
    image: "https://images.unsplash.com/photo-1682687220509-61b8a906ca19?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '20',
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: "Work",
    image: "https://images.unsplash.com/photo-1682687220923-c58b9a4992c4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '21',
    text: "Dream big and dare to fail.",
    author: "Norman Vaughan",
    category: "Dreams",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '22',
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
    category: "Excellence",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '23',
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "Attitude",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '24',
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "Self-Development",
    image: "https://images.unsplash.com/photo-1682687220305-ce8a9ab237b1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '25',
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
    category: "Success",
    image: "https://images.unsplash.com/photo-1682687220566-5356d1d66e86?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '26',
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    category: "Action",
    image: "https://images.unsplash.com/photo-1682687220208-22d7a2543e88?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '27',
    text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
    author: "Christian D. Larson",
    category: "Self-Belief",
    image: "https://images.unsplash.com/photo-1682687220777-2c60708d6889?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '28',
    text: "Your time is now. Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    category: "Motivation",
    image: "https://images.unsplash.com/photo-1682687220015-186f63b8850a?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '29',
    text: "The only way to achieve the impossible is to believe it is possible.",
    author: "Charles Kingsleigh",
    category: "Belief",
    image: "https://images.unsplash.com/photo-1682687220640-9d3b11ca30e5?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '30',
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Albert Schweitzer",
    category: "Success",
    image: "https://images.unsplash.com/photo-1682687220247-9f786e34d472?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '31',
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "Future",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '32',
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    category: "Life",
    image: "https://images.unsplash.com/photo-1682687220923-c58b9a4992c4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '33',
    text: "The best preparation for tomorrow is doing your best today.",
    author: "H. Jackson Brown Jr.",
    category: "Preparation",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '34',
    text: "Every moment is a fresh beginning.",
    author: "T.S. Eliot",
    category: "New Beginnings",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '35',
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Action",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '36',
    text: "Fear is not a factor when the reward is worth it.",
    author: "Curtis '50 Cent' Jackson",
    category: "Hustle",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '37',
    text: "Every negative is a potential positive.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '38',
    text: "Sleep is for people who are broke.",
    author: "Curtis '50 Cent' Jackson",
    category: "Hustle",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '39',
    text: "I'm not afraid of dying, I'm afraid of not trying.",
    author: "Curtis '50 Cent' Jackson",
    category: "Motivation",
    image: "https://images.unsplash.com/photo-1682687220305-ce8a9ab237b1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '40',
    text: "Your mindset is the key to unlock your potential.",
    author: "Curtis '50 Cent' Jackson",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1682687220566-5356d1d66e86?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '41',
    text: "Success is not about being perfect, it's about being strategic.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '42',
    text: "The best way to adapt to change is to be the one creating it.",
    author: "Curtis '50 Cent' Jackson",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '43',
    text: "Your competition isn't other people, it's your own procrastination.",
    author: "Curtis '50 Cent' Jackson",
    category: "Hustle",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '44',
    text: "Knowledge is power, but execution is supreme.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220305-ce8a9ab237b1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '45',
    text: "Turn your obstacles into opportunities and your problems into possibilities.",
    author: "Curtis '50 Cent' Jackson",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1682687220566-5356d1d66e86?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '46',
    text: "Success is creating a system that works for you, not against you.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '47',
    text: "The difference between a boss and a worker is their mindset.",
    author: "Curtis '50 Cent' Jackson",
    category: "Mindset",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '48',
    text: "Don't wait for the perfect moment, create it.",
    author: "Curtis '50 Cent' Jackson",
    category: "Action",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '49',
    text: "Your network is your net worth.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220305-ce8a9ab237b1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '50',
    text: "The biggest risk is not taking any risk at all.",
    author: "Curtis '50 Cent' Jackson",
    category: "Hustle",
    image: "https://images.unsplash.com/photo-1682687220566-5356d1d66e86?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '51',
    text: "Success leaves clues, study the patterns.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '52',
    text: "Comfort is the enemy of progress.",
    author: "Curtis '50 Cent' Jackson",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1682687220199-d0124f48f95b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '53',
    text: "Your reputation is your currency, invest in it wisely.",
    author: "Curtis '50 Cent' Jackson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1682687220945-922198770e60?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '54',
    text: "The best investment you can make is in yourself.",
    author: "Curtis '50 Cent' Jackson",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1682687220305-ce8a9ab237b1?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: '55',
    text: "Success is not about where you start, it's about how you finish.",
    author: "Curtis '50 Cent' Jackson",
    category: "Motivation",
    image: "https://images.unsplash.com/photo-1682687220566-5356d1d66e86?q=80&w=2070&auto=format&fit=crop"
  }
];

// Categories
const categories = ["All", "Life", "Dreams", "Perseverance", "Belief", "Doubt", "Action", "Success", "Opportunity", "Work", "Mindset", "Fear", "Future", "Goals", "Journey", "Present", "Excellence", "Attitude", "Self-Development", "Self-Belief", "Motivation", "New Beginnings", "Preparation", "Hustle", "Strategy", "Growth"];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredQuotes, setFilteredQuotes] = useState(quotesData);
  const [favorites, setFavorites] = useState<any[]>([]);
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  
  useEffect(() => {
    loadFavorites();
  }, []);
  
  useEffect(() => {
    filterQuotes();
  }, [searchQuery, selectedCategory]);
  
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        setFavorites(favoritesArray);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };
  
  const filterQuotes = () => {
    let filtered = quotesData;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(quote => quote.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        quote => 
          quote.text.toLowerCase().includes(query) || 
          quote.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredQuotes(filtered);
  };
  
  const toggleFavorite = async (quote: any) => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      if (favorites.some(fav => fav.id === quote.id)) {
        // Remove from favorites
        favoritesArray = favoritesArray.filter((fav: any) => fav.id !== quote.id);
        setFavorites(favorites.filter(fav => fav.id !== quote.id));
      } else {
        // Add to favorites
        favoritesArray.push(quote);
        setFavorites([...favorites, quote]);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Discover Quotes</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <Search size={20} color={currentTheme.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.text }]}
            placeholder="Search quotes or authors..."
            placeholderTextColor={currentTheme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={currentTheme.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          style={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                { backgroundColor: currentTheme.cardBackground },
                selectedCategory === item && [styles.categoryButtonActive, { backgroundColor: currentTheme.primary }]
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  { color: currentTheme.secondaryText },
                  selectedCategory === item && [styles.categoryButtonTextActive, { color: '#ffffff' }]
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.quoteItem}
            onPress={() => toggleFavorite(item)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image }} style={styles.quoteImage} />
            <View style={[styles.quoteOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <View style={[styles.categoryBadge, { backgroundColor: currentTheme.primary }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <Text style={styles.quoteText}>"{item.text}"</Text>
              <Text style={styles.authorText}>— {item.author}</Text>
              <TouchableOpacity 
                style={[
                  styles.favoriteButton,
                  { backgroundColor: currentTheme.cardBackground },
                  favorites.some(fav => fav.id === item.id) && [styles.favoriteButtonActive, { backgroundColor: currentTheme.primary }]
                ]}
                onPress={() => toggleFavorite(item)}
              >
                <Text style={[
                  styles.favoriteButtonText,
                  { color: currentTheme.text },
                  favorites.some(fav => fav.id === item.id) && [styles.favoriteButtonTextActive, { color: '#ffffff' }]
                ]}>
                  {favorites.some(fav => fav.id === item.id) ? 'Favorited' : 'Add to Favorites'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.quotesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentTheme.secondaryText }]}>No quotes found</Text>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  quotesList: {
    padding: 20,
  },
  quoteItem: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 300,
  },
  quoteImage: {
    width: '100%',
    height: '100%',
  },
  quoteOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  quoteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  authorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 16,
  },
  favoriteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  favoriteButtonActive: {
    backgroundColor: '#6366f1',
  },
  favoriteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  favoriteButtonTextActive: {
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
});