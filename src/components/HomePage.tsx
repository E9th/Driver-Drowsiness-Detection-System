import { HeroSection } from "./HeroSection";
import hero2 from "./image/hero_2.jpg";
import { StatisticsSection } from "./StatisticsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GraduationCap, Code } from "lucide-react";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      
      {/* Team Section */}
      <section
          className="py-16"
        style={{
          backgroundImage: `url(${hero2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-6 lg:px-8 text-white">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl text-white">
              ผู้จัดทำโปรเจค
            </h2>
            <p className="text-xl text-slate-100 max-w-3xl mx-auto">
              นักศึกษาคณะวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* ธนพล */}
            <Card className="text-center transition-shadow border border-white/40 bg-white/30 backdrop-blur-md hover:shadow-2xl">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/MDd5SXKD/Thanapon-Dongphuyaw.png" 
                  alt="ธนพล ดงภูยาว" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl" style={{ color: "#dbdbdbff" }}>นาย ธนพล ดงภูยาว </CardTitle>
                <CardDescription className="text-slate-600" style={{ color: "#bcbfc3ff" }}>
                  รหัสนักศึกษา: 6651630078
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="text-1xl bg-blue-50 text-blue-700">
                    <Code className="w-3 h-3 mr-1" />
                    Fullstack Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* พัชระ */}
            <Card className="text-center transition-shadow border border-white/40 bg-white/30 backdrop-blur-md hover:shadow-2xl">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/RpLKFW5L/130739449.jpg" 
                  alt="พัชระ อัลอุมารี" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl" style={{ color: "#dbdbdbff" }}>นาย พัชระ อัลอุมารี</CardTitle>
                <CardDescription className="text-slate-600" style={{ color: "#bcbfc3ff" }}>
                  รหัสนักศึกษา: 6651630177
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="text-1xl bg-green-50 text-green-700">
                    <Code className="w-3 h-3 mr-1" />
                    AI/ML Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* ดิศรณ์ */}
            <Card className="text-center transition-shadow border border-white/40 bg-white/30 backdrop-blur-md hover:shadow-2xl">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/8n50nD4g/165276626.jpg" 
                  alt="ดิศรณ์ ศุภประทุม" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl" style={{ color: "#dbdbdbff" }}>นาย ดิศรณ์ ศุภประทุม</CardTitle>
                <CardDescription className="text-slate-600" style={{ color: "#bcbfc3ff" }}>
                  รหัสนักศึกษา: 6651630292
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="text-1xl bg-purple-50 text-purple-700">
                    <Code className="w-3 h-3 mr-1" />
                    QA&Tester
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advisor Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="border border-white/40 bg-white/30 backdrop-blur-md shadow-2xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900" style={{ color: "#dbdbdbff" }}>อาจารย์ที่ปรึกษา</CardTitle>
                <CardDescription className="text-lg text-slate-700 mt-2" style={{ color: "#bcbfc3ff" }}>
                  ผศ.ดร.กัมพล พรหมจิระประวัติ
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600" style={{ color: "#bcbfc3ff" }}>
                  คณะวิศวกรรมคอมพิวเตอร์<br />
                  มหาวิทยาลัยรามคำแหง
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <h3 className="text-lg">Development of Driver Drowsiness Detection System</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              การพัฒนาระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์<br />
              โปรเจคจบการศึกษา คณะวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
              <span>• Python & OpenCV</span>
              <span>• React & TypeScript</span>
              <span>• Machine Learning</span>
              <span>• Computer Vision</span>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-6 pt-6">
            <p className="text-xs text-slate-400">
              © 2024 โปรเจคจบการศึกษา | มหาวิทยาลัยรามคำแหง
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}