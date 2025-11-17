import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import PredictionScreen from "../screens/PredictionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Prediction" component={PredictionScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
