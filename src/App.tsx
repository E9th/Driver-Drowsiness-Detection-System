import { useState } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { DriverDashboard } from "./components/DriverDashboard";
import { MasterDashboard } from "./components/MasterDashboard";
import { ProfilePage } from "./components/ProfilePage";
import { ProjectDetailsSection } from "./components/ProjectDetailsSection";
import { VideoSection } from "./components/VideoSection";

type PageType = "home" | "login" | "signup" | "driver-dashboard" | "master-dashboard" | "profile" | "project-details" | "video-demo";

function AppInner() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [demoMode, setDemoMode] = useState(false); // อนุญาตเข้าหน้า dashboard แบบ demo ไม่ต้อง login
  const { isAuthenticated, loading, user } = useAuth();

  const navigateToHome = () => { setCurrentPage("home"); setDemoMode(false); };
  const navigateToLogin = () => { setCurrentPage("login"); setDemoMode(false); };
  const navigateToSignup = () => { setCurrentPage("signup"); setDemoMode(false); };
  const navigateToDriverDashboard = () => { setCurrentPage("driver-dashboard"); if (!isAuthenticated) setDemoMode(true); };
  const navigateToMasterDashboard = () => { setCurrentPage("master-dashboard"); if (!isAuthenticated) setDemoMode(true); };
  const navigateToProfile = () => setCurrentPage("profile");
  const navigateToProjectDetails = () => setCurrentPage("project-details");
  const navigateToVideoDemo = () => setCurrentPage("video-demo");

  // แสดง Header เฉพาะเมื่ออยู่ในหน้า home
  const renderCurrentPage = () => {
    if (loading) {
      return <div className="p-8 text-center">กำลังโหลด...</div>;
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
      case "project-details":
        return (
          <ProjectDetailsSection 
            onBack={navigateToHome}
          />
        );
      case "video-demo":
        return (
          <VideoSection 
            onBack={navigateToHome}
          />
        );
      default:
        return (
          <div className="min-h-screen">
            <Header 
              onLoginClick={navigateToLogin}
              onSignupClick={navigateToSignup}
              onProjectDetails={navigateToProjectDetails}
              onVideoDemo={navigateToVideoDemo}
              onHome={navigateToHome}
            />
            <HomePage 
              onProjectDetails={navigateToProjectDetails}
              onVideoDemo={navigateToVideoDemo}
            />
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