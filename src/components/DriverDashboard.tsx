import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { ArrowLeft, Eye, AlertTriangle, Activity, Settings, Bell, Shield, Car } from "lucide-react";

interface DriverDashboardProps {
  onBack: () => void;
  onProfile: () => void;
}

export function DriverDashboard({ onBack, onProfile }: DriverDashboardProps) {
  const { user, logoutUser } = useAuth();
  const deviceId = user?.device_id || "device_01";
  const [drivingStatus, setDrivingStatus] = useState("พร้อมขับขี่");
  const [latestStatus, setLatestStatus] = useState<{ drowsiness_level?: string; status?: string } | null>(null);
  const [allEvents, setAllEvents] = useState<Array<{ time: string; label: string; severity: string; hour: number }>>([]); // warning/danger only
  const [displayEvents, setDisplayEvents] = useState<Array<{ time: string; label: string; severity: string; hour: number }>>([]);
  const [lastCriticalAt, setLastCriticalAt] = useState<number | null>(null);
  const [alertDisplayLimit, setAlertDisplayLimit] = useState<number>(10);

  const driverStats = useMemo(() => {
    return {
      eventsToday: allEvents.length,
      lastEvent: allEvents[0]?.time || "-"
    };
  }, [allEvents]);

  // แสดงเวลาแบบ UTC HH:mm:ss ตาม schema (timestamp เก็บเป็น UTC 'Z')
  const formatTime = useCallback((iso: string) => {
    try {
      const d = new Date(iso);
      const hh = d.getUTCHours().toString().padStart(2, '0');
      const mm = d.getUTCMinutes().toString().padStart(2, '0');
      const ss = d.getUTCSeconds().toString().padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    } catch { return "-"; }
  }, []);

  // ใช้ /history แทน /data เพื่อลดจำนวน request

  // ดึง history แล้ว:
  // - กำหนด latestStatus จากแถวแรก (รวม normal ได้)
  // - สร้าง events เฉพาะ medium/high ทุก occurrence (ไม่รวม normal)
  const fetchStatusHistory = useCallback(async () => {
    try {
      const rawLimit = 300; // เพียงพอต่อวัน
      const res = await fetch(`http://localhost:8080/api/devices/${deviceId}/history?limit=${rawLimit}`);
      if (!res.ok) return;
      const data = await res.json();
      const rows = (data.data || []) as any[];
      if (rows[0]) {
        const top = rows[0];
        setLatestStatus({ drowsiness_level: top.drowsiness_level, status: top.status });
        const levelTop = (top.drowsiness_level || '').toLowerCase();
        if (levelTop === 'high') setDrivingStatus('ควรพักทันที');
        else if (levelTop === 'medium') setDrivingStatus('เฝ้าระวัง');
        else setDrivingStatus('พร้อมขับขี่');
      }
      const events: Array<{ time: string; label: string; severity: string; hour: number }> = [];
      for (const r of rows) {
        const level = (r.drowsiness_level || '').toLowerCase();
        if (level === 'medium' || level === 'high') {
          const tStr = formatTime(r.timestamp);
          const hour = parseInt(tStr.split(':')[0], 10);
          events.push({
            time: tStr,
            label: level === 'medium' ? 'ระวัง' : 'อันตราย',
            severity: level === 'medium' ? 'warning' : 'danger',
            hour
          });
        }
      }
      setAllEvents(events);
      setDisplayEvents(events.slice(0, alertDisplayLimit));
      if (events[0] && events[0].severity === 'danger') {
        const now = Date.now();
        if (lastCriticalAt === null || (now - lastCriticalAt) > (2 * 60 * 1000)) {
          setLastCriticalAt(now);
        }
      }
    } catch {}
  }, [deviceId, formatTime, lastCriticalAt, alertDisplayLimit]);

  // Initial fetch
  useEffect(() => {
    fetchStatusHistory();
  }, [fetchStatusHistory]);

  // Adaptive polling unified (history only)
  useEffect(() => {
    const CRITICAL_BOOST_MS = 2 * 60 * 1000;
    const now = Date.now();
    const inCriticalWindow = lastCriticalAt !== null && (now - lastCriticalAt) < CRITICAL_BOOST_MS;
    const intervalMs = inCriticalWindow ? 5000 : 30000;
    const t = setInterval(fetchStatusHistory, intervalMs);
    return () => clearInterval(t);
  }, [fetchStatusHistory, lastCriticalAt]);

  const handleLogout = () => { logoutUser(); onBack(); };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
            <div className="flex flex-wrap items-center gap-3">
              <button aria-label="ออกจากระบบ" onClick={handleLogout} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-9 px-4 py-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-2" />ออกจากระบบ
              </button>
              <div className="hidden sm:block h-6 w-px bg-slate-300" />
              <div className="flex items-center space-x-3 pr-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-medium">Dashboard ผู้ขับขี่</h1>
                  <p className="text-xs sm:text-sm text-slate-600">สวัสดี, {user?.name || "ผู้ขับขี่"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ${
                drivingStatus === "พร้อมขับขี่" ? "border-transparent bg-green-100 text-green-800" : "border-transparent bg-red-100 text-red-800"
              }`}>
                <Shield className="w-3 h-3 mr-1" />{drivingStatus}
              </span>
              <button aria-label="ตั้งค่า" onClick={onProfile} className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium border bg-background shadow-sm hover:bg-slate-100 h-8 px-3">
                <Settings className="w-4 h-4 mr-2" />ตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {(() => {
            const levelKey = (latestStatus?.drowsiness_level || "low").toLowerCase();
            const themes: Record<string, { border: string; bg: string; iconBg: string; iconColor: string; title: string; text: string; pillBg: string; pillText: string; pillLabel: string } > = {
              low: {
                border: "border-l-green-500",
                bg: "bg-green-50",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
                title: "text-green-900",
                text: "text-green-700",
                pillBg: "bg-green-600",
                pillText: "text-white",
                pillLabel: "สถานะ: ปกติ"
              },
              medium: {
                border: "border-l-yellow-500",
                bg: "bg-yellow-50",
                iconBg: "bg-yellow-100",
                iconColor: "text-yellow-600",
                title: "text-yellow-900",
                text: "text-yellow-700",
                pillBg: "bg-yellow-600",
                pillText: "text-white",
                pillLabel: "สถานะ: ระวัง"
              },
              high: {
                border: "border-l-red-500",
                bg: "bg-red-50",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                title: "text-red-900",
                text: "text-red-700",
                pillBg: "bg-red-600",
                pillText: "text-white",
                pillLabel: "สถานะ: อันตราย"
              }
            };
            const th = themes[levelKey] || themes.low;
            return (
              <div className={`lg:col-span-2 rounded-xl border border-l-4 shadow ${th.border} ${th.bg}`}>
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${th.iconBg}`}>
                      <Eye className={`w-6 h-6 ${th.iconColor}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-medium ${th.title}`}>สถานะล่าสุด</h3>
                      <p className={`${th.text}`}>{latestStatus?.status || "ไม่พบสัญญาณความเหนื่อยล้า"}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${th.pillBg} ${th.pillText}`}>{th.pillLabel}</span>
                </div>
              </div>
            );
          })()}
          <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow p-4 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-orange-700">เหตุการณ์สถานะวันนี้</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-900 mb-1">{driverStats.eventsToday}</div>
            <div className="text-sm text-orange-600">ครั้ง</div>
            <div className="text-xs text-orange-500 mt-1">ล่าสุด: {driverStats.lastEvent}</div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-xl border bg-white shadow">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">เหตุการณ์สถานะวันนี้</h3>
              </div>
              <p className="text-sm text-slate-500">สตรีมสถานะ (Normal แสดงครั้งเดียวต่อช่วง / ระวัง & อันตราย แสดงทุกครั้ง)</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-600">จำนวนล่าสุดที่แสดง</div>
                <div className="flex items-center gap-2">
                  {[5,10,15].map(v => (
                    <button
                      key={v}
                      onClick={() => setAlertDisplayLimit(v)}
                      className={`h-8 px-3 text-xs rounded-md border transition ${alertDisplayLimit===v? 'bg-blue-600 text-white border-blue-600':'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'}`}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {displayEvents.map((evt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${evt.severity === "warning" ? "bg-yellow-500" : evt.severity === "danger" ? "bg-red-500" : evt.severity === "success" ? "bg-green-500" : "bg-blue-500"}`} />
                      <div>
                        <div className="font-medium text-slate-800">{evt.label}</div>
                        <div className="text-xs text-slate-500">{
                          evt.severity === "warning" ? "ระดับระวัง" : evt.severity === "danger" ? "ระดับอันตราย" : evt.severity === "success" ? "สถานะปกติ" : "ข้อมูลทั่วไป"
                        }</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 bg-white px-3 py-1 rounded-full border">{evt.time}</div>
                  </div>
                ))}
              </div>
              {displayEvents.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>ยังไม่มีข้อมูลสถานะในวันนี้</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">ประวัติการแจ้งเตือนวันนี้</h3>
              </div>
              <p className="text-sm text-slate-500">แนวโน้มการแจ้งเตือน (06:00-24:00)</p>
            </div>
            <div className="p-6">
              <div className="h-56 sm:h-64 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-2 border border-slate-200 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-2 pb-2 text-[10px] text-slate-600">
                  <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-400" /> ระวัง</div>
                  <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500" /> อันตราย</div>
                  <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-slate-300" /> ไม่มีเหตุการณ์</div>
                </div>
                <div className="h-full flex items-end px-2 gap-3 sm:gap-4 justify-center sm:justify-between">
                  {(() => {
                    const slots = [
                      { label: '06-09', start: 6, end: 9 },
                      { label: '09-12', start: 9, end: 12 },
                      { label: '12-15', start: 12, end: 15 },
                      { label: '15-18', start: 15, end: 18 },
                      { label: '18-21', start: 18, end: 21 },
                      { label: '21-24', start: 21, end: 24 }
                    ];
                    const warnCounts = slots.map(s => allEvents.filter(ev => ev.severity === 'warning' && ev.hour >= s.start && ev.hour < s.end).length);
                    const dangerCounts = slots.map(s => allEvents.filter(ev => ev.severity === 'danger' && ev.hour >= s.start && ev.hour < s.end).length);
                    const totalCounts = warnCounts.map((w, i) => w + dangerCounts[i]);
                    const max = Math.max(1, ...totalCounts);
                    return slots.map((s, i) => {
                      const w = warnCounts[i];
                      const d = dangerCounts[i];
                      const total = w + d;
                      const totalHeight = 8 + (total / max) * 72; // px scale
                      const dangerHeight = total === 0 ? 0 : (d / total) * (totalHeight - 4);
                      const warningHeight = total === 0 ? 0 : (w / total) * (totalHeight - 4);
                      return (
                        <div key={s.label} className="flex flex-col items-center flex-1 min-w-[42px]">
                          <div className="w-full max-w-[30px] mb-1 flex flex-col justify-end">
                            {total === 0 && (
                              <div className="h-2 w-full rounded bg-slate-300" />
                            )}
                            {total > 0 && (
                              <div className="w-full flex flex-col justify-end">
                                {/* warning segment */}
                                {warningHeight > 2 && <div style={{ height: `${warningHeight}px` }} className="w-full rounded-t bg-yellow-400" />}
                                {/* danger segment */}
                                {dangerHeight > 2 && <div style={{ height: `${dangerHeight}px` }} className={`w-full ${warningHeight <=2? 'rounded-t':''} rounded-b bg-red-500`} />}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-600 whitespace-nowrap">{s.label}</div>
                          <div className="text-[10px] text-slate-500">{total}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {/* Removed duplicate summary panel (already shown above) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
