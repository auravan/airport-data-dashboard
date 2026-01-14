import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
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
      className="w-full h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/airport-satellite-map.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 深色覆盖层 */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>

      {/* 内容容器 */}
      <div className="relative z-10 p-5 h-screen flex flex-col">
        {/* 标题区域 - 带科技感边框 */}
        <div className="mb-5 pb-3 border-b border-accent/20 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          <h1 className="text-3xl font-bold text-accent text-center" style={{ textShadow: "0 0 30px rgba(0, 217, 255, 0.5)" }}>
            机场周边鸟类信息汇总
          </h1>
          <p className="text-center text-muted-foreground text-xs mt-1">实时监测数据分析平台</p>
        </div>

        {/* 主容器 - 左右两栏布局 */}
        <div className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
          {/* 左侧大图表区域 */}
          <div className="col-span-8 flex flex-col gap-3 overflow-y-auto pr-2">
            {/* 鸟类识别实时监控 */}
            <div className="tech-card p-3 h-40 relative">
              <div className="card-title text-sm">鸟类识别实时监控录像</div>
              <div className="w-full h-full bg-black/50 rounded border border-accent/40 flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <Eye className="w-10 h-10 text-accent mx-auto mb-2 animate-pulse" />
                  <p className="text-foreground text-xs">实时视频流</p>
                  <p className="text-muted-foreground text-xs mt-0.5">AI识别系统就绪</p>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.2), transparent)", backgroundSize: "200% 100%", animation: "flowLight 3s linear infinite" }}></div>
              </div>
            </div>

            {/* 时段监测 */}
            <div className="tech-card p-3 flex-1 min-h-0">
              <div className="card-title text-sm">时段监测</div>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-input border border-border/50 rounded px-2 py-0.5 text-foreground text-xs flex-1"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-input border border-border/50 rounded px-2 py-0.5 text-foreground text-xs flex-1"
                />
              </div>
              <ResponsiveContainer width="100%" height="calc(100% - 45px)">
                <BarChart data={mockData.timeSegmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                  <XAxis dataKey="location" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.95)", border: "1px solid #00D9FF", borderRadius: "4px", fontSize: "11px" }} />
                  <Bar dataKey="count" fill="#00D9FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 鸟类总数趋势 */}
            <div className="tech-card p-3 flex-1 min-h-0">
              <div className="card-title text-sm">鸟类总数趋势</div>
              <ResponsiveContainer width="100%" height="calc(100% - 35px)">
                <AreaChart data={mockData.trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.95)", border: "1px solid #00D9FF", borderRadius: "4px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="count" stroke="#00D9FF" strokeWidth={2} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 右侧卡片堆叠区域 */}
          <div className="col-span-4 flex flex-col gap-3 overflow-y-auto pl-2">
            {/* 时段监测堆叠柱状图 */}
            <div className="tech-card p-3 h-32">
              <div className="card-title text-xs">时段监测</div>
              <ResponsiveContainer width="100%" height="calc(100% - 32px)">
                <BarChart data={mockData.timeSegmentData} layout="vertical" margin={{ top: 0, right: 10, left: 50, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                  <XAxis type="number" stroke="#a0aeff" style={{ fontSize: "10px" }} />
                  <YAxis dataKey="location" type="category" stroke="#a0aeff" style={{ fontSize: "10px" }} width={45} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15, 21, 53, 0.95)", border: "1px solid #00D9FF", borderRadius: "4px", fontSize: "10px" }} />
                  <Bar dataKey="count" fill="#00D9FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 地点汇总 */}
            <div className="tech-card p-3">
              <div className="card-title text-xs">地点汇总</div>
              <div className="grid grid-cols-2 gap-2">
                {mockData.locations.map((loc) => (
                  <div key={loc.id} className="stat-box">
                    <div className="text-xs text-muted-foreground">{loc.name}</div>
                    <div className="stat-number text-xl mt-1">{loc.totalCount}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 实时天气信息 */}
            <div className="tech-card p-3">
              <div className="card-title text-xs">实时天气信息</div>
              <div className="space-y-2">
                {[mockData.weatherData.today, mockData.weatherData.tomorrow, mockData.weatherData.dayAfter].map((weather, idx) => (
                  <div key={idx} className="stat-box">
                    <div className="text-xs text-muted-foreground mb-1">{weather.date}</div>
                    <div className="flex items-center gap-1 mb-0.5 text-xs">
                      <Thermometer className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="text-foreground">{weather.tempHigh}°C / {weather.tempLow}°C</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Wind className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="text-foreground">{weather.windDirection} {weather.windSpeed}km/h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 鸟类种类占比 */}
            <div className="tech-card p-3">
              <div className="card-title text-xs">鸟类种类占比</div>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={mockData.birdSpecies} cx="50%" cy="50%" innerRadius={25} outerRadius={40} fill="#8884d8" dataKey="count">
                    {mockData.birdSpecies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {mockData.birdSpecies.map((species, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{species.name}</span>
                    <span className="text-foreground font-semibold">{species.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 最新监测动态 */}
            <div className="tech-card p-3 flex-1 min-h-0">
              <div className="card-title text-xs">最新监测动态</div>
              <div className="space-y-1.5 text-xs overflow-hidden">
                {visibleMonitoring.map((item, idx) => (
                  <div key={idx} className="stat-box" style={{ animation: `fadeIn 0.5s ease-in-out ${idx * 0.1}s` }}>
                    <div className="text-accent font-semibold text-xs">{item.species}</div>
                    <div className="text-foreground text-xs mt-0.5">{item.location}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-box {
          background: rgba(26, 37, 85, 0.4);
          border: 1px solid rgba(0, 217, 255, 0.15);
          border-radius: 6px;
          padding: 8px;
        }

        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #00D9FF;
        }
      `}</style>
    </div>
  );
}
