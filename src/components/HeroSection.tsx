import { Shield } from "lucide-react";
import teaser from "./image/gif/teaser.gif";
import heroBg from "./image/hero_1.jpg";

export function HeroSection() {
  return (
    <section
      className="relative flex items-center py-8 sm:py-12 lg:py-15"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>โปรเจคจบการศึกษา</span>
              </div>
              <h1 className="text-white leading-tight text-lg sm:text-2xl lg:text-4xl">
                Development of Driver Drowsiness Detection
                System
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-slate-100 leading-relaxed">
                โปรเจคจบการศึกษาสาขาวิศวกรรมคอมพิวเตอร์
                มหาวิทยาลัยรามคำแหง
                ระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์โดยใช้เทคโนโลยี
                Computer Vision และ Machine Learning
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-5 sm:pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1" style={{ color: "#F1F5F9" }}>
                  99.2%
                </div>
                <div className="text-xs sm:text-sm text-slate-600" style={{ color: "#FFFFFF" }}>
                  ความแม่นยำ
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1" style={{ color: "#F1F5F9" }}>
                  &lt; 0.5s
                </div>
                <div className="text-xs sm:text-sm text-slate-600" style={{ color: "#FFFFFF" }}>
                  เวลาตอบสนอง
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1" style={{ color: "#F1F5F9" }}>
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-slate-600" style={{ color: "#FFFFFF" }}>
                  การตรวจสอบ
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl p-1 sm:p-2 md:p-3 border border-white/20 shadow-2xl bg-white/30 backdrop-blur-md">
              <div className="w-full h-56 sm:h-64 md:h-80 rounded-xl overflow-hidden">
                <img
                  src={teaser}
                  alt="ระบบตรวจจับความง่วง - ตัวอย่างการทำงาน"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Floating elements removed for cleaner hero */}
          </div>
        </div>
      </div>
    </section>
  );
}