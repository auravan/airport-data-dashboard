import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useData, type MockData } from "@/contexts/DataContext";
import AMapBackground from "@/components/AMapBackground";

/** 获取今日日期 YYYY-MM-DD */
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

/** 生成历史 7 天（含今天）的随机数据 */
function generateLast7DaysRandom(displayDate: string): Array<{ date: string; count: number }> {
  const base = new Date(displayDate + "T00:00:00");
  const seed = base.getTime() % 233280;
  const rnd = seededRandom(seed);
  const result: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, count: Math.floor(200 + rnd() * 1200) });
  }
  return result;
}

/** 根据展示日期生成/筛选数据：监测记录按日期过滤，其他图表直接使用实时数据 */
function getDisplayData(raw: MockData, displayDate: string): MockData {
  // 监测记录按日期筛选（只显示今天的）
  const recentForDate = (raw.recentMonitoring || []).filter((m) => m.time.startsWith(displayDate));
  const recentMonitoring =
    recentForDate.length > 0
      ? recentForDate
      : raw.recentMonitoring.length > 0
        ? raw.recentMonitoring.slice(0, 3) // 没有今日数据时显示最近 3 条
        : [
            { species: "—", location: "—", time: `${displayDate} 暂无数据` },
            { species: "—", location: "—", time: `${displayDate} 暂无数据` },
            { species: "—", location: "—", time: `${displayDate} 暂无数据` },
          ];

  // 近 7 天数据：优先使用录入数据，没有则用随机数据填充
  const weeklyBirdData = (() => {
    const randomData = generateLast7DaysRandom(displayDate);
    if (!raw.weeklyBirdData || raw.weeklyBirdData.length === 0) {
      return randomData;
    }
    // 合并：录入的数据优先，缺失日期用随机数据填充
    return randomData.map((rd) => {
      const entered = raw.weeklyBirdData.find((w) => w.date === rd.date);
      return entered ? entered : rd;
    });
  })();

  // 其他图表直接使用上下文中的实时数据
  const timeSlots = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
  const dailyActivityData =
    raw.dailyActivityData?.length > 0
      ? raw.dailyActivityData
      : timeSlots.map((time) => ({ time, count: 0 }));

  const predictionVsActualData =
    raw.predictionVsActualData?.length > 0
      ? raw.predictionVsActualData
      : timeSlots.map((time) => ({ time, predicted: 0, actual: 0 }));

  const segmentSlots = ["凌晨", "上午", "中午", "下午", "傍晚", "夜晚"];
  const timeSegmentAnalysisData =
    raw.timeSegmentAnalysisData?.length > 0
      ? raw.timeSegmentAnalysisData
      : segmentSlots.map((time) => ({ time, count: 0 }));

  const birdSpecies = raw.birdSpecies?.length > 0 ? raw.birdSpecies : [];
  const locations = raw.locations?.length > 0 ? raw.locations : [];

  return {
    locations,
    birdSpecies,
    recentMonitoring,
    weeklyBirdData,
    dailyActivityData,
    predictionVsActualData,
    timeSegmentAnalysisData,
  };
}

