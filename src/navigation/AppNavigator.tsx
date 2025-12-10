import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";
import BottomNav from "../components/BottomNav";

const RootStack = createStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("user");
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        setUserRole(user.role);
        setIsLoggedIn(true);
        
        // Navigate to appropriate home screen based on role
        setTimeout(() => {
          if (navigationRef.current) {
            if (user.role === 'dermatologist') {
              navigationRef.current.navigate('Main', { screen: 'DermatologistHome' });
            } else {
              navigationRef.current.navigate('Main', { screen: 'Home' });
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userJson = await AsyncStorage.getItem("user");
      const newLoggedInState = !!token;
      
      if (newLoggedInState !== isLoggedIn) {
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserRole(user.role);
        }
        setIsLoggedIn(newLoggedInState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (isLoading) {
    return <Loading fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <RootStack.Screen name="Main" component={MainStack} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
      {isLoggedIn && <BottomNav navigationRef={navigationRef} userRole={userRole} />}
    </NavigationContainer>
  );
}
