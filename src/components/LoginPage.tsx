import { useState } from "react";
import { login } from "../utils/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { useAuth } from "./AuthContext";

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
  const { refresh } = useAuth();

  // Forgot password states
  const [forgotPasswordMode, setForgotPasswordMode] = useState<'login' | 'request' | 'verify' | 'success'>('login');
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:8080/api' 
      : 'https://driver-drowsiness-api.onrender.com/api');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      console.log("Logged in", result);
      await refresh();
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

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }
      
      setForgotSuccess('รหัสยืนยันถูกส่งไปยังอีเมลของคุณแล้ว (สำหรับ demo: ' + data.code + ')');
      setForgotPasswordMode('verify');
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    
    if (newPassword !== confirmNewPassword) {
      setForgotError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    if (newPassword.length < 6) {
      setForgotError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    
    setForgotLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail, 
          code: resetCode, 
          new_password: newPassword 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }
      
      setForgotPasswordMode('success');
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setForgotPasswordMode('login');
    setForgotEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotError(null);
    setForgotSuccess(null);
  };

  // Forgot Password - Request Code
  if (forgotPasswordMode === 'request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={resetForgotPassword}
            className="mb-6 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </Button>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
              <CardDescription>
                กรอกอีเมลของคุณเพื่อรับรหัสยืนยัน
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">อีเมล</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="กรอกอีเมลที่ลงทะเบียนไว้"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                {forgotError && (
                  <p className="text-sm text-red-600">{forgotError}</p>
                )}
                
                <Button type="submit" disabled={forgotLoading} className="w-full bg-orange-500 hover:bg-orange-600">
                  {forgotLoading ? 'กำลังส่ง...' : 'ส่งรหัสยืนยัน'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot Password - Verify & Reset
  if (forgotPasswordMode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => setForgotPasswordMode('request')}
            className="mb-6 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-lg mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">ตั้งรหัสผ่านใหม่</CardTitle>
              <CardDescription>
                กรอกรหัสยืนยันและรหัสผ่านใหม่ของคุณ
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {forgotSuccess && (
                <p className="text-sm text-green-600 mb-4 p-2 bg-green-50 rounded">{forgotSuccess}</p>
              )}
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-code">รหัสยืนยัน (6 หลัก)</Label>
                  <Input
                    id="reset-code"
                    type="text"
                    placeholder="กรอกรหัส 6 หลัก"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="กรอกรหัสผ่านใหม่"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">ยืนยันรหัสผ่านใหม่</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>

                {forgotError && (
                  <p className="text-sm text-red-600">{forgotError}</p>
                )}
                
                <Button type="submit" disabled={forgotLoading} className="w-full bg-green-500 hover:bg-green-600">
                  {forgotLoading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot Password - Success
  if (forgotPasswordMode === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-lg mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">รีเซ็ตรหัสผ่านสำเร็จ!</CardTitle>
              <CardDescription>
                รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button onClick={resetForgotPassword} className="w-full bg-blue-600 hover:bg-blue-700">
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Login Form (default)

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
                    className="pr-10"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-transparent"
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span>จดจำการเข้าสู่ระบบ</span>
                </label>
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto text-sm text-blue-600"
                  onClick={() => setForgotPasswordMode('request')}
                >
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