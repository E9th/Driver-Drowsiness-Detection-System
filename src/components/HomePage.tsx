import { HeroSection } from "./HeroSection";
import { StatisticsSection } from "./StatisticsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, GraduationCap, Code, Github } from "lucide-react";

interface HomePageProps {
  onProjectDetails: () => void;
  onVideoDemo: () => void;
}

export function HomePage({ onProjectDetails, onVideoDemo }: HomePageProps) {
  return (
    <>
      <HeroSection 
        onProjectDetails={onProjectDetails}
        onVideoDemo={onVideoDemo}
      />
      <StatisticsSection />
      
      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-orange-100 text-orange-800 mb-4">
              <GraduationCap className="w-4 h-4 mr-2" />
              โปรเจคจบการศึกษา
            </Badge>
            <h2 className="text-3xl lg:text-4xl text-slate-900">
              ผู้จัดทำโปรเจค
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              นักศึกษาคณะวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* ธนพล */}
            <Card className="text-center hover:shadow-lg transition-shadow border border-slate-200">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/MDd5SXKD/Thanapon-Dongphuyaw.png" 
                  alt="ธนพล ดงภูยาว" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl">นาย ธนพล ดงภูยาว</CardTitle>
                <CardDescription className="text-slate-600">
                  รหัสนักศึกษา: 6651630078
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    <Code className="w-3 h-3 mr-1" />
                    Fullstack Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* พัชระ */}
            <Card className="text-center hover:shadow-lg transition-shadow border border-slate-200">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/RpLKFW5L/130739449.jpg" 
                  alt="พัชระ อัลอุมารี" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl">นาย พัชระ อัลอุมารี</CardTitle>
                <CardDescription className="text-slate-600">
                  รหัสนักศึกษา: 6651630177
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <Code className="w-3 h-3 mr-1" />
                    AI/ML Development
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* ดิศรณ์ */}
            <Card className="text-center hover:shadow-lg transition-shadow border border-slate-200">
              <CardHeader className="pb-4">
                <img 
                  src="https://i.ibb.co/8n50nD4g/165276626.jpg" 
                  alt="ดิศรณ์ ศุภประทุม" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <CardTitle className="text-xl">นาย ดิศรณ์ ศุภประทุม</CardTitle>
                <CardDescription className="text-slate-600">
                  รหัสนักศึกษา: 6651630292
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    <Code className="w-3 h-3 mr-1" />
                    QA&Tester
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advisor Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">อาจารย์ที่ปรึกษา</CardTitle>
                <CardDescription className="text-lg text-slate-700 mt-2">
                  ผศ.ดร.กัมพล พรหมจิระประวัติ
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
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