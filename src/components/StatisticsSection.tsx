import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Car, Clock, Users } from "lucide-react";

export function StatisticsSection() {
  const stats = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      number: "1,550+",
      label: "อุบัติเหตุต่อปี",
      description: "จากการหลับในขณะขับรถในประเทศไทย",
      color: "red"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      number: "20%",
      label: "ของอุบัติเหตุรถยนต์",
      description: "เกิดจากความเหนื่อยล้าของผู้ขับขี่",
      color: "orange"
    },
    {
      icon: <Car className="w-8 h-8 text-blue-500" />,
      number: "4-6 AM",
      label: "ช่วงเวลาเสี่ยงสูง",
      description: "และ 2-4 PM เป็นช่วงที่เกิดอุบัติเหตุบ่อยที่สุด",
      color: "blue"
    },

  ];

  const benefits = [
    {
      title: "ลดค่าใช้จ่ายประกันภัย",
      description: "บริษัทประกันให้ส่วนลดสำหรับรถที่ติดตั้งระบบความปลอดภัย",
      percentage: "15-30%",
      trend: "down"
    },
    {
      title: "เพิ่มประสิทธิภาพการขนส่ง",
      description: "ลดเวลาหยุดพักที่ไม่จำเป็นและปรับปรุงการวางแผนเส้นทาง",
      percentage: "25%",
      trend: "up"
    },
    {
      title: "ลดอุบัติเหตุในกลุ่มรถ",
      description: "การติดตามและจัดการกลุ่มรถช่วยลดความเสี่ยง",
      percentage: "40%",
      trend: "down"
    }
  ];

  return (
    <section id="statistics" className="py-15 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl">
            ปัญหาที่เราช่วยแก้ไข
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            สถิติที่น่าตกใจเกี่ยวกับอุบัติเหตุจากการหลับในและความสำคัญของระบบป้องกัน
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-3xl mb-2">{stat.number}</div>
                  <CardTitle className="text-lg text-white/90">{stat.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70 text-center leading-relaxed">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-300 italic">
            "การลงทุนในระบบความปลอดภัยเป็นการลงทุนในชีวิตและทรัพย์สินที่ไม่สามารถประเมินค่าได้"
          </p>
        </div>
      </div>
    </section>
  );
}