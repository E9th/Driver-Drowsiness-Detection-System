import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  Target, 
  Lightbulb, 
  Settings, 
  Trophy,
  BookOpen,
  CheckCircle,
  Brain,
  Eye,
  Shield
} from "lucide-react";

interface ProjectDetailsSectionProps {
  onBack: () => void;
}

export function ProjectDetailsSection({ onBack }: ProjectDetailsSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              รายละเอียดโปรเจค
            </Badge>
            <h1 className="text-3xl lg:text-4xl text-slate-900 mb-2">
              การพัฒนาระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์
            </h1>
            <p className="text-xl text-slate-600">
              Development of Driver Drowsiness Detection System
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* ความเป็นมาและความสำคัญ */}
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">ความเป็นมาและความสำคัญ</CardTitle>
                  <CardDescription className="text-slate-600">พื้นหลังของปัญหาและแรงจูงใจในการพัฒนา</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl text-red-600 mb-2">20,000+</div>
                  <div className="text-sm text-red-700">ผู้เสียชีวิต/ปี</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl text-orange-600 mb-2">56</div>
                  <div className="text-sm text-orange-700">รายต่อวัน</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl text-yellow-600 mb-2">33%</div>
                  <div className="text-sm text-yellow-700">จากความง่วงนอน</div>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  ในปัจจุบัน อุบัติเหตุทางถนนยังคงเป็นหนึ่งในปัญหาด้านความปลอดภัยที่ส่งผลกระทบอย่างรุนแรงต่อชีวิต เศรษฐกิจ และสังคมของประเทศไทย 
                  จากข้อมูลของสถาบันวิจัยเพื่อการพัฒนาประเทศไทย (TDRI) ระบุว่า ประเทศไทยมีผู้เสียชีวิตจากอุบัติเหตุทางถนนมากกว่า 20,000 รายต่อปี 
                  หรือเฉลี่ยประมาณ 56 รายต่อวัน ซึ่งนับเป็นหนึ่งในอัตราการเสียชีวิตบนถนนที่สูงที่สุดในภูมิภาคเอเชียตะวันออกเฉียงใต้
                </p>
                
                <p className="text-slate-700 leading-relaxed">
                  หนึ่งในสาเหตุหลักของอุบัติเหตุดังกล่าว คือ ภาวะง่วงนอนของผู้ขับขี่ (Driver Drowsiness) 
                  จากการทบทวนวรรณกรรมซึ่งได้ทำการสำรวจผู้ขับขี่รถบรรทุกและรถโดยสาร จำนวน 4,331 รายพบว่า 
                  ร้อยละ 75 ของผู้ตอบแบบสอบถามเคยขับรถในขณะง่วงนอน และร้อยละ 28 เคยมีอาการหลับในระหว่างขับขี่ 
                  โดยภาวะง่วงนอนเป็นสาเหตุของการประสบอุบัติเหตุจากการขับขี่ คิดเป็นร้อยละ 33 จากจำนวนการประสบอุบัติเหตุทั้งหมด
                </p>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 my-6">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-900 mb-2">เทคโนโลยีที่ใช้</h4>
                      <p className="text-blue-800 text-sm">
                        ระบบใช้เทคโนโลยี Google Mediapipe ซึ่งสามารถตรวจจับและติดตามตำแหน่งจุดบนใบหน้า (Facial Landmark Detection) 
                        ได้มากถึง 468 จุดอย่างแม่นยำและรวดเร็ว เพื่อคำนวณค่า Eye Aspect Ratio (EAR) และ Mouth Aspect Ratio (MAR) 
                        ซึ่งเป็นตัวชี้วัดทางชีวกลศาสตร์ที่สามารถระบุพฤติกรรมการหลับตาและการหาวได้อย่างแม่นยำ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* วัตถุประสงค์ */}
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">วัตถุประสงค์</CardTitle>
                  <CardDescription className="text-slate-600">เป้าหมายการพัฒนาระบบ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-700">
                    ออกแบบและพัฒนาระบบตรวจจับภาวะง่วงนอนของผู้ขับขี่ โดยอาศัยเทคนิคการประมวลผลภาพที่สามารถวิเคราะห์ลักษณะสำคัญบนใบหน้า 
                    เช่น อัตราส่วนของดวงตา (Eye Aspect Ratio: EAR) และอัตราส่วนของปาก (Mouth Aspect Ratio: MAR)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-700">
                    พัฒนาระบบแจ้งเตือนอัตโนมัติในรูปแบบแสงและเสียง โดยสามารถส่งสัญญาณเตือนผู้ขับขี่ได้ทันทีเมื่อระบบตรวจพบภาวะการง่วงนอน
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-slate-700">
                    ประเมินประสิทธิภาพของระบบต้นแบบที่พัฒนาขึ้นในสภาพแวดล้อมจำลองการขับขี่ที่ใกล้เคียงกับสถานการณ์จริง
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ขอบเขต */}
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">ขอบเขตการศึกษา</CardTitle>
                  <CardDescription className="text-slate-600">ขอบเขตและข้อจำกัดของระบบ</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      <h4 className="text-purple-900">การตรวจจับ</h4>
                    </div>
                    <p className="text-purple-800 text-sm">
                      ใช้กล้องวิดีโอภายในห้องโดยสารเป็นอุปกรณ์หลักในการเก็บข้อมูลภาพแบบเรียลไทม์
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h4 className="text-blue-900">การประมวลผล</h4>
                    </div>
                    <p className="text-blue-800 text-sm">
                      ใช้เทคนิค Facial Landmark Detection เพื่อคำนวณค่า EAR และ MAR
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h4 className="text-green-900">การแจ้งเตือน</h4>
                    </div>
                    <p className="text-green-800 text-sm">
                      ระบบแจ้งเตือนทันทีผ่านสัญญาณเสียงและแสงเมื่อตรวจพบภาวะง่วงนอน
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      <h4 className="text-orange-900">การบันทึก</h4>
                    </div>
                    <p className="text-orange-800 text-sm">
                      เชื่อมโยงกับฐานข้อมูลออนไลน์เพื่อจัดเก็บและเรียกดูข้อมูลย้อนหลัง
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ประโยชน์ที่คาดว่าจะได้รับ */}
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">ประโยชน์ที่คาดว่าจะได้รับ</CardTitle>
                  <CardDescription className="text-slate-600">ผลลัพธ์และผลกระทบที่คาดหวัง</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 text-sm">1</span>
                    </div>
                    <p className="text-slate-700">
                      ได้ระบบต้นแบบที่สามารถตรวจจับภาวะง่วงนอนของผู้ขับขี่ได้อย่างแม่นยำและทันท่วงที 
                      ซึ่งจะช่วยลดความเสี่ยงของการเกิดอุบัติเหตุจากภาวะหลับใน
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">2</span>
                    </div>
                    <p className="text-slate-700">
                      ส่งเสริมการประยุกต์ใช้เทคโนโลยีด้านปัญญาประดิษฐ์ การประมวลผลภาพ และระบบสมองกลฝังตัว 
                      ในงานที่เกี่ยวข้องกับความปลอดภัยบนท้องถนน
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-600 text-sm">3</span>
                    </div>
                    <p className="text-slate-700">
                      ได้ข้อมูลพฤติกรรมของผู้ขับขี่ซึ่งสามารถนำไปใช้ในการพัฒนาแบบจำลองเชิงลึก (Deep Learning) 
                      หรือขยายผลไปสู่ระบบเชิงพาณิชย์ในอนาคต
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-orange-600 text-sm">4</span>
                    </div>
                    <p className="text-slate-700">
                      ส่งเสริมให้นักศึกษาและนักวิจัยมีความรู้และทักษะในการพัฒนาโครงงานวิจัย
                      ที่สามารถนำไปประยุกต์ใช้ได้จริงและตอบสนองต่อปัญหาสังคม
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}