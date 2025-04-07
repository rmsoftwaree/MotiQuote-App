import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Share, PanResponder, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/theme';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Import quotes from discover page
import { quotesData } from './discover';

export default function TodayScreen() {
  const [greeting, setGreeting] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotesData[0]);
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const pan = new Animated.ValueXY();

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    return quotesData[randomIndex];
  };

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();
  };

  const showNewQuote = (direction: number) => {
    Animated.sequence([
      Animated.timing(pan, {
        toValue: { x: direction * width, y: 0 },
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: 0,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentQuote(getRandomQuote());
      checkIfFavorite();
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => {
      return Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 10;
    },
    onPanResponderGrant: () => {
      pan.setOffset({ x: pan.x._value, y: 0 });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      pan.flattenOffset();
      const threshold = width * 0.3; // Verlaagde threshold voor makkelijker swipen
      
      if (Math.abs(gesture.dx) > threshold) {
        const direction = gesture.dx > 0 ? 1 : -1;
        showNewQuote(direction);
      } else {
        resetPosition();
      }
    },
    onPanResponderTerminate: () => {
      resetPosition();
    }
  });
  
  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    // Set initial quote
    setCurrentQuote(getRandomQuote());
    
    // Check if today's quote is in favorites
    checkIfFavorite();
  }, []);
  
  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.some((fav: any) => fav.id === currentQuote.id));
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };
  
  const toggleFavorite = async () => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        // Remove from favorites
        favoritesArray = favoritesArray.filter((fav: any) => fav.id !== currentQuote.id);
      } else {
        // Add to favorites
        favoritesArray.push(currentQuote);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const shareQuote = async () => {
    try {
      // Provide haptic feedback if not on web
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const shareMessage = `"${currentQuote.text}" - ${currentQuote.author}\n\nShared from MotiQuote`;
      
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

  const animatedStyles = {
    transform: [
      { translateX: pan.x },
      {
        rotate: pan.x.interpolate({
          inputRange: [-width, 0, width],
          outputRange: ['-10deg', '0deg', '10deg'],
          extrapolate: 'clamp',
        })
      }
    ]
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.background }]} 
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={true}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: currentTheme.text }]}>{greeting}</Text>
        <Text style={[styles.date, { color: currentTheme.secondaryText }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>
      
      <Animated.View 
        style={[styles.quoteCard, animatedStyles, { 
          shadowColor: isDarkMode ? '#000000' : '#1e293b',
          backgroundColor: currentTheme.cardBackground 
        }]}
        {...panResponder.panHandlers}
      >
        <Image 
          source={{ uri: currentQuote.image }} 
          style={styles.quoteImage} 
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.quoteContent}>
          <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {currentQuote.author}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} 
              onPress={toggleFavorite}
            >
              <Heart 
                size={24} 
                color={isFavorite ? currentTheme.primary : '#ffffff'} 
                fill={isFavorite ? currentTheme.primary : 'transparent'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={shareQuote}
            >
              <Share2 size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>How to use MotiQuote</Text>
        <View style={[styles.infoCard, { 
          backgroundColor: currentTheme.cardBackground,
          shadowColor: isDarkMode ? '#000000' : '#1e293b'
        }]}>
          <Text style={[styles.infoText, { color: currentTheme.text }]}>
            • Swipe left or right for a new quote{'\n'}
            • Save your favorites for later reflection{'\n'}
            • Discover more quotes in the Discover tab{'\n'}
            • Share quotes with friends and family{'\n'}
            • Enable notifications for daily reminders
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 24,
    overflow: 'hidden',
    height: width * 0.9,
    position: 'relative',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
    height: '70%',
    borderRadius: 24,
  },
  quoteContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  quoteText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    lineHeight: 30,
    color: '#ffffff',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quoteAuthor: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 28,
  },
});