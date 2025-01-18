import { Stack } from "expo-router";
import "../global.css";
import { useState, useEffect } from "react";
import SplashScreen from "../app/components/SplashScreen";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <SplashScreen onAnimationComplete={() => setIsReady(true)} />;
  }

  return <Stack />;
}
