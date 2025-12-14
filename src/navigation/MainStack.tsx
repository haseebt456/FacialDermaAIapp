import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import Loading from "../components/Loading";

const Stack = createStackNavigator();

export default function MainStack() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserRole(user.role);
        }
      } catch (error) {
        console.error("Error getting user role:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserRole();
  }, []);

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  // Set initial route based on user role
  const initialRouteName = userRole === 'dermatologist' ? 'DermatologistHome' : 'Home';

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
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
