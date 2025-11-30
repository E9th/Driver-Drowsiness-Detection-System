import { useState } from "react";
import { login } from "../utils/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

interface LoginPageProps {
  onBack: () => void;
  onSwitchToSignup: () => void;
  onDriverDashboard: () => void;
  onMasterDashboard: () => void;
}

export function LoginPage({ onBack, onSwitchToSignup, onDriverDashboard, onMasterDashboard }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      console.log("Logged in", result);
      // Decide dashboard based on role (driver/admin)
      if (result.user.role === 'driver') {
        onDriverDashboard();
      } else {
        onMasterDashboard();
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับสู่หน้าหลัก
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบเพื่อใช้งานระบบตรวจจับความเหนื่อยล้า
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>
                <Button variant="link" className="p-0 h-auto text-sm text-blue-600">
                  ลืมรหัสผ่าน?
                </Button>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            {/* Demo Buttons */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">ทดลองใช้งาน (Demo)</p>
              </div>
              <Button 
                onClick={onDriverDashboard}
                variant="outline" 
                className="w-full border-green-200 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                เข้าสู่ Dashboard ผู้ขับขี่
              </Button>
              <Button 
                onClick={onMasterDashboard}
                variant="outline" 
                className="w-full border-purple-200 hover:bg-purple-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                เข้าสู่ Master Dashboard (Admin)
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 hover:text-blue-700"
                  onClick={onSwitchToSignup}
                >
                  สมัครสมาชิกที่นี่
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}