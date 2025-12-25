import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/Auth/SplashScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
import VerifyOTPScreen from "../screens/Auth/VerifyOTPScreen";
import ResetPasswordScreen from "../screens/Auth/ResetPasswordScreen";
import EmailVerificationScreen from "../screens/Auth/EmailVerificationScreen";
import EmailVerificationOTPScreen from "../screens/Auth/EmailVerificationOTPScreen";

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="EmailVerificationOTP" component={EmailVerificationOTPScreen} />
    </Stack.Navigator>
  );
}
