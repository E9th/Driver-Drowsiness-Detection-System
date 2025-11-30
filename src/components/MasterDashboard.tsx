import { useState } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Settings,
  Bell,
  Shield,
  Activity,
  Car,
  MapPin,
  Clock,
  BarChart3,
  Eye,
  Download,
  Edit,
  UserX,
  UserCheck,
  Save,
  FileText,
  Calendar,
  Hash
} from "lucide-react";

interface MasterDashboardProps {
  onBack: () => void;
}

export function MasterDashboard({ onBack }: MasterDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [showSettings, setShowSettings] = useState(false);
  const [showExportReport, setShowExportReport] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  // Mock data - ปรับให้เหมาะกับข้อมูลรายวัน
  const overallStats = {
    totalDrivers: 48,
    activeDrivers: 36,
    alertsToday: 15,
    criticalAlerts: 3,
    totalFleet: 52,
    bannedDrivers: 2 // ผู้ขับขี่ที่ถูกแบน
  };

  const [driverList, setDriverList] = useState([
    { id: 1, name: "สมชาย ใจดี", vehicleId: "ABC-1234", status: "ขับขี่", alerts: 0, safetyScore: 98, location: "ถนนสุขุมวิท", email: "somchai@email.com", isBanned: false },
    { id: 2, name: "สมหญิง รักดี", vehicleId: "DEF-5678", status: "พักผ่อน", alerts: 1, safetyScore: 95, location: "ถนนพหลโยธิน", email: "somying@email.com", isBanned: false },
    { id: 3, name: "วิชัย มั่นคง", vehicleId: "GHI-9012", status: "ขับขี่", alerts: 2, safetyScore: 88, location: "ถนนรามคำแหง", email: "wichai@email.com", isBanned: false },
    { id: 4, name: "สุพล แข็งแรง", vehicleId: "JKL-3456", status: "เตือนภัย", alerts: 5, safetyScore: 45, location: "ถนนลาดพร้าว", email: "supon@email.com", isBanned: true }, // แบนอัตโนมัติเพราะคะแนนต่ำกว่า 50
    { id: 5, name: "มานะ อุตสาห์", vehicleId: "MNO-7890", status: "ขับขี่", alerts: 1, safetyScore: 92, location: "ถนนวิภาวดี", email: "mana@email.com", isBanned: false },
    { id: 6, name: "ปิยะ สุขใส", vehicleId: "PQR-1357", status: "แบน", alerts: 8, safetyScore: 38, location: "-", email: "piya@email.com", isBanned: true } // แบนอัตโนมัติ
  ]);

  // ลบประเภท "การยืดตัว" ออกตามที่ระบุ
  const recentAlerts = [
    { time: "15:45", driver: "สุพล แข็งแรง", type: "ความเหนื่อยล้าสูง", severity: "critical", vehicleId: "JKL-3456" },
    { time: "14:30", driver: "วิชัย มั่นคง", type: "เหนื่อยล้าเล็กน้อย", severity: "warning", vehicleId: "GHI-9012" },
    { time: "13:15", driver: "สมหญิง รักดี", type: "เหนื่อยล้าเล็กน้อย", severity: "warning", vehicleId: "DEF-5678" },
    { time: "11:20", driver: "มานะ อุตสาห์", type: "เหนื่อยล้าเล็กน้อย", severity: "warning", vehicleId: "MNO-7890" },
    { time: "10:05", driver: "สมชาย ใจดี", type: "ปกติ", severity: "success", vehicleId: "ABC-1234" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ขับขี่': return 'bg-green-100 text-green-800';
      case 'พักผ่อน': return 'bg-blue-100 text-blue-800';
      case 'เตือนภัย': return 'bg-red-100 text-red-800';
      case 'แบน': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDriverUpdate = (updatedDriver: any) => {
    setDriverList(drivers => 
      drivers.map(driver => 
        driver.id === updatedDriver.id ? updatedDriver : driver
      )
    );
    setSelectedDriver(null);
    setShowSettings(false);
  };

  const handleBanToggle = (driverId: number) => {
    setDriverList(drivers => 
      drivers.map(driver => {
        if (driver.id === driverId) {
          const newStatus = driver.isBanned ? 
            (driver.safetyScore >= 50 ? "พักผ่อน" : "เตือนภัย") : "แบน";
          return {
            ...driver,
            isBanned: !driver.isBanned,
            status: newStatus
          };
        }
        return driver;
      })
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const { logoutUser } = useAuth();
  const handleLogout = () => { logoutUser(); onBack(); };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">Master Dashboard</h1>
                  <p className="text-sm text-slate-600">ระบบจัดการกลุ่มรถ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts Banner */}
        {overallStats.criticalAlerts > 0 && (
          <div className="mb-6">
            <Card className="border-l-4 border-l-red-500 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-medium text-red-900">การแจ้งเตือนด่วน</h3>
                      <p className="text-red-700">มีผู้ขับขี่ {overallStats.criticalAlerts} คน ที่ต้องการความสนใจเร่งด่วน</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    ดูรายละเอียด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Overview (removed hoursToday & safetyScore) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>ผู้ขับขี่ทั้งหมด</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overallStats.totalDrivers}</div>
              <div className="text-sm text-green-600 flex items-center space-x-1">
                <span>กำลังขับขี่: {overallStats.activeDrivers} คน</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center space-x-2">
                <Car className="w-4 h-4" />
                <span>ยานพาหนะ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{overallStats.totalFleet}</div>
              <div className="text-sm text-slate-600">
                ใช้งาน: {overallStats.activeDrivers} คัน
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>การแจ้งเตือนวันนี้</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{overallStats.alertsToday}</div>
              <div className="text-sm text-red-600">
                ด่วน: {overallStats.criticalAlerts} ครั้ง
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="drivers" className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drivers" className="text-xs sm:text-sm">ผู้ขับขี่</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs sm:text-sm">การแจ้งเตือน</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">วิเคราะห์วันนี้</TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>รายชื่อผู้ขับขี่</span>
                  <Badge variant="outline">{driverList.length} คน</Badge>
                </CardTitle>
                <CardDescription>
                  สถานะและประสิทธิภาพผู้ขับขี่ในเวลาจริง
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">ชื่อผู้ขับขี่</TableHead>
                        <TableHead className="min-w-[100px]">รหัสรถ</TableHead>
                        <TableHead className="min-w-[80px]">สถานะ</TableHead>
                        <TableHead className="min-w-[80px]">แจ้งเตือน</TableHead>
                        <TableHead className="min-w-[100px]">คะแนน</TableHead>
                        <TableHead className="min-w-[120px]">การดำเนินการ</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {driverList.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="font-medium">{driver.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{driver.vehicleId}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(driver.status)}>
                            {driver.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={driver.alerts > 3 ? 'text-red-600 font-medium' : 'text-slate-900'}>
                              {driver.alerts}
                            </span>
                            {driver.alerts > 3 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={driver.safetyScore < 80 ? 'text-red-600' : driver.safetyScore < 90 ? 'text-orange-600' : 'text-green-600'}>
                              {driver.safetyScore}
                            </span>
                            <div className="w-16">
                              <Progress value={driver.safetyScore} className="h-1" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 lg:space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setShowSettings(true);
                              }}
                              className="h-8 px-2 lg:px-3"
                            >
                              <Edit className="w-3 h-3 lg:mr-1" />
                              <span className="hidden lg:inline">แก้ไข</span>
                            </Button>
                            <Button 
                              variant={driver.isBanned ? "default" : "destructive"} 
                              size="sm"
                              onClick={() => handleBanToggle(driver.id)}
                              className="h-8 px-2 lg:px-3"
                            >
                              {driver.isBanned ? (
                                <>
                                  <UserCheck className="w-3 h-3 lg:mr-1" />
                                  <span className="hidden lg:inline">ปลดแบน</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3 lg:mr-1" />
                                  <span className="hidden lg:inline">แบน</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>การแจ้งเตือนล่าสุด</span>
                </CardTitle>
                <CardDescription>
                  รายการการแจ้งเตือนจากระบบตรวจจับความเหนื่อยล้าทั้งหมด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <div className="font-medium">{alert.type}</div>
                          <div className="text-sm text-slate-600">
                            {alert.driver} - {alert.vehicleId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.time}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
            {/* Charts Section - ปรับให้แสดงข้อมูลวันนี้ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>การแจ้งเตือนตามช่วงเวลาวันนี้</span>
                  </CardTitle>
                  <CardDescription>
                    จำนวนการแจ้งเตือนแต่ละช่วงเวลา (06:00-24:00)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-4 flex items-center justify-center border border-slate-200">
                    <div className="text-center space-y-3">
                      <Clock className="w-12 h-12 text-blue-500 mx-auto" />
                      <div>
                        <p className="font-medium text-slate-700">ช่วงเวลาที่มีการแจ้งเตือนมากที่สุด</p>
                        <p className="text-sm text-slate-500">14:00-16:00 น. (5 ครั้ง)</p>
                      </div>
                      <div className="flex justify-center space-x-3 text-xs">
                        <div className="text-center">
                          <div className="w-2 h-4 bg-green-400 rounded-full mx-auto mb-1"></div>
                          <div>06-08</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-6 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                          <div>08-10</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-8 bg-orange-400 rounded-full mx-auto mb-1"></div>
                          <div>10-12</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-12 bg-orange-400 rounded-full mx-auto mb-1"></div>
                          <div>12-14</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-16 bg-red-500 rounded-full mx-auto mb-1"></div>
                          <div>14-16</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-10 bg-orange-400 rounded-full mx-auto mb-1"></div>
                          <div>16-18</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-8 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                          <div>18-20</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-6 bg-yellow-400 rounded-full mx-auto mb-1"></div>
                          <div>20-22</div>
                        </div>
                        <div className="text-center">
                          <div className="w-2 h-8 bg-orange-400 rounded-full mx-auto mb-1"></div>
                          <div>22-24</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>การกระจายระดับการแจ้งเตือน</span>
                  </CardTitle>
                  <CardDescription>
                    สัดส่วนการแจ้งเตือนแต่ละระดับ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-40 h-40 relative">
                      {/* Donut Chart Simulation */}
                      <div className="w-full h-full rounded-full border-8 border-slate-200 relative">
                        <div className="absolute inset-0 rounded-full border-8 border-green-400 border-r-transparent border-b-transparent transform rotate-45"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-orange-400 border-l-transparent border-b-transparent transform rotate-180"></div>
                        <div className="absolute inset-0 rounded-full border-8 border-red-400 border-l-transparent border-t-transparent transform rotate-270"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-700">92%</div>
                            <div className="text-xs text-slate-500">ปลอดภัย</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm">ปกติ (67%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                        <span className="text-sm">เตือน (25%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-sm">ด่วน (8%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics - ปรับให้แสดงข้อมูลวันนี้ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>สถิติวันนี้</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">ผู้ขับขี่ปลอดภัย</span>
                      <span className="text-sm text-green-600">46/48 คน</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">คะแนนเฉลี่ยวันนี้</span>
                      <span className="text-sm text-blue-600">92 คะแนน</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">ผู้ขับขี่ที่ถูกแบน</span>
                      <span className="text-sm text-red-600">{overallStats.bannedDrivers} คน</span>
                    </div>
                    <Progress value={(overallStats.bannedDrivers / overallStats.totalDrivers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>ช่วงเวลาเสี่ยงวันนี้</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>14:00-16:00</span>
                      <span className="text-red-600 font-medium">5 ครั้ง</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>22:00-24:00</span>
                      <span className="text-orange-600 font-medium">3 ครั้ง</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>10:00-12:00</span>
                      <span className="text-yellow-600 font-medium">2 ครั้ง</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>06:00-08:00</span>
                      <span className="text-green-600 font-medium">1 ครั้ง</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500">
                      * ข้อมูลการแจ้งเตือนวันนี้ (ล้างข้อมูลทุก 00:00 น.)
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}