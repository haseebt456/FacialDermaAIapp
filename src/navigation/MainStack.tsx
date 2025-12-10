import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import PredictionScreen from "../screens/PredictionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyReviewRequestsScreen from "../screens/reviews/MyReviewRequestsScreen";
import SelectDermatologistScreen from "../screens/reviews/SelectDermatologistScreen";
import ReviewRequestDetailScreen from "../screens/reviews/ReviewRequestDetailScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import AnalysisDetailScreen from "../screens/AnalysisDetailScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import DermatologistHomeScreen from "../screens/DermatologistHomeScreen";
import DermatologistReviewsScreen from "../screens/DermatologistReviewsScreen";
import DermatologistReviewDetailScreen from "../screens/DermatologistReviewDetailScreen";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DermatologistHome" component={DermatologistHomeScreen} />
      <Stack.Screen name="Prediction" component={PredictionScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MyReviewRequests" component={MyReviewRequestsScreen} />
      <Stack.Screen name="SelectDermatologist" component={SelectDermatologistScreen} />
      <Stack.Screen name="ReviewRequestDetail" component={ReviewRequestDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AnalysisDetail" component={AnalysisDetailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="DermatologistReviews" component={DermatologistReviewsScreen} />
      <Stack.Screen name="DermatologistReviewDetail" component={DermatologistReviewDetailScreen} />
    </Stack.Navigator>
  );
}
