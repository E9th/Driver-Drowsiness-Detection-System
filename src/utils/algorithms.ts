import { TripData, AlertData, DriverData } from '../data/mockData';

// Safety Score Calculation Algorithm
export const calculateSafetyScore = (trips: TripData[]): number => {
  if (trips.length === 0) return 100;
  
  let totalScore = 0;
  let totalDistance = 0;
  
  trips.forEach(trip => {
    if (!trip.completed) return;
    
    let tripScore = 100;
    const distance = trip.distance;
    
    // Deduct points based on alerts
    trip.alerts.forEach(alert => {
      switch (alert.severity) {
        case 'critical':
          tripScore -= 15;
          break;
        case 'warning':
          tripScore -= 8;
          break;
        case 'info':
          tripScore -= 3;
          break;
      }
      
      // Additional deduction based on alert type
      switch (alert.type) {
        case 'drowsiness_high':
          tripScore -= 10;
          break;
        case 'drowsiness_medium':
          tripScore -= 5;
          break;
        case 'head_nod':
          tripScore -= 8;
          break;
        case 'eye_closure':
          tripScore -= 6;
          break;
      }
    });
    
    // Ensure score doesn't go below 0
    tripScore = Math.max(0, tripScore);
    
    // Weight by distance
    totalScore += tripScore * distance;
    totalDistance += distance;
  });
  
  return totalDistance > 0 ? Math.round(totalScore / totalDistance) : 100;
};

// Calculate alerts for a specific time period
export const getAlertsInTimeRange = (trips: TripData[], startDate: Date, endDate: Date): AlertData[] => {
  const alerts: AlertData[] = [];
  
  trips.forEach(trip => {
    trip.alerts.forEach(alert => {
      if (alert.timestamp >= startDate && alert.timestamp <= endDate) {
        alerts.push(alert);
      }
    });
  });
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Calculate total driving time
export const calculateTotalDrivingTime = (trips: TripData[]): number => {
  let totalMinutes = 0;
  
  trips.forEach(trip => {
    if (trip.completed) {
      const duration = trip.endTime.getTime() - trip.startTime.getTime();
      totalMinutes += duration / (1000 * 60); // Convert to minutes
    }
  });
  
  return totalMinutes;
};

// Calculate total distance
export const calculateTotalDistance = (trips: TripData[]): number => {
  return trips.reduce((total, trip) => {
    return trip.completed ? total + trip.distance : total;
  }, 0);
};

// Get driver status based on recent alerts
export const getDriverStatus = (driverId: string, trips: TripData[]): string => {
  const driverTrips = trips.filter(trip => trip.driverId === driverId);
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentAlerts = getAlertsInTimeRange(driverTrips, oneHourAgo, now);
  
  const criticalAlerts = recentAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = recentAlerts.filter(alert => alert.severity === 'warning');
  
  if (criticalAlerts.length > 0) return 'เตือนภัย';
  if (warningAlerts.length >= 2) return 'เตือนภัย';
  
  // Check if currently driving
  const currentTrip = driverTrips.find(trip => !trip.completed);
  if (currentTrip) return 'ขับขี่';
  
  // Check if recently finished a trip
  const lastTrip = driverTrips
    .filter(trip => trip.completed)
    .sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0];
  
  if (lastTrip) {
    const timeSinceLastTrip = now.getTime() - lastTrip.endTime.getTime();
    const hoursSinceLastTrip = timeSinceLastTrip / (1000 * 60 * 60);
    
    if (hoursSinceLastTrip < 2) return 'พักผ่อน';
  }
  
  return 'พร้อมงาน';
};

// Calculate fleet statistics
export const calculateFleetStats = (drivers: DriverData[], allTrips: TripData[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const activeDrivers = drivers.filter(driver => driver.isActive);
  const todayTrips = allTrips.filter(trip => 
    trip.startTime >= today && trip.startTime < tomorrow
  );
  
  const todayAlerts = getAlertsInTimeRange(allTrips, today, new Date());
  const criticalAlerts = todayAlerts.filter(alert => alert.severity === 'critical');
  
  // Calculate overall safety score
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyTrips = allTrips.filter(trip => trip.startTime >= weekAgo);
  const overallSafetyScore = calculateSafetyScore(weeklyTrips);
  
  return {
    totalDrivers: drivers.length,
    activeDrivers: activeDrivers.length,
    alertsToday: todayAlerts.length,
    criticalAlerts: criticalAlerts.length,
    safetyScore: overallSafetyScore,
    totalFleet: drivers.length // Assuming 1 vehicle per driver
  };
};

// Calculate driver performance metrics
export const calculateDriverMetrics = (driverId: string, trips: TripData[]) => {
  const driverTrips = trips.filter(trip => trip.driverId === driverId);
  
  // Today's metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTrips = driverTrips.filter(trip => 
    trip.startTime >= today && trip.startTime < tomorrow
  );
  
  const completedTodayTrips = todayTrips.filter(trip => trip.completed);
  const todayAlerts = getAlertsInTimeRange(driverTrips, today, new Date());
  
  // Weekly metrics
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyTrips = driverTrips.filter(trip => trip.startTime >= weekAgo);
  const weeklyAlerts = getAlertsInTimeRange(driverTrips, weekAgo, new Date());
  
  const safetyScore = calculateSafetyScore(weeklyTrips);
  const totalDistance = calculateTotalDistance(weeklyTrips);
  const totalDrivingMinutes = calculateTotalDrivingTime(weeklyTrips);
  const avgDriveTimeHours = totalDrivingMinutes / 60 / 7; // Average per day
  
  // Last alert time
  const lastAlert = weeklyAlerts.length > 0 ? weeklyAlerts[0] : null;
  const lastAlertTime = lastAlert ? 
    formatTimeAgo(lastAlert.timestamp) : 'ไม่มีการแจ้งเตือน';
  
  return {
    totalTrips: todayTrips.length,
    safeTrips: completedTodayTrips.length,
    alertsToday: todayAlerts.length,
    avgDriveTime: `${avgDriveTimeHours.toFixed(1)} ชั่วโมง`,
    lastAlert: lastAlertTime,
    safetyScore,
    weeklyDistance: Math.round(totalDistance),
    weeklyDrivingHours: Math.round(totalDrivingMinutes / 60),
    weeklyAlerts: weeklyAlerts.length
  };
};

// Helper function to format time ago
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} ชั่วโมงที่แล้ว`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} วันที่แล้ว`;
  }
};

// Generate recent alerts with proper formatting
export const generateRecentAlerts = (trips: TripData[], limit: number = 5) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAlerts = getAlertsInTimeRange(trips, today, new Date());
  
  return todayAlerts.slice(0, limit).map(alert => ({
    time: alert.timestamp.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    type: formatAlertType(alert.type),
    severity: alert.severity,
    location: alert.location
  }));
};

// Format alert type to Thai
export const formatAlertType = (type: AlertData['type']): string => {
  const typeMap: Record<AlertData['type'], string> = {
    'drowsiness_low': 'เหนื่อยล้าเล็กน้อย',
    'drowsiness_medium': 'เหนื่อยล้าปานกลาง',
    'drowsiness_high': 'เหนื่อยล้าสูง',
    'eye_closure': 'หลับตา',
    'head_nod': 'หลับพักผ่อน',
    'yawn': 'การยืดตัว',
    'normal': 'ปกติ'
  };
  
  return typeMap[type] || type;
};