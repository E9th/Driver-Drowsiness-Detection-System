# Driver Drowsiness Detection System - Development Guidelines

## โปรเจค Overview
ระบบตรวจจับความเหนื่อยล้าของผู้ขับขี่ (Driver Drowsiness Detection System) ที่ใช้เทคโนโลยี AI เพื่อตรวจจับพฤติกรรมความเหนื่อยล้าและแจ้งเตือนเพื่อป้องกันการหลับใน

**ผู้จัดทำ:** นักศึกษาคณะวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยรามคำแหง (3 คน + อาจารย์ที่ปรึกษา)

---

## 🎨 Design System Guidelines

### Typography
- **Base font-size:** 14px (กำหนดใน CSS variables)
- **Font weights:** 
  - Normal: 400 (สำหรับ content ทั่วไป)
  - Medium: 500 (สำหรับ headings และ buttons)
- **Line height:** 1.5 สำหรับทุก elements
- **ห้ามใช้ Tailwind typography classes** (text-xl, font-bold, etc.) เว้นแต่จำเป็นเป็นพิเศษ

### Color Palette
- **Primary:** #030213 (เข้มเพื่อความเป็นมืออาชีพ)
- **Success/Safe:** Green variants (สำหรับสถานะปลอดภัย)
- **Warning:** Orange variants (สำหรับการเตือน)
- **Critical/Danger:** Red variants (สำหรับการแจ้งเตือนด่วน)
- **Neutral:** Gray variants (สำหรับข้อมูลทั่วไป)

### Spacing & Layout
- **Radius:** 0.625rem (10px) เป็นมาตรฐาน
- **Grid breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Container max-width:** 7xl (1280px) สำหรับ desktop dashboards

---

## 📱 Responsive Design Guidelines

### Breakpoint Strategy
```
Mobile First: 320px+
Tablet: 768px+ (md:)
Desktop: 1024px+ (lg:)
Large Desktop: 1280px+ (xl:)
```

### Dashboard Responsive Rules
1. **Statistics Cards**
   - Mobile: 2 columns grid
   - Tablet: 2 columns grid
   - Desktop: 4 columns grid
   - ใช้ `grid-cols-2 md:grid-cols-2 lg:grid-cols-4`

2. **Data Tables**
   - ใช้ `overflow-x-auto` wrapper เสมอ
   - กำหนด `min-width` สำหรับแต่ละ column
   - ปุ่ม action ใช้ responsive sizing: `h-8 px-2 lg:px-3`
   - Text ใน buttons: `<span className="hidden lg:inline">ข้อความ</span>`

3. **Navigation & Header**
   - Mobile: แสดงเฉพาะ icons
   - Desktop: แสดงทั้ง icons และ text
   - ใช้ `hidden sm:inline` สำหรับ text labels

### Component Sizing
- **Buttons:** `size="sm"` เป็นมาตรฐานใน dashboards
- **Icons:** `w-4 h-4` สำหรับ buttons, `w-5 h-5` สำหรับ headers
- **Avatars/Profile icons:** `w-8 h-8` ใน tables

---

## 🚗 Domain-Specific Guidelines

### Status Indicators
```typescript
// สี status มาตรฐาน
const statusColors = {
  'ขับขี่': 'bg-green-100 text-green-800',
  'พักผ่อน': 'bg-blue-100 text-blue-800', 
  'เตือนภัย': 'bg-red-100 text-red-800',
  'แบน': 'bg-gray-100 text-gray-800'
};
```

### Safety Score Display
- **คะแนน ≥ 90:** Green (ปลอดภัย)
- **คะแนน 80-89:** Orange (ระวัง)
- **คะแนน < 80:** Red (อันตราย)
- **คะแนน < 50:** Auto-ban 5 ชั่วโมง

### Alert Severity Levels
```typescript
const alertSeverity = {
  'success': 'bg-green-500',
  'info': 'bg-blue-500',
  'warning': 'bg-orange-500', 
  'critical': 'bg-red-500'
};
```

---

## 🔧 Technical Guidelines

### State Management
- ใช้ React useState สำหรับ component state
- Mock data อยู่ใน `/data/mockData.ts`
- Algorithms อยู่ใน `/utils/algorithms.ts`

### Component Structure
```
/components
├── Pages (HomePage, LoginPage, etc.)
├── Dashboards (DriverDashboard, MasterDashboard)
├── Sections (HeroSection, StatisticsSection, etc.)
└── ui/ (shadcn/ui components - ห้ามแก้ไข)
```

### Data Handling
- **รายวัน:** ข้อมูลจะ reset ทุกวัน
- **Auto-ban:** คะแนน < 50 = แบน 5 ชั่วโมง
- **Manual ban:** Admin สามารถแบน/ปลดแบนได้
- **เวลา:** ใช้รูปแบบ 24 ชั่วโมง (เช่น "15:45")

---

## 🎯 UI/UX Best Practices

### Dashboard Design
1. **เน้น functionality over aesthetics** - เป็นระบบสำหรับการทำงานจริง
2. **Critical information first** - แจ้งเตือนด่วนอยู่ด้านบน
3. **Clear visual hierarchy** - ใช้ colors และ typography ตาม guidelines
4. **Mobile accessibility** - dashboard ต้องใช้งานได้บน tablet

### Form & Input Design
- ใช้ shadcn/ui components เป็นมาตรฐาน
- Label ต้องชัดเจน เป็นภาษาไทย
- Validation messages เป็นภาษาไทย
- Loading states สำหรับ async operations

### Navigation
- **Home page:** แสดง Header พร้อม navigation
- **Dashboards:** ซ่อน Header, ใช้ back button
- **Login flow:** Login → Dashboard (ไม่ผ่าน Home)

---

## 🚫 ข้อห้าม (Don'ts)

1. **ห้ามใช้ Tailwind typography classes** เว้นแต่จำเป็น
2. **ห้ามแก้ไข shadcn/ui components** ใน `/components/ui/`
3. **ห้ามใช้ mock data แบบ static** ในการแสดงผล
4. **ห้ามใช้ hardcoded colors** นอกเหนือจาก design system
5. **ห้าม responsive breakpoints แบบ random** - ใช้ตาม guidelines

---

## 📋 Code Review Checklist

### Before Commit
- [ ] Component ใช้ TypeScript interfaces
- [ ] Responsive design ทำงานถูกต้องทุก breakpoint  
- [ ] Thai language ใช้ถูกต้อง consistent
- [ ] Colors ตาม design system
- [ ] Typography ไม่ override CSS variables
- [ ] Loading/Error states ครบถ้วน

### Testing Checklist
- [ ] Mobile (320px+): Basic functionality
- [ ] Tablet (768px+): Full dashboard features
- [ ] Desktop (1024px+): Optimal experience
- [ ] Large screen (1280px+): No layout breaking

---

## 🔄 Version Control

### Commit Message Format
```
feat: เพิ่มฟีเจอร์การแจ้งเตือนด่วน
fix: แก้ไข responsive table ใน MasterDashboard  
style: ปรับ color scheme ตาม design system
docs: อัปเดต Guidelines.md
```

### Branch Strategy
- `main`: Production ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `fix/*`: Bug fixes

---

*Guidelines นี้จัดทำขึ้นเพื่อให้ทีมพัฒนาสามารถทำงานร่วมกันได้อย่างมีประสิทธิภาพ และรักษาคุณภาพของโค้ดให้สอดคล้องกัน*