import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";

const LOCATION_OPTIONS = ["着陆端", "滑跑端", "离陆端", "跑道东侧", "草坪区", "塔台区域"];
const SPECIES_OPTIONS = ["麻雀", "燕子", "老鹰", "鸽子"];
const TIME_SLOTS = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
const SEGMENT_OPTIONS = ["凌晨", "上午", "中午", "下午", "傍晚", "夜晚"];
const COLOR_OPTIONS = ["#00D9FF", "#0099FF", "#00FF88", "#FF00FF", "#FFD700"];

function getTodayDateString(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function nowDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 生成近 7 天日期列表 */
function getLast7Days(): Array<{ value: string; label: string }> {
  const result: Array<{ value: string; label: string }> = [];
  const today = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const dayLabel = i === 0 ? "今天" : i === 1 ? "昨天" : weekdays[d.getDay()];
    result.push({ value: dateStr, label: `${dateStr} (${dayLabel})` });
  }
  return result;
}

export default function DataEntry() {
  const {
    addMonitoring,
    updateLocation,
    updateBirdSpecies,
    updateDailyActivity,
    updatePredictionActual,
    updateSegmentAnalysis,
    updateWeeklyBirdData,
  } = useData();

  const last7Days = useMemo(() => getLast7Days(), []);

  const [monitoring, setMonitoring] = useState({ species: "", location: "", time: nowDateTimeLocal().slice(0, 19) });
  const [locationStat, setLocationStat] = useState({ name: "", totalCount: "" });
  const [birdSpecies, setBirdSpecies] = useState({ name: "", count: "", color: COLOR_OPTIONS[0] });
  const [dailyActivity, setDailyActivity] = useState({ time: TIME_SLOTS[0], count: "" });
  const [predictionActual, setPredictionActual] = useState({ time: TIME_SLOTS[0], predicted: "", actual: "" });
  const [segmentAnalysis, setSegmentAnalysis] = useState({ time: SEGMENT_OPTIONS[0], count: "" });
  const [weeklyBird, setWeeklyBird] = useState({ date: getTodayDateString(), count: "" });

  const submitMonitoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitoring.species.trim() || !monitoring.location.trim()) {
      toast.error("请填写物种和地点");
      return;
    }
    const timeStr = monitoring.time.replace("T", " ");
    addMonitoring({ species: monitoring.species, location: monitoring.location, time: timeStr });
    toast.success(`监测记录已提交：${monitoring.species} @ ${monitoring.location}`);
    setMonitoring({ ...monitoring, species: "", location: "", time: nowDateTimeLocal().slice(0, 19) });
  };

  const submitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationStat.name.trim() || locationStat.totalCount === "") {
      toast.error("请填写区域名称和数量");
      return;
    }
    updateLocation(locationStat.name, Number(locationStat.totalCount));
    toast.success(`区域统计已提交：${locationStat.name}，数量 ${locationStat.totalCount}`);
    setLocationStat({ name: "", totalCount: "" });
  };

  const submitBirdSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birdSpecies.name.trim() || birdSpecies.count === "") {
      toast.error("请填写种类名称和数量");
      return;
    }
    updateBirdSpecies(birdSpecies.name, Number(birdSpecies.count), birdSpecies.color);
    toast.success(`鸟类种类已提交：${birdSpecies.name}，数量 ${birdSpecies.count}`);
    setBirdSpecies({ name: "", count: "", color: COLOR_OPTIONS[0] });
  };

  const submitDailyActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (dailyActivity.count === "") {
      toast.error("请填写数量");
      return;
    }
    updateDailyActivity(dailyActivity.time, Number(dailyActivity.count));
    toast.success(`当日活动已提交：${dailyActivity.time}，数量 ${dailyActivity.count}`);
    setDailyActivity({ time: TIME_SLOTS[0], count: "" });
  };

  const submitPredictionActual = (e: React.FormEvent) => {
    e.preventDefault();
    if (predictionActual.predicted === "" || predictionActual.actual === "") {
      toast.error("请填写预测值和实际值");
      return;
    }
    updatePredictionActual(predictionActual.time, Number(predictionActual.predicted), Number(predictionActual.actual));
    toast.success(`预测vs实际已提交：${predictionActual.time}`);
    setPredictionActual({ time: TIME_SLOTS[0], predicted: "", actual: "" });
  };

  const submitSegmentAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (segmentAnalysis.count === "") {
      toast.error("请填写数量");
      return;
    }
    updateSegmentAnalysis(segmentAnalysis.time, Number(segmentAnalysis.count));
    toast.success(`时段分析已提交：${segmentAnalysis.time}，数量 ${segmentAnalysis.count}`);
    setSegmentAnalysis({ time: SEGMENT_OPTIONS[0], count: "" });
  };

  const submitWeeklyBird = (e: React.FormEvent) => {
    e.preventDefault();
    if (weeklyBird.count === "") {
      toast.error("请填写鸟情数量");
      return;
    }
    updateWeeklyBirdData(weeklyBird.date, Number(weeklyBird.count));
    toast.success(`近7天鸟情已提交：${weeklyBird.date}，数量 ${weeklyBird.count}`);
    setWeeklyBird({ date: getTodayDateString(), count: "" });
  };

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
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary" style={{ textShadow: "0 0 12px rgba(0, 217, 255, 0.5)" }}>
            数据录入
          </h1>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-1 mb-4 bg-card/80 border border-primary/20">
            <TabsTrigger value="weekly">近7天鸟情</TabsTrigger>
            <TabsTrigger value="monitoring">监测记录</TabsTrigger>
            <TabsTrigger value="location">区域统计</TabsTrigger>
            <TabsTrigger value="species">鸟类种类</TabsTrigger>
            <TabsTrigger value="daily">当日活动</TabsTrigger>
            <TabsTrigger value="prediction">预测vs实际</TabsTrigger>
            <TabsTrigger value="segment">时段分析</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Calendar className="size-5" />
                  近7天鸟情录入
                </CardTitle>
                <p className="text-sm text-muted-foreground">选择日期录入当日鸟情总数量，用于生成趋势图</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitWeeklyBird} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>选择日期</Label>
                    <Select value={weeklyBird.date} onValueChange={(v) => setWeeklyBird((s) => ({ ...s, date: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {last7Days.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>鸟情总数量</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="当日鸟情总数量"
                      value={weeklyBird.count}
                      onChange={(e) => setWeeklyBird((s) => ({ ...s, count: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>

                {/* 快速录入提示 */}
                <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">快速录入提示：</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>可选择近 7 天内任意日期进行录入</li>
                    <li>同一日期重复录入会覆盖之前的数据</li>
                    <li>录入的数据将显示在首页「近7天鸟情」图表中</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">监测记录</CardTitle>
                <p className="text-sm text-muted-foreground">录入单条鸟情监测：物种、地点、时间</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitMonitoring} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>物种</Label>
                    <Select value={monitoring.species || undefined} onValueChange={(v) => setMonitoring((s) => ({ ...s, species: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择物种" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIES_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>地点</Label>
                    <Select value={monitoring.location || undefined} onValueChange={(v) => setMonitoring((s) => ({ ...s, location: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择地点" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>时间</Label>
                    <Input
                      type="datetime-local"
                      value={monitoring.time}
                      onChange={(e) => setMonitoring((s) => ({ ...s, time: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">区域统计</CardTitle>
                <p className="text-sm text-muted-foreground">录入各区域鸟情数量</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitLocation} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>区域名称</Label>
                    <Select value={locationStat.name || undefined} onValueChange={(v) => setLocationStat((s) => ({ ...s, name: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择区域" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="总数量"
                      value={locationStat.totalCount}
                      onChange={(e) => setLocationStat((s) => ({ ...s, totalCount: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="species">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">鸟类种类</CardTitle>
                <p className="text-sm text-muted-foreground">录入鸟类种类及数量、颜色</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitBirdSpecies} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>种类名称</Label>
                    <Input
                      placeholder="如：麻雀、燕子"
                      value={birdSpecies.name}
                      onChange={(e) => setBirdSpecies((s) => ({ ...s, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="数量"
                      value={birdSpecies.count}
                      onChange={(e) => setBirdSpecies((s) => ({ ...s, count: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>颜色（图表用）</Label>
                    <Select value={birdSpecies.color} onValueChange={(v) => setBirdSpecies((s) => ({ ...s, color: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="inline-flex items-center gap-2">
                              <span className="size-4 rounded-full border" style={{ backgroundColor: c }} />
                              {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">当日活动</CardTitle>
                <p className="text-sm text-muted-foreground">按时段录入当日鸟情数量</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitDailyActivity} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>时段</Label>
                    <Select value={dailyActivity.time} onValueChange={(v) => setDailyActivity((s) => ({ ...s, time: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="数量"
                      value={dailyActivity.count}
                      onChange={(e) => setDailyActivity((s) => ({ ...s, count: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">预测 vs 实际</CardTitle>
                <p className="text-sm text-muted-foreground">按时段录入预测值与实际值</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitPredictionActual} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>时段</Label>
                    <Select value={predictionActual.time} onValueChange={(v) => setPredictionActual((s) => ({ ...s, time: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>预测值</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="预测数量"
                      value={predictionActual.predicted}
                      onChange={(e) => setPredictionActual((s) => ({ ...s, predicted: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>实际值</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="实际数量"
                      value={predictionActual.actual}
                      onChange={(e) => setPredictionActual((s) => ({ ...s, actual: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segment">
            <Card className="bg-card/90 border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">时段分析</CardTitle>
                <p className="text-sm text-muted-foreground">按凌晨/上午/中午等时段录入数量</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitSegmentAnalysis} className="space-y-4">
                  <div className="grid gap-2">
                    <Label>时段</Label>
                    <Select value={segmentAnalysis.time} onValueChange={(v) => setSegmentAnalysis((s) => ({ ...s, time: v }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENT_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="数量"
                      value={segmentAnalysis.count}
                      onChange={(e) => setSegmentAnalysis((s) => ({ ...s, count: e.target.value }))}
                    />
                  </div>
                  <Button type="submit">提交</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
