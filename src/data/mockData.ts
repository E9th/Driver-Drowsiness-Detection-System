// Types for our data structures
export interface TripData {
  id: string;
  driverId: string;
  startTime: Date;
  endTime: Date;
  distance: number; // km
  route: string;
  alerts: AlertData[];
  completed: boolean;
}

export interface AlertData {
  id: string;
  timestamp: Date;
  type: 'drowsiness_low' | 'drowsiness_medium' | 'drowsiness_high' | 'eye_closure' | 'head_nod' | 'yawn' | 'normal';
  severity: 'info' | 'warning' | 'critical';
  location: string;
  resolved: boolean;
  confidence: number; // 0-100
}

export interface DriverData {
  id: string;
  name: string;
  vehicleId: string;
  licenseNumber: string;
  joinDate: Date;
  isActive: boolean;
  currentLocation?: string;
  currentStatus: 'driving' | 'resting' | 'off_duty' | 'alert';
}

// Mock trip data
export const mockTrips: TripData[] = [
  {
    id: 'trip_001',
    driverId: 'driver_001',
    startTime: new Date('2024-12-16T06:00:00'),
    endTime: new Date('2024-12-16T08:30:00'),
    distance: 45.2,
    route: 'สำนักงาน → คลังสินค้า A',
    completed: true,
    alerts: [
      {
        id: 'alert_001',
        timestamp: new Date('2024-12-16T07:15:00'),
        type: 'yawn',
        severity: 'info',
        location: 'ถนนสุขุมวิท',
        resolved: true,
        confidence: 85
      }
    ]
  },
  {
    id: 'trip_002',
    driverId: 'driver_001',
    startTime: new Date('2024-12-16T09:00:00'),
    endTime: new Date('2024-12-16T11:45:00'),
    distance: 62.8,
    route: 'คลังสินค้า A → ลูกค้า 1',
    completed: true,
    alerts: []
  },
  {
    id: 'trip_003',
    driverId: 'driver_001',
    startTime: new Date('2024-12-16T13:00:00'),
    endTime: new Date('2024-12-16T15:20:00'),
    distance: 38.5,
    route: 'ลูกค้า 1 → คลังสินค้า B',
    completed: true,
    alerts: [
      {
        id: 'alert_002',
        timestamp: new Date('2024-12-16T14:30:00'),
        type: 'drowsiness_medium',
        severity: 'warning',
        location: 'ถนนรามคำแหง',
        resolved: true,
        confidence: 92
      }
    ]
  },
  {
    id: 'trip_004',
    driverId: 'driver_001',
    startTime: new Date('2024-12-16T15:30:00'),
    endTime: new Date(),
    distance: 0,
    route: 'คลังสินค้า B → ลูกค้า 2',
    completed: false,
    alerts: []
  },
  // Previous days trips
  {
    id: 'trip_005',
    driverId: 'driver_001',
    startTime: new Date('2024-12-15T08:00:00'),
    endTime: new Date('2024-12-15T16:30:00'),
    distance: 156.7,
    route: 'เส้นทางประจำวัน',
    completed: true,
    alerts: [
      {
        id: 'alert_003',
        timestamp: new Date('2024-12-15T11:20:00'),
        type: 'eye_closure',
        severity: 'warning',
        location: 'ถนนพหลโยธิน',
        resolved: true,
        confidence: 88
      },
      {
        id: 'alert_004',
        timestamp: new Date('2024-12-15T14:45:00'),
        type: 'head_nod',
        severity: 'critical',
        location: 'ถนนวิภาวดี',
        resolved: true,
        confidence: 95
      }
    ]
  }
];

