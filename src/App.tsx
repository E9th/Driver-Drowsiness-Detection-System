import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { DriverDashboard } from "./components/DriverDashboard";
import { MasterDashboard } from "./components/MasterDashboard";
import { ProfilePage } from "./components/ProfilePage";
import { LoadingScreen } from "./components/LoadingScreen";

type PageType = "home" | "login" | "signup" | "driver-dashboard" | "master-dashboard" | "profile";

function AppInner() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [demoMode, setDemoMode] = useState(false); // อนุญาตเข้าหน้า dashboard แบบ demo ไม่ต้อง login
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  
  useEffect(() => {
    const imageUrls = [
       "https://s12.gifyu.com/images/bheKN.gif",
       "https://i.ibb.co/DPcRR1m3/hero-1.webp", 
       "https://i.ibb.co/KxWsnxyT/hero-2.webp",
       "https://i.ibb.co/RTdNsNcr/logo.webp"
    ];

    const preloadImages = async () => {
      const promises = imageUrls.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if error
        });
      });

      try {
        await Promise.all(promises);
      } catch (e) {
        console.error("Image preload error", e);
      } finally {
        // Minimum loading time of 1.5s for smoothness
        setTimeout(() => setImagesLoaded(true), 1500);
      }
    };

    preloadImages();
  }, []);

  const navigateToHome = () => { setCurrentPage("home"); setDemoMode(false); };
  const navigateToLogin = () => { setCurrentPage("login"); setDemoMode(false); };
  const navigateToSignup = () => { setCurrentPage("signup"); setDemoMode(false); };
  const navigateToDriverDashboard = () => { setCurrentPage("driver-dashboard"); if (!isAuthenticated) setDemoMode(true); };
  const navigateToMasterDashboard = () => { setCurrentPage("master-dashboard"); if (!isAuthenticated) setDemoMode(true); };
  const navigateToProfile = () => setCurrentPage("profile");
  // video demo removed

  // แสดง Header เฉพาะเมื่ออยู่ในหน้า home
  const renderCurrentPage = () => {
    // Show loading screen if auth is loading or images are still preloading
    if (loading || !imagesLoaded) {
      return <LoadingScreen />;
    }
    
    switch (currentPage) {
      case "login":
        return (
          <LoginPage 
            onBack={navigateToHome}
            onSwitchToSignup={navigateToSignup}
            onDriverDashboard={navigateToDriverDashboard}
            onMasterDashboard={navigateToMasterDashboard}
          />
        );
      case "signup":
        return (
          <SignupPage 
            onBack={navigateToHome}
            onSwitchToLogin={navigateToLogin}
            onDriverDashboard={navigateToDriverDashboard}
            onMasterDashboard={navigateToMasterDashboard}
          />
        );
      case "driver-dashboard":
        return (isAuthenticated || demoMode) ? (
          <DriverDashboard
            onBack={navigateToHome}
            onProfile={navigateToProfile}
          />
        ) : (
          <LoginPage
            onBack={navigateToHome}
            onSwitchToSignup={navigateToSignup}
            onDriverDashboard={navigateToDriverDashboard}
            onMasterDashboard={navigateToMasterDashboard}
          />
        );
      case "master-dashboard":
        return isAuthenticated && user?.role === 'admin' ? (
          <MasterDashboard 
            onBack={navigateToHome}
          />
        ) : (
          <LoginPage 
            onBack={navigateToHome}
            onSwitchToSignup={navigateToSignup}
            onDriverDashboard={navigateToDriverDashboard}
            onMasterDashboard={navigateToMasterDashboard}
          />
        );
      case "profile":
        return (
          <ProfilePage 
            onBack={navigateToDriverDashboard}
          />
        );
      // video-demo route removed
      default:
        return (
          <div className="min-h-screen">
            <Header 
              onLoginClick={navigateToLogin}
              onSignupClick={navigateToSignup}
              onHome={navigateToHome}
            />
            <HomePage />
          </div>
        );
    }
  };

  return renderCurrentPage();
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}