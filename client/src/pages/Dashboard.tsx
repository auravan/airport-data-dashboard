import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Cloud, Wind, Thermometer, Eye } from "lucide-react";

interface MockData {
  locations: Array<{ id: number; name: string; totalCount: number }>;
  timeSegmentData: Array<{ location: string; count: number }>;
  birdSpecies: Array<{ name: string; count: number; color: string }>;
  trendData: Array<{ date: string; count: number }>;
  weatherData: {
    today: { date: string; tempHigh: number; tempLow: number; windDirection: string; windSpeed: number; condition: string };
    tomorrow: { date: string; tempHigh: number; tempLow: number; windDirection: string; windSpeed: number; condition: string };
    dayAfter: { date: string; tempHigh: number; tempLow: number; windDirection: string; windSpeed: number; condition: string };
  };
  recentMonitoring: Array<{ species: string; location: string; time: string }>;
}

export default function Dashboard() {
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [startDate, setStartDate] = useState("2024-01-14");
  const [endDate, setEndDate] = useState("2024-01-14");
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    fetch("/mock-data.json")
      .then((res) => res.json())
      .then((data) => setMockData(data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % (mockData?.recentMonitoring.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [mockData]);

  if (!mockData) {
    return <div className="w-full h-screen bg-background flex items-center justify-center text-foreground">加载中...</div>;
  }

  const visibleMonitoring = [
    mockData.recentMonitoring[scrollIndex],
    mockData.recentMonitoring[(scrollIndex + 1) % mockData.recentMonitoring.length],
    mockData.recentMonitoring[(scrollIndex + 2) % mockData.recentMonitoring.length],
  ];

  return (
    <div
      className="w-full min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/airport-satellite-map.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 深色覆盖层 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* 内容容器 */}
      <div className="relative z-10 p-6">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-accent drop-shadow-lg" style={{ textShadow: "0 0 20px rgba(0, 217, 255, 0.8)" }}>
            机场周边鸟类信息汇总
          </h1>
          <p className="text-muted-foreground mt-2">实时监测数据分析平台</p>
        </div>

        {/* 主网格布局 */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* 左上：时段监测 */}
          <div className="col-span-4 row-span-2 tech-card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-accent">时段监测</h2>
            </div>
            <div className="flex gap-2 mb-4 text-sm">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-input border border-border rounded px-2 py-1 text-foreground"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-input border border-border rounded px-2 py-1 text-foreground"
              />
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={mockData.timeSegmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.2)" />
                <XAxis dataKey="location" stroke="#a0aeff" />
                <YAxis stroke="#a0aeff" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.9)", border: "1px solid #00D9FF" }} />
                <Bar dataKey="count" fill="#00D9FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 左中：地点汇总 */}
          <div className="col-span-4 tech-card p-4">
            <h2 className="text-xl font-bold text-accent mb-4">地点汇总</h2>
            <div className="space-y-3">
              {mockData.locations.map((loc) => (
                <div key={loc.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded border border-border/50">
                  <span className="text-foreground">{loc.name}</span>
                  <span className="text-accent font-bold text-lg">{loc.totalCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 左下：鸟类种类占比 */}
          <div className="col-span-4 tech-card p-4">
            <h2 className="text-xl font-bold text-accent mb-4">鸟类种类占比</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={mockData.birdSpecies} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={60} fill="#8884d8" dataKey="count">
                  {mockData.birdSpecies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.9)", border: "1px solid #00D9FF" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 中央底部：视频监控 */}
          <div className="col-span-6 tech-card p-4 relative overflow-hidden">
            <h2 className="text-xl font-bold text-accent mb-4">鸟类识别实时监控录像</h2>
            <div className="relative w-full h-full bg-black/50 rounded border-2 border-accent/50 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                  <p className="text-foreground">实时视频流</p>
                  <p className="text-muted-foreground text-sm mt-2">AI识别系统就绪</p>
                </div>
              </div>
              {/* 动态流光边框效果 */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent)", backgroundSize: "200% 100%", animation: "flowLight 3s linear infinite" }}></div>
            </div>
          </div>

          {/* 右上：鸟类总数趋势 */}
          <div className="col-span-6 tech-card p-4">
            <h2 className="text-xl font-bold text-accent mb-4">鸟类总数趋势</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.2)" />
                <XAxis dataKey="date" stroke="#a0aeff" />
                <YAxis stroke="#a0aeff" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.9)", border: "1px solid #00D9FF" }} />
                <Line type="monotone" dataKey="count" stroke="#00D9FF" strokeWidth={2} dot={{ fill: "#00FF88", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 右中：天气信息 */}
          <div className="col-span-6 tech-card p-4">
            <h2 className="text-xl font-bold text-accent mb-4">实时天气信息</h2>
            <div className="grid grid-cols-3 gap-3">
              {[mockData.weatherData.today, mockData.weatherData.tomorrow, mockData.weatherData.dayAfter].map((weather, idx) => (
                <div key={idx} className="bg-secondary/30 rounded border border-border/50 p-3">
                  <p className="text-sm text-muted-foreground mb-2">{weather.date}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-4 h-4 text-accent" />
                    <span className="text-foreground">{weather.tempHigh}°C / {weather.tempLow}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-accent" />
                    <span className="text-foreground text-sm">{weather.windDirection} {weather.windSpeed}km/h</span>
                  </div>
                  <p className="text-sm text-accent mt-2">{weather.condition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 右下：最新监测动态 */}
          <div className="col-span-6 tech-card p-4 overflow-hidden">
            <h2 className="text-xl font-bold text-accent mb-4">最新监测动态</h2>
            <div className="space-y-2 h-[calc(100%-50px)] overflow-hidden">
              {visibleMonitoring.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-secondary/30 rounded border border-border/50 text-sm text-foreground animate-fade-in"
                  style={{
                    animation: `fadeIn 0.5s ease-in-out ${idx * 0.1}s`,
                  }}
                >
                  <span className="text-accent font-bold">[{item.species}]</span> / <span className="text-foreground">{item.location}</span> / <span className="text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
