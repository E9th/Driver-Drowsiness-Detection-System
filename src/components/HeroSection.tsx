import { Button } from "./ui/button";
import { AlertTriangle, Car, Eye, Shield } from "lucide-react";

interface HeroSectionProps {
  onProjectDetails?: () => void;
  onVideoDemo?: () => void;
}

export function HeroSection({ onProjectDetails, onVideoDemo }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center py-8 sm:py-12 lg:py-15">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>โปรเจคจบการศึกษา</span>
              </div>
              <h1 className="text-slate-600 leading-tight text-lg sm:text-2xl lg:text-4xl">
                Development of Driver Drowsiness Detection
                System
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-slate-600 leading-relaxed">
                โปรเจคจบการศึกษาสาขาวิศวกรรมคอมพิวเตอร์
                มหาวิทยาลัยรามคำแหง
                ระบบตรวจจับความเหนื่อยล้าของผู้ขับขี่โดยใช้เทคโนโลยี
                Computer Vision และ Machine Learning
              </p>
              <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs sm:text-sm text-slate-700">
                  <strong>ผู้จัดทำ:</strong> นาย ธนพล ดงภูยาว,
                  นาย พัชระ อัลอุมารี, นาย ดิศรณ์ ศุภประทุม
                  <br />
                  <strong>อาจารย์ที่ปรึกษา:</strong> ผศ.ดร.กัมพล
                  พรหมจิระประวัติ
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base h-10 sm:h-11"
                onClick={onVideoDemo}
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                ดูการสาธิต
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base h-10 sm:h-11"
                onClick={onProjectDetails}
              >
                <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                รายละเอียดโปรเจค
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-5 sm:pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-lg sm:text-2xl text-slate-900 mb-0.5 sm:mb-1">
                  99.2%
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  ความแม่นยำ
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl text-slate-900 mb-0.5 sm:mb-1">
                  &lt; 0.5s
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  เวลาตอบสนอง
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl text-slate-900 mb-0.5 sm:mb-1">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  การตรวจสอบ
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border border-slate-200">
              <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-100 to-slate-100 rounded-xl overflow-hidden mb-4 sm:mb-6">
                <img
                  src="https://i.ibb.co/d0vFf4jn/PRESENTAION-CUT-VER.png"
                  alt="AI Camera System"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">
                    สถานะการตรวจสอบ
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm text-green-600">
                      กำลังตรวจสอบ
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">
                    ระดับความตื่นตัว
                  </span>
                  <span className="text-xs sm:text-sm text-slate-900">
                    ต่ำ (10%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">
                    การแจ้งเตือน
                  </span>
                  <span className="text-xs sm:text-sm text-red-600">
                    สูง
                  </span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-yellow-400 text-yellow-900 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              <span className="hidden xs:inline">Alert System</span>
            </div>
            <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-green-500 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              <span className="hidden xs:inline">Safe Driving</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}