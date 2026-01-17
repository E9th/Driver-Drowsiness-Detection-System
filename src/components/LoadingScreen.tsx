import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a1a] text-white">
      <div className="relative flex flex-col items-center">
        {/* Logo Animation */}
        <div className="mb-8 relative w-24 h-24 sm:w-32 sm:h-32">
          <div className="absolute inset-0 border-4 border-slate-600 rounded-full opacity-20 animate-ping"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          <img 
            src="https://i.ibb.co/RTdNsNcr/logo.webp" 
            alt="Logo" 
            className="absolute inset-0 w-full h-full object-contain p-4 animate-pulse"
          />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
          Driver Drowsiness Detection
        </h2>
        <p className="text-slate-400 text-sm mb-6">Updating security policy...</p>

        {/* Custom Progress Bar */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
