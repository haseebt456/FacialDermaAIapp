import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const FaceIcon = () => (
  <View style={styles.iconContainer}>
    <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      {/* Face outline corners */}
      <Path
        d="M20 12C20 10.8954 20.8954 10 22 10H30"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M50 10H58C59.1046 10 60 10.8954 60 12V20"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M60 60V68C60 69.1046 59.1046 70 58 70H50"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <Path
        d="M30 70H22C20.8954 70 20 69.1046 20 68V60"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      {/* Eyes */}
      <Path
        d="M30 35C30 36.6569 31.3431 38 33 38C34.6569 38 36 36.6569 36 35C36 33.3431 34.6569 32 33 32C31.3431 32 30 33.3431 30 35Z"
        fill="#FFFFFF"
      />
      <Path
        d="M44 35C44 36.6569 45.3431 38 47 38C48.6569 38 50 36.6569 50 35C50 33.3431 48.6569 32 47 32C45.3431 32 44 33.3431 44 35Z"
        fill="#FFFFFF"
      />
      
      {/* Smile */}
      <Path
        d="M32 48C32 48 36 52 40 52C44 52 48 48 48 48"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  </View>
);

const SplashScreen = () => {
  const navigation = useNavigation<any>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Blue gradient background */}
      <View style={styles.gradientBackground} />
      
      <View style={styles.content}>
        {/* Icon */}
        <FaceIcon />
        
        {/* Title */}
        <Text style={styles.title}>FacialDerma AI</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Professional skin health analysis{'\n'}powered by artificial intelligence.
        </Text>
        
        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b6cb0',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2b6cb0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: width - 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2b6cb0',
    marginRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#2b6cb0',
    fontWeight: '600',
  },
});

export default SplashScreen;
