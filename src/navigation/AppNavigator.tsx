import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../components/Loading";

const RootStack = createStackNavigator();

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      setIsLoggedIn(!!token);
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
      const newLoggedInState = !!token;
      if (newLoggedInState !== isLoggedIn) {
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
    </NavigationContainer>
  );
}
