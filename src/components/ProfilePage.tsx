import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import { 
  ArrowLeft, 
  User, 
  Settings, 
  Shield,
  Save,
  Edit3
} from "lucide-react";

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "สมชาย ใจดี",
    email: "somchai@company.com",
    phone: "081-234-5678",
    driverId: "DRV001",
    vehicleId: "ABC-1234"
  });



  const handleSaveProfile = () => {
    setIsEditing(false);
    // จำลองการบันทึกข้อมูล
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">โปรไฟล์ผู้ใช้</h1>
                  <p className="text-sm text-slate-600">จัดการข้อมูลส่วนตัวและการตั้งค่า</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              ผู้ขับขี่
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
            <TabsTrigger value="system">ระบบ</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>ข้อมูลส่วนตัว</span>
                    </CardTitle>
                    <CardDescription>
                      จัดการข้อมูลส่วนตัวและรายละเอียดบัญชี
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึก
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        แก้ไข
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverId">รหัสผู้ขับขี่</Label>
                    <Input
                      id="driverId"
                      value={profileData.driverId}
                      disabled
                      className="bg-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">รหัสรถ</Label>
                    <Input
                      id="vehicleId"
                      value={profileData.vehicleId}
                      disabled
                      className="bg-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>สรุปการขับขี่</span>
                </CardTitle>
                <CardDescription>
                  ประสิทธิภาพการขับขี่และสถานะปัจจุบัน
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-sm text-orange-700">ครั้งวันนี้</div>
                    <div className="text-xs text-orange-600 mt-1">การแจ้งเตือน</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-purple-700">วัน</div>
                    <div className="text-xs text-purple-600 mt-1">การขับขี่ปลอดภัย</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>ข้อมูลระบบ</span>
                </CardTitle>
                <CardDescription>
                  ข้อมูลเกี่ยวกับระบบและการตั้งค่า
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">เวอร์ชันระบบ</span>
                      <span className="text-sm font-medium">v2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">วันที่เข้าใช้งานล่าสุด</span>
                      <span className="text-sm font-medium">วันนี้ 08:00 น.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">สถานะการเชื่อมต่อ</span>
                      <Badge className="bg-green-100 text-green-800">ออนไลน์</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">ความไวของเซ็นเซอร์</span>
                      <span className="text-sm font-medium">ปกติ</span>
                    </div>
                
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">การบันทึกข้อมูล</span>
                      <Badge className="bg-blue-100 text-blue-800">เปิดใช้งาน</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">การจัดการข้อมูล</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      ดาวน์โหลดข้อมูลการขับขี่
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      ออกจากระบบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}