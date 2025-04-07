import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Linking, Alert, Share as RNShare, Platform, Modal, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Bell, Moon, Info, ExternalLink, Mail, Star, Share, Clock, ChevronUp, ChevronDown, Check, X as XIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import { theme } from '../theme/theme';
import { quotesData } from './discover';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(0);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const appVersion = '1.0.0';
  
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  
  useEffect(() => {
    checkNotificationSettings();
  }, []);
  
  const checkNotificationSettings = async () => {
    if (Platform.OS === 'web') {
      return;
    }
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
      
      // Load saved notification time
      const savedTime = await AsyncStorage.getItem('notificationTime');
      if (savedTime) {
        setNotificationTime(new Date(savedTime));
      }
    } catch (error) {
      console.error('Error checking notification settings:', error);
    }
  };
  
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotesData.length);
    return quotesData[randomIndex];
  };
  
  const scheduleNotification = async (time: Date) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Existing notifications cancelled');
      
      // Get a random quote for the notification
      const quote = getRandomQuote();
      
      // Calculate next notification time
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(time.getHours());
      scheduledTime.setMinutes(time.getMinutes());
      scheduledTime.setSeconds(0);
      
      // If time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      console.log('Scheduling notification for:', scheduledTime.toLocaleString());

      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your Daily Motivation",
          body: `"${quote.text}" - ${quote.author}`,
          data: { quoteId: quote.id },
          sound: 'default',
        },
        trigger: {
          hour: scheduledTime.getHours(),
          minute: scheduledTime.getMinutes(),
          second: 0,
          repeats: true,
        },
      });

      console.log('Daily notification scheduled');

      // Send an immediate test notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification to confirm everything is working.",
          sound: 'default',
        },
        trigger: {
          seconds: 5,
        },
      });
      
      console.log('Test notification scheduled');
      
      await AsyncStorage.setItem('notificationTime', time.toISOString());
      
      // Show confirmation with more details
      Alert.alert(
        'Notifications Scheduled',
        `You will receive daily motivational quotes at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\n\nA test notification will arrive in 5 seconds to confirm everything is working.`,
        [{ text: 'OK' }]
      );

      // Log scheduled notifications for debugging
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('All scheduled notifications:', JSON.stringify(scheduledNotifications, null, 2));
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification. Please try again.');
    }
  };
  
  const toggleNotifications = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Notifications are not available in web version.');
      return;
    }
    
    try {
      if (notificationsEnabled) {
        // Turn off notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        setNotificationsEnabled(false);
        Alert.alert('Notifications Disabled', 'Daily quote notifications have been turned off.');
      } else {
        // Request permission and turn on notifications
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification permission status:', status);
        
        if (status === 'granted') {
          await scheduleNotification(notificationTime);
          setNotificationsEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive daily quotes.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to toggle notifications. Please try again.');
    }
  };
  
  const formatTimeNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  const handleTimeConfirm = async () => {
    const newTime = new Date();
    newTime.setHours(tempHour);
    newTime.setMinutes(tempMinute);
    setNotificationTime(newTime);
    setShowTimeModal(false);
    
    if (notificationsEnabled) {
      await scheduleNotification(newTime);
    }
  };

  const incrementHour = () => {
    setTempHour((prev) => (prev + 1) % 24);
  };

  const decrementHour = () => {
    setTempHour((prev) => (prev - 1 + 24) % 24);
  };

  const incrementMinute = () => {
    setTempMinute((prev) => (prev + 1) % 60);
  };

  const decrementMinute = () => {
    setTempMinute((prev) => (prev - 1 + 60) % 60);
  };

  const openTimePicker = () => {
    setTempHour(notificationTime.getHours());
    setTempMinute(notificationTime.getMinutes());
    setShowTimeModal(true);
  };
  
  const openWebsite = () => {
    Linking.openURL('https://example.com/motiquote');
  };
  
  const contactSupport = () => {
    Linking.openURL('mailto:support@motiquote.app?subject=MotiQuote Support');
  };
  
  const rateApp = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/id123456789');
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.motiquote');
    } else {
      // Web fallback
      Alert.alert('Rate Us', 'Thank you for wanting to rate our app!');
    }
  };
  
  const shareApp = async () => {
    try {
      const message = 'Check out MotiQuote for daily inspiration and motivation!';
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'MotiQuote App',
            text: message,
            url: 'https://motiquote.app',
          });
        } else {
          Alert.alert('Share', 'Thanks for wanting to share our app!');
        }
      } else {
        await RNShare.share({
          message,
        });
      }
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  // Update the notification listener to be more robust
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      const quote = quotesData.find(q => q.id === notification.request.content.data?.quoteId);
      if (quote) {
        console.log('Quote notification received, rescheduling next notification');
        scheduleNotification(notificationTime).catch(error => {
          console.error('Error rescheduling notification:', error);
        });
      }
    });

    // Also add a response listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [notificationTime]);

  // Add permission check on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      console.log('Current notification permission status:', status);
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('New notification permission status:', newStatus);
      }
    };
    
    checkPermissions();
  }, []);

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>
      </View>
      
      <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Preferences</Text>
        
          <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
          <View style={styles.settingInfo}>
              <Bell size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>Daily Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
              trackColor={{ false: currentTheme.switchTrack, true: currentTheme.primaryLight }}
              thumbColor={notificationsEnabled ? currentTheme.primary : currentTheme.switchThumb}
          />
        </View>
        
          {notificationsEnabled && (
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}
              onPress={openTimePicker}
            >
              <View style={styles.settingInfo}>
                <Clock size={22} color={currentTheme.primary} />
                <Text style={[styles.settingText, { color: currentTheme.text }]}>
                  Notification Time: {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <ExternalLink size={18} color={currentTheme.secondaryText} />
            </TouchableOpacity>
          )}

          <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
          <View style={styles.settingInfo}>
              <Moon size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>Dark Mode</Text>
          </View>
          <Switch
              value={isDarkMode}
            onValueChange={toggleDarkMode}
              trackColor={{ false: currentTheme.switchTrack, true: currentTheme.primaryLight }}
              thumbColor={isDarkMode ? currentTheme.primary : currentTheme.switchThumb}
          />
        </View>
      </View>
      
      <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>About</Text>
        
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: currentTheme.border }]} onPress={openWebsite}>
          <View style={styles.settingInfo}>
              <Info size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>About MotiQuote</Text>
          </View>
            <ExternalLink size={18} color={currentTheme.secondaryText} />
        </TouchableOpacity>
        
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: currentTheme.border }]} onPress={contactSupport}>
          <View style={styles.settingInfo}>
              <Mail size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>Contact Support</Text>
          </View>
            <ExternalLink size={18} color={currentTheme.secondaryText} />
        </TouchableOpacity>
        
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: currentTheme.border }]} onPress={rateApp}>
          <View style={styles.settingInfo}>
              <Star size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>Rate the App</Text>
          </View>
            <ExternalLink size={18} color={currentTheme.secondaryText} />
        </TouchableOpacity>
        
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: currentTheme.border }]} onPress={shareApp}>
          <View style={styles.settingInfo}>
              <Share size={22} color={currentTheme.primary} />
              <Text style={[styles.settingText, { color: currentTheme.text }]}>Share with Friends</Text>
          </View>
            <ExternalLink size={18} color={currentTheme.secondaryText} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
          <Text style={[styles.version, { color: currentTheme.secondaryText }]}>Version {appVersion}</Text>
          <Text style={[styles.copyright, { color: currentTheme.secondaryText }]}>© 2025 MotiQuote. All rights reserved.</Text>
      </View>
    </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <Pressable 
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.cardBackground }
            ]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                Set Notification Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                style={styles.closeButton}
              >
                <XIcon size={24} color={currentTheme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: currentTheme.primary + '20' }]}
                  onPress={incrementHour}
                >
                  <ChevronUp size={24} color={currentTheme.primary} />
                </TouchableOpacity>
                <Text style={[styles.timeText, { color: currentTheme.text }]}>
                  {formatTimeNumber(tempHour)}
                </Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: currentTheme.primary + '20' }]}
                  onPress={decrementHour}
                >
                  <ChevronDown size={24} color={currentTheme.primary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.timeSeparator, { color: currentTheme.text }]}>:</Text>

              <View style={styles.timeColumn}>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: currentTheme.primary + '20' }]}
                  onPress={incrementMinute}
                >
                  <ChevronUp size={24} color={currentTheme.primary} />
                </TouchableOpacity>
                <Text style={[styles.timeText, { color: currentTheme.text }]}>
                  {formatTimeNumber(tempMinute)}
                </Text>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: currentTheme.primary + '20' }]}
                  onPress={decrementMinute}
                >
                  <ChevronDown size={24} color={currentTheme.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: currentTheme.primary }]}
              onPress={handleTimeConfirm}
            >
              <Check size={24} color="#ffffff" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  version: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    marginVertical: 10,
  },
  timeSeparator: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    marginHorizontal: 20,
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 8,
  },
});