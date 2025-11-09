import { useState } from "react";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const navigateToHome = () => setCurrentPage("home");
  const navigateToLogin = () => setCurrentPage("login");
  const navigateToSignup = () => setCurrentPage("signup");
  const navigateToDriverDashboard = () => setCurrentPage("driver-dashboard");
  const navigateToMasterDashboard = () => setCurrentPage("master-dashboard");
  const navigateToProfile = () => setCurrentPage("profile");
  const navigateToProjectDetails = () => setCurrentPage("project-details");
  const navigateToVideoDemo = () => setCurrentPage("video-demo");

  // แสดง Header เฉพาะเมื่ออยู่ในหน้า home
  const renderCurrentPage = () => {
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
          />
        );
      case "driver-dashboard":
        return (
          <DriverDashboard 
            onBack={navigateToHome}
            onProfile={navigateToProfile}
          />
        );
      case "master-dashboard":
        return (
          <MasterDashboard 
            onBack={navigateToHome}
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