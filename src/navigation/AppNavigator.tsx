import React, { useEffect, useState, useRef, useCallback } from "react";
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
  const [isNavigationReady, setIsNavigationReady] = useState(false);
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
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to appropriate screen after navigation is ready
  const onNavigationReady = useCallback(() => {
    setIsNavigationReady(true);
  }, []);

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
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
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
