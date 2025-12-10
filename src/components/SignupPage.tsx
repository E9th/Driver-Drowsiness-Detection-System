import { useState } from "react";
import { register } from "../utils/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Eye, EyeOff, ArrowLeft, Building, Users, Car } from "lucide-react";

interface SignupPageProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onDriverDashboard: () => void;
  onMasterDashboard: () => void;
}

import { useAuth } from "./AuthContext";

export function SignupPage({ onBack, onSwitchToLogin, onDriverDashboard, onMasterDashboard }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    userType: "",
    phone: "",
    deviceId: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      setLoading(true);
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const result = await register(formData.email, formData.password, name, formData.deviceId, formData.phone);
      await refresh();
      // Navigate based on role
      if (result.user.role === 'admin') {
        onMasterDashboard();
      } else {
        onDriverDashboard();
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-green-600 hover:text-green-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับสู่หน้าหลัก
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
            <CardDescription>
              เริ่มต้นใช้งานระบบตรวจจับความเหนื่อยล้าด้วย AI
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input
                    id="firstName"
                    placeholder="กรอกชื่อของคุณ"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    placeholder="กรอกนามสกุลของคุณ"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">หมายเลขโทรศัพท์</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="กรอกหมายเลขโทรศัพท์"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">บริษัท/องค์กร</Label>
                <Input
                  id="company"
                  placeholder="กรอกชื่อบริษัทหรือองค์กร"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">ชื่ออุปกรณ์ / Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="เช่น device_01"
                  value={formData.deviceId}
                  onChange={(e) => handleInputChange("deviceId", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">ประเภทผู้ใช้งาน</Label>
                <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทผู้ใช้งาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fleet-manager">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4" />
                        <span>ผู้จัดการกลุ่มรถ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transport-company">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>บริษัทขนส่ง</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="individual-driver">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4" />
                        <span>ผู้ขับขี่รายบุคคล</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="สร้างรหัสผ่าน"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" className="mt-1 rounded" required />
                <p className="text-sm text-gray-600">
                  ฉันยอมรับ{" "}
                  <Button variant="link" className="p-0 h-auto text-green-600">
                    ข้อกำหนดการใช้งาน
                  </Button>{" "}
                  และ{" "}
                  <Button variant="link" className="p-0 h-auto text-green-600">
                    นโยบายความเป็นส่วนตัว
                  </Button>
                </p>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={onSwitchToLogin}
                >
                  เข้าสู่ระบบที่นี่
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}