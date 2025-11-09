import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  ArrowLeft, 
  Eye, 
  AlertTriangle, 
  Clock, 
  Activity,
  Settings,
  Bell,
  Shield,
  Car
} from "lucide-react";

interface DriverDashboardProps {
  onBack: () => void;
  onProfile: () => void;
}

export function DriverDashboard({ onBack, onProfile }: DriverDashboardProps) {
  // TODO: Replace with API call to get real-time driver status
  const [alertLevel, setAlertLevel] = useState("ปกติ");
  const [drivingStatus, setDrivingStatus] = useState("พร้อมขับขี่");

  // TODO: Replace with API call to fetch driver statistics from backend
  const driverStats = {
    alertsToday: 2,
    avgDriveTime: "6.5 ชั่วโมง",
    lastAlert: "2 ชั่วโมงที่แล้ว",
    safetyScore: 94
  };

  // TODO: Replace with API call to fetch recent alerts from database
  // Only includes: ปกติ, พบภาวะง่วงนอน, อันตราย
  const recentAlerts = [
    { time: "14:30", type: "พบภาวะง่วงนอน", severity: "warning" },
    { time: "11:15", type: "อันตราย", severity: "danger" },
    { time: "09:45", type: "ปกติ", severity: "success" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div>
                  {/* TODO: Replace with real user data from authentication context */}
                  <h1 className="text-lg font-medium">Dashboard ผู้ขับขี่</h1>
                  <p className="text-sm text-slate-600">สวัสดี, คุณสมชาย ใจดี</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* TODO: Update badge color based on real-time driving status from API */}
              <Badge 
                variant={drivingStatus === "พร้อมขับขี่" ? "default" : "destructive"}
                className="bg-green-100 text-green-800"
              >
                <Shield className="w-3 h-3 mr-1" />
                {drivingStatus}
              </Badge>
              <Button variant="outline" size="sm" onClick={onProfile}>
                <Settings className="w-4 h-4 mr-2" />
                ตั้งค่า
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Status */}
        {/* TODO: Update alert status based on real-time data from drowsiness detection system */}
        <div className="mb-8">
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">ระบบตรวจจับทำงานปกติ</h3>
                    <p className="text-green-700">ไม่พบสัญญาณความเหนื่อยล้า - ขับขี่อย่างปลอดภัย</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  สถานะ: {alertLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        {/* TODO: All stats should be fetched from API endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* TODO: Fetch safety score from ML model analysis */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">คะแนนความปลอดภัย</CardTitle>
                <Shield className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 mb-2">{driverStats.safetyScore}/100</div>
              <Progress value={driverStats.safetyScore} className="h-3 bg-green-100" />
              <div className="text-xs text-green-600 mt-2">ระดับดีเยี่ยม</div>
            </CardContent>
          </Card>

          {/* TODO: Calculate average driving time from database records */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">เวลาขับขี่เฉลี่ย</CardTitle>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-2">{driverStats.avgDriveTime}</div>
              <div className="text-sm text-blue-600">ต่อวัน</div>
              <div className="text-xs text-blue-500 mt-1">ภายในขีดจำกัดที่แนะนำ</div>
            </CardContent>
          </Card>

          {/* TODO: Count alerts from today's database records */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700">การแจ้งเตือนวันนี้</CardTitle>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-2">{driverStats.alertsToday}</div>
              <div className="text-sm text-orange-600">ครั้ง</div>
              <div className="text-xs text-orange-500 mt-1">ล่าสุด: {driverStats.lastAlert}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm border">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">การแจ้งเตือนล่าสุด</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">ประวัติวันนี้</TabsTrigger>
          </TabsList>

          {/* TODO: Fetch alerts from API endpoint */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg p-6">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span>การแจ้งเตือนวันนี้</span>
                </CardTitle>
                <CardDescription>
                  รายการการแจ้งเตือนจากระบบตรวจจับความเหนื่อยล้า
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full shadow-sm ${
                          alert.severity === 'warning' ? 'bg-orange-500' :
                          alert.severity === 'danger' ? 'bg-red-500' :
                          alert.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <div className="font-medium text-slate-800">{alert.type}</div>
                          <div className="text-xs text-slate-500">
                            {alert.severity === 'warning' ? 'ระดับเตือน' :
                             alert.severity === 'danger' ? 'ระดับอันตราย' :
                             alert.severity === 'success' ? 'สถานะปกติ' : 'ข้อมูลทั่วไป'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full border">
                        {alert.time}
                      </div>
                    </div>
                  ))}
                </div>
                {recentAlerts.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p>ไม่มีการแจ้งเตือนในวันนี้</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TODO: Fetch daily history data from API */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>ประวัติการขับขี่วันนี้</span>
                </CardTitle>
                <CardDescription>
                  สรุปประสิทธิภาพการขับขี่ในวันนี้
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Today Performance Chart */}
                  {/* TODO: Generate chart data from hourly alert statistics */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">ประสิทธิภาพการขับขี่วันนี้</h4>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200">
                      <div className="h-full flex flex-col">
                        {/* Timeline Header */}
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                          <h5 className="font-medium text-slate-700 text-[11px] sm:text-xs">แนวโน้มการแจ้งเตือนวันนี้</h5>
                          <div className="text-[10px] sm:text-xs text-slate-500">06:00-24:00 น.</div>
                        </div>
                        
                        {/* Timeline Chart */}
                        {/* TODO: Replace with real chart library and API data */}
                        <div className="flex-1 flex items-end justify-center overflow-hidden">
                          <div className="w-full">
                            <div className="flex items-end justify-between space-x-1 sm:space-x-2 lg:space-x-3 h-32 px-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-6 bg-green-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">06-09</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">0</div>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-8 bg-green-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">09-12</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">0</div>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-16 bg-orange-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">12-15</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">1</div>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-20 bg-orange-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">15-18</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">1</div>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-4 bg-green-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">18-21</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">0</div>
                              </div>
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-full max-w-[28px] sm:max-w-[32px] lg:max-w-none lg:w-8 h-4 bg-green-400 rounded-t-lg mb-1"></div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">21-24</div>
                                <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500">0</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Summary */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 pt-3 border-t border-slate-200 gap-2">
                          <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-[10px] sm:text-xs text-slate-600">ปกติ</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              <span className="text-[10px] sm:text-xs text-slate-600">เตือน</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                              <span className="text-[10px] sm:text-xs text-slate-600">อันตราย</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xs sm:text-sm font-medium text-slate-700">รวม 2 ครั้ง</div>
                            <div className="text-[10px] sm:text-xs text-slate-500">การแจ้งเตือนวันนี้</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  {/* TODO: Calculate stats from today's driving session data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">เวลาขับขี่วันนี้</div>
                      <div className="text-2xl font-bold text-blue-900">6.5 ชั่วโมง</div>
                      <div className="text-xs text-blue-600">เริ่มเวลา 06:00 น.</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-600 mb-1">การแจ้งเตือนวันนี้</div>
                      <div className="text-2xl font-bold text-orange-900">2 ครั้ง</div>
                      <div className="text-xs text-orange-600">ครั้งล่าสุด 14:30 น.</div>
                    </div>
                  </div>

                  {/* Drowsiness Pattern */}
                  {/* TODO: Analyze patterns from historical data using ML */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900">รูปแบบความเหนื่อยล้าตามช่วงเวลา</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>06:00-12:00</span>
                        <span className="text-green-600">ปกติ (2 ครั้ง)</span>
                      </div>
                      <Progress value={25} className="h-2 bg-green-100" />
                      
                      <div className="flex justify-between text-sm">
                        <span>12:00-18:00</span>
                        <span className="text-orange-600">ระวัง (4 ครั้ง)</span>
                      </div>
                      <Progress value={50} className="h-2 bg-orange-100" />
                      
                      <div className="flex justify-between text-sm">
                        <span>18:00-24:00</span>
                        <span className="text-red-600">เสี่ยง (2 ครั้ง)</span>
                      </div>
                      <Progress value={25} className="h-2 bg-red-100" />
                    </div>
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