import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, FlatList, TouchableWithoutFeedback, Image, TouchableOpacity, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import React, { useRef, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// ⚠️ REPLACE THIS with your actual Google OAuth Android Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '780278378991-9bgtt7f1927mo0obsm0556pes8tp4r4m.apps.googleusercontent.com';

const { width, height } = Dimensions.get('window');

const videos = [
  {
    id: '1',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    username: '@bunny_funny',
    description: 'Big Buck Bunny - Check out this classic! #animation'
  },
  {
    id: '2',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    username: '@dreamer',
    description: 'Elephant\'s Dream - First open movie #creative'
  },
  {
    id: '3',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    username: '@chrome_cast',
    description: 'For Bigger Blazes - Super high quality #4k'
  },
  {
    id: '4',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    username: '@sintel_warrior',
    description: 'Sintel - A beautiful animated short film #fantasy'
  },
  {
    id: '5',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    username: '@scifi_lover',
    description: 'Tears of Steel - Amazing Sci-Fi effects! #scifi'
  },
  {
    id: '6',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    username: '@travel_vlog',
    description: 'We Are Going On Bullrun - Extreme adventure! #adventure'
  },
  {
    id: '7',
    uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    username: '@car_enthusiast',
    description: 'What car can you get for a grand? #cars #challenge'
  }
];

const VideoItem = ({ item, isActive }) => {
  const video = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  React.useEffect(() => {
    if (isActive) {
      video.current?.playAsync();
      setIsPlaying(true);
    } else {
      video.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isPlaying) {
      video.current?.pauseAsync();
    } else {
      video.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <TouchableWithoutFeedback onPress={togglePlay}>
      <View style={styles.videoContainer}>
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: item.uri }}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping
        />
        
        {/* Right Action Bar */}
        <View style={styles.rightBar}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.icon}>❤️</Text>
          <Text style={styles.stats}>324K</Text>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.stats}>15K</Text>
          <Text style={styles.icon}>↗</Text>
          <Text style={styles.stats}>Share</Text>
        </View>

        {/* Bottom Text */}
        <View style={styles.bottomTextContainer}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.sound}>🎵 Original Sound - Username</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Fetch user info from Google
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then(res => res.json())
        .then(userInfo => {
          Alert.alert(
            '✅ Google Login Successful!',
            `Welcome, ${userInfo.name}!\n${userInfo.email}`,
            [{ text: 'Start Watching', onPress: () => setShowLanding(false) }]
          );
        })
        .catch(() => Alert.alert('Error', 'Failed to fetch Google profile.'));
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Failed', response.error?.message || 'Something went wrong.');
    }
    setGoogleLoading(false);
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      Alert.alert(
        'Setup Required',
        'Please replace GOOGLE_CLIENT_ID in App.js with your actual Google OAuth Client ID from Google Cloud Console.'
      );
      return;
    }
    setGoogleLoading(true);
    await promptAsync();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (showLanding) {
    return (
      <View style={styles.landingContainer}>
        <StatusBar style="dark" />
        <Image source={require('./assets/icon.png')} style={styles.landingLogo} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={() => Alert.alert('Coming Soon', 'Login will be available shortly!')}>
            <Text style={styles.buttonPrimaryText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => Alert.alert('Coming Soon', 'Sign Up is currently disabled.')}>
            <Text style={styles.buttonSecondaryText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonGoogle, googleLoading && { opacity: 0.6 }]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <Text style={styles.buttonGoogleText}>
              {googleLoading ? '⏳ Connecting...' : '🔵 Connect with Google'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline} onPress={() => setShowLanding(false)}>
            <Text style={styles.buttonOutlineText}>Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <VideoItem item={item} isActive={activeVideoIndex === index} />
        )}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewConfigRef.current}
      />

      {/* Mock Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Text style={[styles.navText, { color: '#fff', fontWeight: 'bold' }]}>Home</Text>
        <Text style={styles.navText}>Discover</Text>
        <View style={styles.addButton}><Text style={{fontSize: 20}}>＋</Text></View>
        <Text style={styles.navText}>Inbox</Text>
        <Text style={styles.navText}>Profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  landingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingLogo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 60,
  },
  buttonContainer: {
    width: '80%',
  },
  buttonPrimary: {
    backgroundColor: '#ff0050',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonSecondaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonGoogle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonGoogleText: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: width,
    height: height - 60, // Leave room for bottom nav
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  rightBar: {
    position: 'absolute',
    right: 16,
    bottom: 50,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#fff',
  },
  stats: {
    color: '#fff',
    marginBottom: 20,
    fontSize: 12,
  },
  bottomTextContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    width: '75%',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  sound: {
    color: '#fff',
    fontSize: 14,
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navText: {
    color: '#888',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