// Mock driver data
export const mockDrivers: DriverData[] = [
  {
    id: 'driver_001',
    name: 'สมชาย ใจดี',
    vehicleId: 'ABC-1234',
    licenseNumber: 'BKK-1234567',
    joinDate: new Date('2023-01-15'),
    isActive: true,
    currentLocation: 'ถนนสุขุมวิท',
    currentStatus: 'driving'
  },
  {
    id: 'driver_002',
    name: 'สมหญิง รักดี',
    vehicleId: 'DEF-5678',
    licenseNumber: 'BKK-2345678',
    joinDate: new Date('2023-03-20'),
    isActive: true,
    currentLocation: 'ถนนพหลโยธิน',
    currentStatus: 'resting'
  },
  {
    id: 'driver_003',
    name: 'วิชัย มั่นคง',
    vehicleId: 'GHI-9012',
    licenseNumber: 'BKK-3456789',
    joinDate: new Date('2023-06-10'),
    isActive: true,
    currentLocation: 'ถนนรามคำแหง',
    currentStatus: 'driving'
  },
  {
    id: 'driver_004',
    name: 'สุพล แข็งแรง',
    vehicleId: 'JKL-3456',
    licenseNumber: 'BKK-4567890',
    joinDate: new Date('2023-08-05'),
    isActive: true,
    currentLocation: 'ถนนลาดพร้าว',
    currentStatus: 'alert'
  },
  {
    id: 'driver_005',
    name: 'มานะ อุตสาห์',
    vehicleId: 'MNO-7890',
    licenseNumber: 'BKK-5678901',
    joinDate: new Date('2023-11-12'),
    isActive: true,
    currentLocation: 'ถนนวิภาวดี',
    currentStatus: 'driving'
  }
];

// Generate more trip data for all drivers
export const generateAllTripsData = (): TripData[] => {
  const allTrips: TripData[] = [...mockTrips];
  
  // Generate trips for other drivers for the last 7 days
  mockDrivers.slice(1).forEach((driver, driverIndex) => {
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Generate 2-4 trips per day per driver
      const numTrips = Math.floor(Math.random() * 3) + 2;
      
      for (let tripIndex = 0; tripIndex < numTrips; tripIndex++) {
        const startHour = 8 + (tripIndex * 2) + Math.floor(Math.random() * 2);
        const startTime = new Date(date);
        startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 90 + Math.floor(Math.random() * 120));
        
        const distance = 20 + Math.floor(Math.random() * 80);
        
        // Generate random alerts
        const alerts: AlertData[] = [];
        const numAlerts = Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
        
        for (let alertIndex = 0; alertIndex < numAlerts; alertIndex++) {
          const alertTime = new Date(startTime);
          alertTime.setMinutes(alertTime.getMinutes() + Math.floor(Math.random() * 120));
          
          const alertTypes: AlertData['type'][] = ['drowsiness_low', 'drowsiness_medium', 'drowsiness_high', 'eye_closure', 'head_nod', 'yawn'];
          const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          
          let severity: AlertData['severity'] = 'info';
          if (alertType.includes('high') || alertType === 'head_nod') severity = 'critical';
          else if (alertType.includes('medium') || alertType === 'eye_closure') severity = 'warning';
          
          alerts.push({
            id: `alert_${driver.id}_${day}_${tripIndex}_${alertIndex}`,
            timestamp: alertTime,
            type: alertType,
            severity,
            location: ['ถนนสุขุมวิท', 'ถนนพหลโยธิน', 'ถนนรามคำแหง', 'ถนนลาดพร้าว', 'ถนนวิภาวดี'][Math.floor(Math.random() * 5)],
            resolved: true,
            confidence: 70 + Math.floor(Math.random() * 30)
          });
        }
        
        allTrips.push({
          id: `trip_${driver.id}_${day}_${tripIndex}`,
          driverId: driver.id,
          startTime,
          endTime: day === 0 && tripIndex === numTrips - 1 ? new Date() : endTime,
          distance,
          route: `เส้นทาง ${String.fromCharCode(65 + tripIndex)} → เส้นทาง ${String.fromCharCode(66 + tripIndex)}`,
          completed: day > 0 || tripIndex < numTrips - 1,
          alerts
        });
      }
    }
  });
  
  return allTrips;
};

export const allTripsData = generateAllTripsData();