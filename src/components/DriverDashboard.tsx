import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Eye, 
  AlertTriangle, 
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
  // State for Tabs
  const [activeTab, setActiveTab] = useState("alerts");
  
  // Real-time driver status via polling
  const [alertLevel, setAlertLevel] = useState("ปกติ"); 
  const [drivingStatus, setDrivingStatus] = useState("พร้อมขับขี่"); 
  const [latestStatus, setLatestStatus] = useState<{ drowsiness_level?: string; status?: string }|null>(null);

  useEffect(() => {
    let mounted = true;
    const deviceId = "device_01"; // TODO: make dynamic per user/device
    const fetchLatest = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/devices/${deviceId}/data`, {
          headers: { "Cache-Control": "no-cache" }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setLatestStatus({ drowsiness_level: data.drowsiness_level, status: data.status });
        // Map backend fields to UI labels
        const level = (data.drowsiness_level || "low").toLowerCase();
        if (level === "high") {
          setAlertLevel("อันตราย");
          setDrivingStatus("ควรพักทันที");
        } else if (level === "medium") {
          setAlertLevel("ระวัง");
          setDrivingStatus("เฝ้าระวัง");
        } else {
          setAlertLevel("ปกติ");
          setDrivingStatus("พร้อมขับขี่");
        }
      } catch (e) {
        // swallow transient errors
      }
    };
    fetchLatest();
    const timer = setInterval(fetchLatest, 5000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  // TODO: Replace with API call to fetch driver statistics from backend
  const driverStats = {
    alertsToday: 2,
    avgDriveTime: "6.5 ชั่วโมง",
    lastAlert: "2 ชั่วโมงที่แล้ว",
    safetyScore: 94
  };

  // TODO: Replace with API call to fetch recent alerts from database
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
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-9 px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">Dashboard ผู้ขับขี่</h1>
                  <p className="text-sm text-slate-600">สวัสดี, คุณสมชาย ใจดี</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                drivingStatus === "พร้อมขับขี่" 
                  ? "border-transparent bg-green-100 text-green-800 hover:bg-green-200" 
                  : "border-transparent bg-red-100 text-red-800 hover:bg-red-200"
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {drivingStatus}
              </span>
              <button 
                onClick={onProfile}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-slate-100 h-8 px-3 text-xs"
              >
                <Settings className="w-4 h-4 mr-2" />
                ตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Grid Layout: Status (Left 2/3) & Alerts (Right 1/3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* 1. Status Card */}
          <div className="lg:col-span-2 rounded-xl border border-l-4 border-l-green-500 bg-green-50 shadow text-slate-950 flex flex-col justify-center">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">สถานะล่าสุด</h3>
                    <p className="text-green-700">{latestStatus?.status || "ไม่พบสัญญาณความเหนื่อยล้า"}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-transparent bg-green-600 text-white px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-green-700 shrink-0 ml-2">
                  สถานะ: {alertLevel}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Today's Alert Summary Card */}
          <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 text-slate-950 shadow">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold leading-none tracking-tight text-sm text-orange-700">การแจ้งเตือนวันนี้</h3>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-3xl font-bold text-orange-900 mb-2">{driverStats.alertsToday}</div>
              <div className="text-sm text-orange-600">ครั้ง</div>
              <div className="text-xs text-orange-500 mt-1">ล่าสุด: {driverStats.lastAlert}</div>
            </div>
          </div>

        </div>

        {/* --- Tabs Section --- */}
        <div className="space-y-6">
          {/* Custom Tabs List */}
          <div className="grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1 text-slate-500 border">
            <button
              onClick={() => setActiveTab("alerts")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "alerts" 
                  ? "bg-white text-slate-950 shadow-sm" 
                  : "hover:bg-slate-200/50 hover:text-slate-900"
              }`}
            >
              การแจ้งเตือนล่าสุด
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "history" 
                  ? "bg-white text-slate-950 shadow-sm" 
                  : "hover:bg-slate-200/50 hover:text-slate-900"
              }`}
            >
              ประวัติวันนี้
            </button>
          </div>

          {/* Tab Content: Alerts */}
          {activeTab === "alerts" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="rounded-xl border bg-white shadow-lg border-0 text-slate-950">
                <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold leading-none tracking-tight">การแจ้งเตือนวันนี้</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    รายการการแจ้งเตือนจากระบบตรวจจับความเหนื่อยล้า
                  </p>
                </div>
                <div className="p-6">
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
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: History */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="rounded-xl border bg-card text-card-foreground shadow text-slate-950">
                <div className="flex flex-col space-y-1.5 p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-semibold leading-none tracking-tight">ประวัติการขับขี่วันนี้</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    สรุปประสิทธิภาพการขับขี่ในวันนี้
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-6">
                    {/* Today Performance Chart */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900">ประสิทธิภาพการขับขี่วันนี้</h4>
                      <div className="h-64 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200">
                        <div className="h-full flex flex-col">
                          {/* Timeline Header */}
                          <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h5 className="font-medium text-slate-700 text-[11px] sm:text-xs">แนวโน้มการแจ้งเตือนวันนี้</h5>
                            <div className="text-[10px] sm:text-xs text-slate-500">06:00-24:00 น.</div>
                          </div>
                          
                          {/* Timeline Chart Mockup */}
                          <div className="flex-1 flex items-end justify-center overflow-hidden">
                            <div className="w-full">
                              <div className="flex items-end justify-between space-x-1 sm:space-x-2 lg:space-x-3 h-32 px-1">
                                {/* Bar 1 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-6 bg-green-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">06-09</div>
                                </div>
                                {/* Bar 2 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-8 bg-green-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">09-12</div>
                                </div>
                                {/* Bar 3 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-16 bg-orange-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">12-15</div>
                                </div>
                                {/* Bar 4 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-20 bg-orange-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">15-18</div>
                                </div>
                                {/* Bar 5 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-4 bg-green-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">18-21</div>
                                </div>
                                {/* Bar 6 */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className="w-full max-w-[28px] lg:w-8 h-4 bg-green-400 rounded-t-lg mb-1"></div>
                                  <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-600 whitespace-nowrap">21-24</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
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
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900">รูปแบบความเหนื่อยล้าตามช่วงเวลา</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>06:00-12:00</span>
                          <span className="text-green-600">ปกติ (2 ครั้ง)</span>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-full h-2 bg-green-100">
                          <div className="h-full w-full flex-1 bg-green-500 transition-all" style={{ width: '25%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>12:00-18:00</span>
                          <span className="text-orange-600">ระวัง (4 ครั้ง)</span>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-full h-2 bg-orange-100">
                          <div className="h-full w-full flex-1 bg-orange-500 transition-all" style={{ width: '50%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>18:00-24:00</span>
                          <span className="text-red-600">เสี่ยง (2 ครั้ง)</span>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-full h-2 bg-red-100">
                          <div className="h-full w-full flex-1 bg-red-500 transition-all" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
