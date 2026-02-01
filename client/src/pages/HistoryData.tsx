import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, type MockData } from "@/contexts/DataContext";

function getTodayDateString(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/** 简单种子随机：同一种子返回同一序列 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** 根据日期字符串生成种子 */
function dateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 233280;
}

const SPECIES_LIST = ["麻雀", "燕子", "老鹰", "鸽子", "喜鹊", "乌鸦"];
const LOCATION_LIST = ["着陆端", "滑跑端", "离陆端", "跑道东侧", "草坪区", "塔台区域"];
const COLOR_LIST = ["#00D9FF", "#0099FF", "#00FF88", "#FF00FF", "#FFD700", "#FF6B6B"];
const TIME_SLOTS = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
const SEGMENT_SLOTS = ["凌晨", "上午", "中午", "下午", "傍晚", "夜晚"];

/** 根据选择日期生成随机数据 */
function getHistoryDisplayData(raw: MockData, selectedDate: string): MockData & { hasData: boolean } {
  const seed = dateSeed(selectedDate);
  const rnd = seededRandom(seed);

  // 监测记录：先从真实数据筛选，没有则随机生成
  const recentForDate = (raw.recentMonitoring || []).filter((m) => m.time.startsWith(selectedDate));
  let recentMonitoring: MockData["recentMonitoring"];
  if (recentForDate.length > 0) {
    recentMonitoring = recentForDate;
  } else {
    // 随机生成 3-8 条监测记录
    const count = Math.floor(3 + rnd() * 6);
    recentMonitoring = [];
    for (let i = 0; i < count; i++) {
      const hour = Math.floor(6 + rnd() * 15);
      const minute = Math.floor(rnd() * 60);
      recentMonitoring.push({
        species: SPECIES_LIST[Math.floor(rnd() * SPECIES_LIST.length)],
        location: LOCATION_LIST[Math.floor(rnd() * LOCATION_LIST.length)],
        time: `${selectedDate} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      });
    }
    recentMonitoring.sort((a, b) => b.time.localeCompare(a.time));
  }

  // 鸟类种类分布：随机生成
  const birdSpecies = SPECIES_LIST.slice(0, 4).map((name, i) => ({
    name,
    count: Math.floor(100 + rnd() * 500),
    color: COLOR_LIST[i],
  }));

  // 区域统计：随机生成
  const locations = LOCATION_LIST.slice(0, 3).map((name, i) => ({
    id: i + 1,
    name,
    totalCount: Math.floor(200 + rnd() * 800),
  }));

  // 当日活动：随机生成
  const dailyActivityData = TIME_SLOTS.map((time) => ({
    time,
    count: Math.floor(50 + rnd() * 500),
  }));

  // 预测vs实际：随机生成
  const predictionVsActualData = TIME_SLOTS.map((time) => {
    const actual = Math.floor(100 + rnd() * 400);
    const predicted = Math.floor(actual * (0.8 + rnd() * 0.4));
    return { time, predicted, actual };
  });

  // 时段分析：随机生成
  const timeSegmentAnalysisData = SEGMENT_SLOTS.map((time) => ({
    time,
    count: Math.floor(50 + rnd() * 300),
  }));

  return {
    locations,
    birdSpecies,
    recentMonitoring,
    weeklyBirdData: [],
    dailyActivityData,
    predictionVsActualData,
    timeSegmentAnalysisData,
    hasData: true,
  };
}

export default function HistoryData() {
  const { data: contextData, loading } = useData();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString);

  const displayData = useMemo(() => {
    if (!contextData) return null;
    return getHistoryDisplayData(contextData, selectedDate);
  }, [contextData, selectedDate]);

  if (loading || !contextData || !displayData) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center text-foreground">
        加载中...
      </div>
    );
  }

  const monitoringForDate = displayData.recentMonitoring;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{
        backgroundImage: "url('/images/airport-satellite-map.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* 头部：返回按钮 + 标题 + 日期选择 */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1
              className="text-2xl font-bold text-primary"
              style={{ textShadow: "0 0 12px rgba(0, 217, 255, 0.5)" }}
            >
              历史数据查询
            </h1>
          </div>
          <div className="flex items-center gap-3 md:ml-auto">
            <Calendar className="size-5 text-primary" />
            <Label className="text-muted-foreground">选择日期：</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* 当前选择日期 */}
        <div className="mb-6 text-center">
          <span className="text-xl text-primary font-semibold" style={{ textShadow: "0 0 8px rgba(0, 217, 255, 0.4)" }}>
            {selectedDate} 数据概览
          </span>
        </div>

        {/* 监测记录列表 */}
        <Card className="bg-card/90 border-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <span className="size-3 bg-primary rounded-full" />
              当日监测记录 ({monitoringForDate.length} 条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {monitoringForDate.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-medium">{item.species}</span>
                    <span className="text-muted-foreground">@</span>
                    <span className="text-foreground">{item.location}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 鸟类种类分布 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">鸟类种类分布</CardTitle>
            </CardHeader>
            <CardContent>
              {displayData.birdSpecies.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={displayData.birdSpecies}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="count"
                      stroke="rgba(0, 217, 255, 0.3)"
                      strokeWidth={1}
                    >
                      {displayData.birdSpecies.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 21, 53, 0.95)",
                        border: "1px solid #00D9FF",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 各区域鸟情统计 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">各区域鸟情统计</CardTitle>
            </CardHeader>
            <CardContent>
              {displayData.locations.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={displayData.locations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.15)" />
                    <XAxis dataKey="name" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 21, 53, 0.95)",
                        border: "1px solid #FFD700",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="totalCount" fill="#FFD700" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 当日活动分析 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">当日活动分析</CardTitle>
            </CardHeader>
            <CardContent>
              {displayData.dailyActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={displayData.dailyActivityData}>
                    <defs>
                      <linearGradient id="histDailyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FF88" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#00FF88" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 136, 0.15)" />
                    <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 21, 53, 0.95)",
                        border: "1px solid #00FF88",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#00FF88" strokeWidth={2} fill="url(#histDailyGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 时段鸟情分析 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">时段鸟情分析</CardTitle>
            </CardHeader>
            <CardContent>
              {displayData.timeSegmentAnalysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={displayData.timeSegmentAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 153, 255, 0.15)" />
                    <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 21, 53, 0.95)",
                        border: "1px solid #0099FF",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#0099FF" strokeWidth={3} dot={{ fill: "#0099FF", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 预测 vs 实际 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">预测 vs 实际</CardTitle>
            </CardHeader>
            <CardContent>
              {displayData.predictionVsActualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={displayData.predictionVsActualData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 255, 0.15)" />
                    <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#a0aeff" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 21, 53, 0.95)",
                        border: "1px solid #FF00FF",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="predicted" fill="rgba(255, 0, 255, 0.6)" name="预测" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="actual" fill="#FF00FF" name="实际" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">暂无数据</p>
              )}
            </CardContent>
          </Card>

          {/* 数据统计摘要 */}
          <Card className="bg-card/90 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary text-base">数据统计摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">监测记录数</span>
                <span className="text-primary font-bold text-xl">{monitoringForDate.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">鸟类种类</span>
                <span className="text-primary font-bold text-xl">{displayData.birdSpecies.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">监测区域</span>
                <span className="text-primary font-bold text-xl">{displayData.locations.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                <span className="text-muted-foreground">总鸟情数量</span>
                <span className="text-primary font-bold text-xl">
                  {displayData.locations.reduce((sum, loc) => sum + loc.totalCount, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
