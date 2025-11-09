import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Eye, 
  Monitor,
  Clock,
  Users,
  CheckCircle
} from "lucide-react";

interface VideoSectionProps {
  onBack: () => void;
}

export function VideoSection({ onBack }: VideoSectionProps) {
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
            <Badge className="bg-red-100 text-red-800 mb-4">
              <Play className="w-4 h-4 mr-2" />
              วีดีโอสาธิต
            </Badge>
            <h1 className="text-3xl lg:text-4xl text-slate-900 mb-2">
              การสาธิตการทำงานของระบบ
            </h1>
            <p className="text-xl text-slate-600">
              ดูการทำงานจริงของระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Video Player Section */}
          <Card className="border border-slate-200 shadow-xl mb-12">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 text-center">
              <CardTitle className="text-2xl text-slate-900 mb-2">
                วีดีโอสาธิตระบบ
              </CardTitle>
              <CardDescription className="text-slate-600">
                ดูการทำงานแบบเรียลไทม์ของงระบบตรวจจับภาวะการง่วงนอนของผู้ขับขี่รถยนต์
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-b-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/qiH74Z5-dO0"
                  title="Driver Drowsiness Detection System Demo"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Video Information */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg text-slate-900 mb-2">ระยะเวลา</h3>
                <p className="text-slate-600">วีดีโอแสดงการทำงานของระบบในช่วงเวลาต่างๆ</p>
              </CardContent>
            </Card>

            <Card className="text-center border border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg text-slate-900 mb-2">การตรวจจับ</h3>
                <p className="text-slate-600">แสดงการตรวจจับใบหน้าและการวิเคราะห์ EAR, MAR</p>
              </CardContent>
            </Card>

            <Card className="text-center border border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg text-slate-900 mb-2">การแจ้งเตือน</h3>
                <p className="text-slate-600">ดูระบบแจ้งเตือนเมื่อตรวจพบภาวะการง่วงนอน</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Demonstrated */}
          <Card className="border border-slate-200 shadow-lg mb-12">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-2xl text-slate-900">ฟีเจอร์ที่แสดงในวีดีโอ</CardTitle>
              <CardDescription className="text-slate-600">
                ความสามารถหลักของระบบที่สามารถดูได้ในการสาธิต
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">การตรวจจับใบหน้าแบบเรียลไทม์</h4>
                      <p className="text-slate-600 text-sm">ระบบสามารถตรวจจับและติดตามใบหน้าของผู้ขับขี่ได้ทันที</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">การวิเคราะห์ Eye Aspect Ratio (EAR)</h4>
                      <p className="text-slate-600 text-sm">คำนวณอัตราส่วนของดวงตาเพื่อตรวจจับการหลับตา</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">การวิเคราะห์ Mouth Aspect Ratio (MAR)</h4>
                      <p className="text-slate-600 text-sm">ตรวจจับการหาวซึ่งเป็นสัญญาณของภาวะการง่วงนอน</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">ระบบแจ้งเตือนอัตโนมัติ</h4>
                      <p className="text-slate-600 text-sm">แจ้งเตือนด้วยเสียงและภาพเมื่อตรวจพบภาวะง่วงนอน</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">การแสดงผลแบบเรียลไทม์</h4>
                      <p className="text-slate-600 text-sm">แสดงค่า EAR และ MAR พร้อมสถานะการตรวจจับ</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-1">การบันทึกข้อมูลและสถิติ</h4>
                      <p className="text-slate-600 text-sm">เก็บข้อมูลการตรวจจับเพื่อการวิเคราะห์ย้อนหลัง</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="border border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
              <CardTitle className="text-2xl text-slate-900">รายละเอียดทางเทคนิค</CardTitle>
              <CardDescription className="text-slate-600">
                เทคโนโลยีและวิธีการที่ใช้ในการพัฒนาระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-blue-900 mb-3">Computer Vision</h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li>• Google MediaPipe</li>
                    <li>• Facial Landmark Detection</li>
                    <li>• OpenCV สำหรับประมวลผลภาพ</li>
                    <li>• Python Programming</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-green-900 mb-3">Machine Learning</h4>
                  <ul className="space-y-2 text-green-800 text-sm">
                    <li>• Algorithm การคำนวณ EAR</li>
                    <li>• Algorithm การคำนวณ MAR</li>
                    <li>• Threshold Detection</li>
                    <li>• Pattern Recognition</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-purple-900 mb-3">Web Application</h4>
                  <ul className="space-y-2 text-purple-800 text-sm">
                    <li>• React & TypeScript</li>
                    <li>• Real-time Data Display</li>
                    <li>• Dashboard Interface</li>
                    <li>• Data Visualization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}