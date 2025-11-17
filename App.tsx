import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { NotificationsProvider } from "./src/contexts/NotificationsContext";

export default function App() {
  return (
    <NotificationsProvider>
      <AppNavigator />
    </NotificationsProvider>
  );
}