export default function Dashboard() {
  const { data: contextData, loading } = useData();
  const [displayDate, setDisplayDate] = useState(getTodayDateString);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const tick = () => setDisplayDate((prev) => {
      const now = getTodayDateString();
      return now !== prev ? now : prev;
    });
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const displayData = contextData ? getDisplayData(contextData, displayDate) : null;

  useEffect(() => {
    if (!displayData) return;
    const len = displayData.recentMonitoring.length;
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % (len || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [displayData]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  if (loading || !contextData || !displayData) {
    return <div className="w-full h-screen bg-background flex items-center justify-center text-foreground">加载中...</div>;
  }

  const recent = displayData.recentMonitoring;
  const visibleMonitoring = [
    recent[scrollIndex % recent.length],
    recent[(scrollIndex + 1) % recent.length],
    recent[(scrollIndex + 2) % recent.length],
  ];

  return (
    <div className="w-full h-screen bg-background relative overflow-hidden">
      {/* 高德地图背景 - 可缩放拖拽 */}
      <AMapBackground
        center={[116.603039, 40.080098]} // 北京首都国际机场
        zoom={14}
      />

      {/* 轻度覆盖层 - 不挡地图操作，颜色调浅 */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }}></div>

      {/* 科幻粒子效果 */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-accent rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-accent rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* 内容容器 - 在地图之上，默认不拦截点击以便中间区域可操作地图 */}
      <div className="relative p-4 h-screen flex flex-col pointer-events-none" style={{ zIndex: 10 }}>
        {/* 标题区域 - 全宽布局，梯形延伸到顶部 */}
        <div className="relative pointer-events-auto" style={{ marginBottom: '2rem' }}>
            {/* 左上角按钮组 - 与标题中轴线对齐 */}
          <div className="left-buttons-group">
            <Link href="/data-entry" className="data-entry-btn-fixed">
              <span className="btn-text">数据录入</span>
            </Link>
            <Link href="/history-data" className="data-entry-btn-fixed">
              <span className="btn-text">历史数据</span>
            </Link>
            <button className="data-entry-btn-fixed">
              <span className="btn-text">识别库</span>
            </button>
          </div>

          {/* 当前时间 - 固定在最右边 */}
          <div className="time-display-fixed">
            <div className="time-text-simple">
              {currentTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>

          {/* 中央梯形标题 - 全宽延伸到顶部 */}
          <div className="trapezoid-header-full">
            <div className="trapezoid-bg-full">
              <div className="trapezoid-content px-8 py-6">
                <h1 className="main-title text-center" style={{
                  textShadow: "0 0 40px rgba(0, 217, 255, 0.8), 0 0 80px rgba(0, 217, 255, 0.4), 0 0 120px rgba(0, 217, 255, 0.2)",
                  background: "linear-gradient(45deg, #00D9FF, #0099FF, #00FF88)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  机场鸟情监测控制中心
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* 主网格布局 - 3列布局，中间为空可操作地图 */}
        <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
          {/* 左侧列 - 需可点击图表 */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            {/* 左上 - 下周鸟情预测折线图 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">近7天鸟情</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={displayData.weeklyBirdData}>
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.15)" />
                  <XAxis dataKey="date" stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 21, 53, 0.95)",
                      border: "1px solid #00D9FF",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(0, 217, 255, 0.3)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00D9FF"
                    strokeWidth={3}
                    fill="url(#weeklyGradient)"
                    dot={{ fill: '#00D9FF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#00D9FF', strokeWidth: 2, fill: '#0a0e27' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 左中 - 当日鸟情活动 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">当日鸟情活动分析</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={displayData.dailyActivityData}>
                  <defs>
                    <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF88" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#00FF88" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 136, 0.15)" />
                  <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 21, 53, 0.95)",
                      border: "1px solid #00FF88",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#00FF88"
                    strokeWidth={2}
                    fill="url(#dailyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 左下 - 昨日预测vs今日实际 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">昨日实际 vs 今日预测</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={displayData.predictionVsActualData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 255, 0.15)" />
                  <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 21, 53, 0.95)",
                      border: "1px solid #FF00FF",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(255, 0, 255, 0.3)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="predicted" fill="rgba(255, 0, 255, 0.6)" name="昨日预测" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="#FF00FF" name="今日实际" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 中间空列 - 用于显示背景图 */}
          <div className="flex items-center justify-center">
            {/* 空容器，保持中间区域透明以显示背景 */}
          </div>

          {/* 右侧列 - 需可点击图表 */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            {/* 右上 - 时段鸟情分析折线图 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">时段鸟情活动分析</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={displayData.timeSegmentAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 153, 255, 0.15)" />
                  <XAxis dataKey="time" stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 21, 53, 0.95)",
                      border: "1px solid #0099FF",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(0, 153, 255, 0.3)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0099FF"
                    strokeWidth={3}
                    dot={{ fill: '#0099FF', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#0099FF', strokeWidth: 2, fill: '#0a0e27' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 右中 - 鸟类类型饼图 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">鸟类种类分布</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <div className="flex justify-center items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={displayData.birdSpecies}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        fill="#8884d8"
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
                          boxShadow: "0 0 20px rgba(0, 217, 255, 0.3)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-3">
                  {displayData.birdSpecies.map((species, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: species.color, boxShadow: `0 0 10px ${species.color}80` }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground block truncate">{species.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{species.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右下 - 地点鸟情数量柱状图 */}
            <div className="tech-card p-4 flex-1 min-h-0 scifi-glow">
              <div className="card-title text-lg mb-3">各区域鸟情统计</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={displayData.locations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.15)" />
                  <XAxis dataKey="name" type="category" stroke="#a0aeff" style={{ fontSize: "12px" }} />
                  <YAxis
                    type="number"
                    stroke="#a0aeff"
                    style={{ fontSize: "12px" }}
                    domain={[0, 'dataMax + 100']}
                    tickCount={6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 21, 53, 0.95)",
                      border: "1px solid #FFD700",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)"
                    }}
                  />
                  <Bar
                    dataKey="totalCount"
                    fill="#FFD700"
                    radius={[0, 4, 4, 0]}
                    stroke="rgba(255, 215, 0, 0.5)"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes hologram {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        @keyframes dataStream {
          0% { transform: translateY(100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }

        .scifi-glow {
          position: relative;
        }

        .scifi-glow::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #00D9FF, #0099FF, #00FF88, #FF00FF, #FFD700);
          border-radius: 12px;
          z-index: -1;
          opacity: 0.1;
          filter: blur(8px);
          animation: flowLight 6s linear infinite;
        }

        .scifi-glow:hover::before {
          opacity: 0.2;
          filter: blur(12px);
        }

        .tech-card {
          background: linear-gradient(135deg, rgba(15, 21, 53, 0.6), rgba(26, 37, 85, 0.4));
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 40px rgba(0, 217, 255, 0.1),
            inset 0 0 40px rgba(0, 217, 255, 0.05);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .tech-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            #00D9FF,
            #0099FF,
            #00FF88,
            #FF00FF,
            #FFD700,
            transparent
          );
          animation: flowLight 4s linear infinite;
        }

        .tech-card:hover {
          border-color: rgba(0, 217, 255, 0.5);
          box-shadow:
            0 0 60px rgba(0, 217, 255, 0.2),
            inset 0 0 60px rgba(0, 217, 255, 0.1);
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #00D9FF;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          position: relative;
          text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
        }

        .card-title::before {
          content: '';
          width: 12px;
          height: 12px;
          background: #00D9FF;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.9);
          animation: pulse 2s ease-in-out infinite;
        }

        .stat-box {
          background: linear-gradient(135deg, rgba(26, 37, 85, 0.6), rgba(15, 21, 53, 0.4));
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 8px;
          padding: 10px;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.08);
        }

        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #00D9FF;
          text-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
        }

        /* 网格背景效果 */
        .grid-overlay {
          background-image:
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: dataStream 20s linear infinite;
        }

        /* 全息扫描线 */
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00D9FF, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* 左上角按钮组 */
        .left-buttons-group {
          position: fixed;
          top: 2.5rem;
          left: 1rem;
          display: flex;
          flex-direction: row;
          gap: 8px;
          z-index: 1100;
        }

        /* 按钮基础样式 */
        .data-entry-btn-fixed {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          font-size: 18px;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(0, 217, 255, 0.4);
          background: linear-gradient(135deg, rgba(15, 21, 53, 0.9), rgba(26, 37, 85, 0.7));
          color: #00D9FF;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
          text-shadow: 0 0 8px rgba(0, 217, 255, 0.6);
        }

        /* 平行四边形样式 */
        .data-entry-btn-fixed,
        .data-entry-btn-fixed.right-btn {
          transform: skew(-15deg);
          border-radius: 0;
        }

        .data-entry-btn-fixed .btn-text,
        .data-entry-btn-fixed.right-btn .btn-text {
          transform: skew(15deg);
          display: block;
        }

        .data-entry-btn-fixed:hover {
          border-color: rgba(0, 217, 255, 0.8);
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(0, 153, 255, 0.1));
          color: #00D9FF;
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.5);
          transform: skew(-15deg) translateY(-2px);
        }

        .data-entry-btn-fixed .btn-text {
          font-size: 18px;
          white-space: nowrap;
        }

        /* 固定定位的时间显示与数据日期 */
        .time-display-fixed {
          position: fixed;
          top: 3.5rem;
          right: 15rem;
          text-align: center;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .time-display-fixed .time-text-simple {
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: 600;
          color: #00D9FF;
          text-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
          white-space: nowrap;
        }

        /* 全宽梯形标题 */
        .trapezoid-header-full {
          width: 100%;
          position: relative;
        }

        .trapezoid-bg-full {
          clip-path: polygon(15% 0%, 100% 0%, 95% 100%, 10% 100%);
          background: linear-gradient(135deg, rgba(15, 21, 53, 0.85), rgba(26, 37, 85, 0.65));
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 0;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 40px rgba(0, 217, 255, 0.2),
            inset 0 0 40px rgba(0, 217, 255, 0.1);
          position: relative;
          overflow: hidden;
          min-height: 80px;
        }

        /* 主标题 */
        .main-title {
          font-size: 32px;
          font-weight: 700;
          color: #00D9FF;
          text-shadow:
            0 0 40px rgba(0, 217, 255, 0.8),
            0 0 80px rgba(0, 217, 255, 0.6),
            0 0 120px rgba(0, 217, 255, 0.4);
          background: linear-gradient(45deg, #00D9FF, #0099FF, #00FF88);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          white-space: nowrap;
        }

        /* 梯形内容容器 */
        .trapezoid-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
