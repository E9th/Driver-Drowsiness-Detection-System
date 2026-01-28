import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
// import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  // TrendingUp, 
  // TrendingDown,
  // Settings,
  Bell,
  Shield,
  Activity,
  Car,
  // MapPin,
  Clock,
  BarChart3,
  // Eye,
  // Download,
  // Save,
  // FileText,
  // Calendar,
  // Hash
} from "lucide-react";
import { getToken } from "../utils/auth";

interface MasterDashboardProps {
  onBack: () => void;
}

export function MasterDashboard({ onBack }: MasterDashboardProps) {

  const [driverOverview, setDriverOverview] = useState<{
    totalDrivers: number;
    activeDrivers: number;
    totalDevices: number;
    alertsToday: number;
    criticalAlertsToday: number;
  }>({
    totalDrivers: 0,
    activeDrivers: 0,
    totalDevices: 0,
    alertsToday: 0,
    criticalAlertsToday: 0,
  });

  // const overallStats = {
  //   totalDrivers: 48,
  //   activeDrivers: 36,
  //   alertsToday: 15,
  //   criticalAlerts: 3,
  //   totalFleet: 52,
  //   bannedDrivers: 2
  // };

  const [alertSlots, setAlertSlots] = useState<Array<{ label: string; count: number }>>([]);
  const [peakSlot, setPeakSlot] = useState<string>("");
  const [peakCount, setPeakCount] = useState<number>(0);
  const riskSlots = useMemo(() => {
    const baseLabels = [
      "06-08",
      "08-10",
      "10-12",
      "12-14",
      "14-16",
      "16-18",
      "18-20",
      "20-22",
      "22-24",
    ];
    const countMap = new Map(alertSlots.map((s) => [s.label, s.count] as [string, number]));
    return baseLabels.map((label) => ({
      label,
      count: countMap.get(label) ?? 0,
    }));
  }, [alertSlots]);

  // ดึงข้อมูลผู้ขับขี่ทั้งหมด + จำนวนที่กำลังขับขี่จาก backend (PostgreSQL)
  useEffect(() => {
    const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || 
      (window.location.hostname === 'localhost' 
        ? 'http://localhost:8080/api' 
        : 'https://driver-drowsiness-api.onrender.com/api');

    async function fetchOverview() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/overview`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setDriverOverview({
          totalDrivers: typeof data.total_drivers === "number" ? data.total_drivers : 0,
          activeDrivers: typeof data.active_drivers === "number" ? data.active_drivers : 0,
          totalDevices: typeof data.total_devices === "number" ? data.total_devices : 0,
          alertsToday: typeof data.alerts_today === "number" ? data.alerts_today : 0,
          criticalAlertsToday:
            typeof data.critical_alerts_today === "number" ? data.critical_alerts_today : 0,
          });
      } catch {
        // fallback: ไม่ทำอะไร ปล่อยให้ค่า default เป็น 0
      }
    }

    async function fetchDrivers() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/drivers`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setDriverList(Array.isArray(data.drivers) ? data.drivers : []);
      } catch {
        // fallback: keep current list
      }
    }

    async function fetchRecentAlerts() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/recent-alerts?limit=20`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.alerts)) {
          setRecentAlerts(
            data.alerts.map((a: any) => ({
              time: typeof a.time === "string" ? a.time : "-",
              driver: typeof a.driver === "string" ? a.driver : "ไม่ทราบชื่อ",
              type: typeof a.type === "string" ? a.type : "สถานะไม่ทราบ",
              severity: typeof a.severity === "string" ? a.severity : "info",
              vehicleId: typeof a.vehicleId === "string" ? a.vehicleId : "-",
              source: typeof a.source === "string" ? a.source : "real",
            }))
          );
        }
      } catch {
        // fallback: keep current list
      }
    }
    async function fetchAlertSlots() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/alert-slots`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.slots)) {
          setAlertSlots(
            data.slots.map((s: any) => ({
              label: String(s.label ?? ""),
              count: typeof s.count === "number" ? s.count : 0,
            }))
          );
        }
        if (typeof data.peak_slot === "string") setPeakSlot(data.peak_slot);
        if (typeof data.peak_count === "number") setPeakCount(data.peak_count);
      } catch {
        // keep current slots
      }
    }

    async function fetchAlertLevels() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/alert-levels`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAlertLevels({
          highPct: typeof data.high_pct === "number" ? data.high_pct : 0,
          mediumPct: typeof data.medium_pct === "number" ? data.medium_pct : 0,
          safePct: typeof data.safe_pct === "number" ? data.safe_pct : 100,
          highCount: typeof data.high_count === "number" ? data.high_count : 0,
          mediumCount:
            typeof data.medium_count === "number" ? data.medium_count : 0,
        });
      } catch {
        // keep current alertLevels
      }
    }

    fetchOverview();
    fetchDrivers();
    fetchRecentAlerts();
    fetchAlertSlots();
    fetchAlertLevels();
    const overviewId = setInterval(fetchOverview, 1000); // รีเฟรช overview ทุก 1 วินาที
    const driversId = setInterval(fetchDrivers, 1000); // รีเฟรชรายการผู้ขับขี่ทุก 1 วินาที
    const alertsId = setInterval(fetchRecentAlerts, 1000); // รีเฟรชการแจ้งเตือนล่าสุดทุก 1 วินาที
    const slotsId = setInterval(fetchAlertSlots, 1000); // รีเฟรชข้อมูล slot ทุก 1 วินาที
    const levelsId = setInterval(fetchAlertLevels, 1000); // รีเฟรชข้อมูลสัดส่วนระดับทุก 1 วินาที
    return () => {
      clearInterval(overviewId);
      clearInterval(driversId);
      clearInterval(alertsId);
      clearInterval(slotsId);
      clearInterval(levelsId);
    };
  }, []);

  type AdminDriverRow = {
    id: string;
    name: string;
    device_id: string;
    is_online: boolean;
    critical_alerts_today: number;
    source: string;
  };

  const [driverList, setDriverList] = useState<AdminDriverRow[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverPageSize, setDriverPageSize] = useState<number>(10);

  const filteredDrivers = useMemo(() => {
    const q = driverSearch.trim().toLowerCase();
    const base = q
      ? driverList.filter((d) => {
          const name = (d.name || "").toLowerCase();
          const dev = (d.device_id || "").toLowerCase();
          return name.includes(q) || dev.includes(q);
        })
      : driverList;
    return base.slice(0, driverPageSize);
  }, [driverList, driverSearch, driverPageSize]);

  type RecentAlert = {
    time: string;
    driver: string;
    type: string;
    severity: string;
    vehicleId: string;
    source: string;
  };

  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [alertPageSize, setAlertPageSize] = useState<number>(10);
  const [alertLevels, setAlertLevels] = useState<{
    highPct: number;
    mediumPct: number;
    safePct: number;
    highCount: number;
    mediumCount: number;
  } | null>(null);

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
        {/* Critical Alerts Banner removed as requested */}

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
              <div className="text-2xl font-bold text-slate-900">{driverOverview.totalDrivers}</div>
              <div className="text-sm text-green-600 flex items-center space-x-1">
                <span>กำลังขับขี่: {driverOverview.activeDrivers} คน</span>
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
	              <div className="text-2xl font-bold text-slate-900">{driverOverview.totalDevices}</div>
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
	              <div className="text-2xl font-bold text-orange-600">{driverOverview.alertsToday}</div>
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>รายชื่อผู้ขับขี่</span>
                      <Badge variant="outline">{driverList.length} คน</Badge>
                    </CardTitle>
                    <CardDescription>
                      สถานะและประสิทธิภาพผู้ขับขี่ในเวลาจริง
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>แสดง</span>
                      {[5, 10, 15, 50, 100].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setDriverPageSize(n)}
                          className={`h-7 px-2 rounded border text-xs transition ${
                            driverPageSize === n
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <span>รายการ</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={driverSearch}
                        onChange={(e) => setDriverSearch(e.target.value)}
                        placeholder="ค้นหาชื่อหรือรหัสรถ..."
                        className="h-9 w-full sm:w-56 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                  </div>
                </div>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDrivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-medium">{driver.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{driver.device_id || "-"}</TableCell>
                          <TableCell>
                            <Badge className={driver.is_online ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {driver.is_online ? "ออนไลน์" : "ออฟไลน์"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={driver.critical_alerts_today > 0 ? 'text-red-600 font-medium' : 'text-slate-900'}>
                                {driver.critical_alerts_today}
                              </span>
                              {driver.critical_alerts_today > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>การแจ้งเตือนล่าสุด</span>
                    </CardTitle>
                    <CardDescription>
                      รายการการแจ้งเตือนจากระบบตรวจจับความเหนื่อยล้าทั้งหมด
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>แสดง</span>
                    {[5, 10, 15].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAlertPageSize(n)}
                        className={`h-7 px-2 rounded border text-xs transition ${
                          alertPageSize === n
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span>รายการ</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.slice(0, alertPageSize).map((alert, index) => (
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
                      <div className="text-sm text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.time}</span>
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
                    <div className="w-full h-full flex flex-col">
                      <div className="text-center space-y-1 mb-3">
                        <Clock className="w-10 h-10 text-blue-500 mx-auto" />
                        <p className="font-medium text-slate-700">ช่วงเวลาที่มีการแจ้งเตือนระดับสูงมากที่สุด</p>
                        {peakSlot && peakCount > 0 ? (
                          <p className="text-sm text-slate-500">
                            {peakSlot} น. ({peakCount} ครั้ง)
                          </p>
                        ) : (
                          <p className="text-sm text-slate-500">ยังไม่มีข้อมูลการแจ้งเตือน</p>
                        )}
                      </div>
                      <div className="flex-1 flex items-end justify-center text-xs">
                        <div className="w-full overflow-x-auto">
                          <div className="flex items-end justify-center gap-3 min-w-[360px]">
                            {(() => {
                              const slots = alertSlots.length
                                ? alertSlots
                                : [
                                    { label: "06-08", count: 0 },
                                    { label: "08-10", count: 0 },
                                    { label: "10-12", count: 0 },
                                    { label: "12-14", count: 0 },
                                    { label: "14-16", count: 0 },
                                    { label: "16-18", count: 0 },
                                    { label: "18-20", count: 0 },
                                    { label: "20-22", count: 0 },
                                    { label: "22-24", count: 0 },
                                  ];
                              const max = Math.max(1, ...slots.map((s) => s.count));
                              return slots.map((s) => {
                                const h = s.count === 0 ? 4 : 8 + (s.count / max) * 56;
                                const isPeak = peakSlot === s.label && peakCount > 0;
                                return (
                                  <div key={s.label} className="flex flex-col items-center min-w-[30px]">
                                    <div
                                      className={`w-2 rounded-full mb-1 ${
                                        isPeak ? "bg-red-500" : "bg-orange-400"
                                      }`}
                                      style={{ height: `${h}px` }}
                                    />
                                    <div className="text-[10px] text-slate-600">{s.label}</div>
                                    <div className="text-[10px] text-slate-500">{s.count}</div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
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
                            <div className="text-2xl font-bold text-slate-700">
                              {(() => {
                                const high = alertLevels ? Math.round(alertLevels.highPct) : 0;
                                return `${high}%`;
                              })()}
                            </div>
                            <div className="text-xs text-slate-500">ด่วน</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-8 space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                        <span className="text-sm">
                          {(() => {
                            const pct = alertLevels ? Math.round(alertLevels.mediumPct) : 0;
                            return `เตือน (${pct}%)`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-sm">
                          {(() => {
                            const pct = alertLevels ? Math.round(alertLevels.highPct) : 0;
                            return `ด่วน (${pct}%)`;
                          })()}
                        </span>
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
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>ช่วงเวลาเสี่ยงวันนี้</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {riskSlots.map((slot) => {
                      const colorClass =
                        slot.count >= 6
                          ? "text-red-600"
                          : slot.count >= 3
                          ? "text-orange-600"
                          : "text-green-600";
                      return (
                        <div key={slot.label} className="flex justify-between text-sm">
                          <span>{slot.label.replace("-", ":00-") + ":00"}</span>
                          <span className={`${colorClass} font-medium`}>{slot.count} ครั้ง</span>
                        </div>
                      );
                    })}
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