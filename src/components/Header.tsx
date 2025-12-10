import { Button } from "./ui/button";
import { Home } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onHome: () => void;
}

export function Header({ onLoginClick, onSignupClick, onHome }: HeaderProps) {
  const handleHomeClick = () => {
    onHome();
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700" style={{ backgroundColor: "#313131" }}>
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 text-slate-100">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Logo และชื่อบริษัท */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src="https://i.ibb.co/JwcgPyVy/logo.png" 
                alt="Driver Safety AI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-[11px] sm:text-sm truncate text-slate-50">Driver Drowsiness Detection</span>
              <span className="text-[10px] sm:text-xs text-slate-300 hidden md:block truncate">ระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์</span>
            </div>
          </div>

          {/* Navigation Menu สำหรับ desktop */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHomeClick}
              className="text-sm text-slate-100 hover:text-white"
            >
              <Home className="w-4 h-4 mr-1" />
              หน้าหลัก
            </Button>
          </nav>

          {/* ปุ่มลงชื่อเข้าใช้และสมัครสมาชิก */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] sm:text-sm px-2 sm:px-3 h-8 sm:h-9 border-slate-400 text-[#313131] hover:text-[#F1F5F9] hover:bg-slate-700"
              onClick={onLoginClick}
            >
              เข้าสู่ระบบ
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-[11px] sm:text-sm px-2 sm:px-3 h-8 sm:h-9 whitespace-nowrap"
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