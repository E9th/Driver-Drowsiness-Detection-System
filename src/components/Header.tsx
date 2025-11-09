import { Button } from "./ui/button";
import { Car, Eye, Home } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onProjectDetails: () => void;
  onVideoDemo: () => void;
  onHome: () => void;
}

export function Header({ onLoginClick, onSignupClick, onProjectDetails, onVideoDemo, onHome }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleHomeClick = () => {
    onHome();
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo และชื่อบริษัท */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="https://i.ibb.co/27n36zSn/logo.png" 
                alt="Driver Safety AI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-[11px] sm:text-sm truncate">Driver Drowsiness Detection</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden md:block truncate">ระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์</span>
            </div>
          </div>

          {/* Navigation Menu สำหรับ desktop */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHomeClick}
              className="text-sm"
            >
              <Home className="w-4 h-4 mr-1" />
              หน้าหลัก
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onVideoDemo}
              className="text-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              ดูการสาธิต
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onProjectDetails}
              className="text-sm"
            >
              <Car className="w-4 h-4 mr-1" />
              รายละเอียดโปรเจค
            </Button>
          </nav>

          {/* ปุ่มลงชื่อเข้าใช้และสมัครสมาชิก */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              onClick={onLoginClick}
            >
              เข้าสู่ระบบ
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-[11px] sm:text-sm px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap"
              onClick={onSignupClick}
            >
              สมัครสมาชิก
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}