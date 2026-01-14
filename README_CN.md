# 机场周边鸟类信息汇总大屏

一个专业的**科技感数据可视化大屏**，用于实时监测和分析机场周边的鸟类活动数据。

## 🎯 功能特性

### 核心功能

- **实时监控录像**：集成视频流播放，支持 HTTP/RTSP 等多种协议
- **时段监测**：柱状图展示不同地点的鸟类数量，支持日期范围筛选
- **地点汇总**：卡片式展示各监测地点的历史累计数据
- **鸟类种类占比**：环形图直观展示不同物种的分布比例
- **趋势分析**：折线图显示鸟类总数的长期变化趋势
- **实时天气**：展示当日及未来两天的气象数据
- **监测动态**：自动滚动显示最新的鸟类监测记录

### 设计特点

- 🎨 **科技感设计**：深蓝背景 + 青蓝色高亮 + 动态流光效果
- 📱 **响应式布局**：左侧大图表 + 右侧卡片堆叠，专业数据展示
- ✨ **动画效果**：发光边框、流光线条、脉冲动画等
- 🗺️ **卫星地图底图**：真实的机场周边地理背景
- 🔄 **实时更新**：支持动态数据刷新和自动滚动

---

## 📁 项目结构

```
airport-bird-dashboard/
├── client/
│   ├── public/
│   │   ├── mock-data.json              # 📊 数据配置文件
│   │   └── images/
│   │       └── airport-satellite-map.jpg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # 🎨 主大屏组件
│   │   │   └── Home.tsx
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.css                   # 🎨 全局样式
│   └── index.html
├── server/
│   └── index.ts                        # 🔧 后端服务器
├── QUICK_START.md                      # ⚡ 快速开始指南
├── DATA_CONFIGURATION.md               # 📊 数据配置详细指南
├── VIDEO_STREAM_CONFIGURATION.md       # 📹 视频流配置详细指南
├── DEPLOYMENT_GUIDE.md                 # 🚀 部署流程详细指南
├── package.json
└── README_CN.md                        # 📖 本文件
```

---

## 🚀 快速开始

### 1️⃣ 修改数据

打开 `/client/public/mock-data.json`，修改以下内容：

```json
{
  "locations": [
    { "id": 1, "name": "您的地点", "totalCount": 1245 }
  ],
  "timeSegmentData": [
    { "location": "您的地点", "count": 145 }
  ],
  "birdSpecies": [
    { "name": "物种名称", "count": 520, "color": "#00D9FF" }
  ],
  "trendData": [
    { "date": "2024-01-14", "count": 1520 }
  ],
  "weatherData": { ... },
  "recentMonitoring": [ ... ]
}
```

**详细说明**：参考 [`DATA_CONFIGURATION.md`](./DATA_CONFIGURATION.md)

### 2️⃣ 配置视频流

打开 `/client/src/pages/Dashboard.tsx`，找到视频区域（约第 170 行），替换为：

```tsx
<video 
  width="100%" 
  height="100%" 
  controls 
  autoPlay 
  muted 
  style={{ objectFit: 'cover' }}
>
  <source src="https://your-camera.com/stream.m3u8" type="application/x-mpegURL" />
</video>
```

**详细说明**：参考 [`VIDEO_STREAM_CONFIGURATION.md`](./VIDEO_STREAM_CONFIGURATION.md)

### 3️⃣ 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 4️⃣ 部署上线

#### 方式 A：Manus 内置托管（推荐）

1. 打开 Manus 管理界面
2. 找到项目，点击 **"Publish"** 发布
3. 获得公网 URL

#### 方式 B：自定义服务器

```bash
# 构建项目
pnpm build

# 启动应用
NODE_ENV=production pnpm start
```

**详细说明**：参考 [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

## 📚 详细文档

| 文档 | 内容 | 适用场景 |
|------|------|--------|
| [`QUICK_START.md`](./QUICK_START.md) | 快速上手指南 | 想快速修改数据和部署 |
| [`DATA_CONFIGURATION.md`](./DATA_CONFIGURATION.md) | 数据配置详解 | 需要详细了解数据结构 |
| [`VIDEO_STREAM_CONFIGURATION.md`](./VIDEO_STREAM_CONFIGURATION.md) | 视频流配置详解 | 需要集成摄像头或直播流 |
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | 部署流程详解 | 需要部署到生产环境 |

---

## 🎨 自定义

### 修改颜色

编辑 `/client/src/index.css`：

```css
:root {
  --primary: #00D9FF;           /* 主色（青蓝色） */
  --background: #0a0e27;        /* 背景色（深蓝） */
  --accent: #00D9FF;            /* 高亮色 */
  /* 其他颜色... */
}
```

### 修改标题

编辑 `/client/src/pages/Dashboard.tsx`：

```tsx
<h1 className="text-3xl font-bold text-accent text-center">
  您的标题
</h1>
```

### 修改布局

编辑 `/client/src/pages/Dashboard.tsx` 中的网格布局：

```tsx
<div className="grid grid-cols-12 gap-3">
  {/* 左侧占 8 列，右侧占 4 列 */}
  <div className="col-span-8">左侧内容</div>
  <div className="col-span-4">右侧内容</div>
</div>
```

---

## 📊 数据格式

### locations（地点汇总）

```json
{
  "id": 1,
  "name": "跑道东侧",
  "totalCount": 1245
}
```

### timeSegmentData（时段监测）

```json
{
  "location": "跑道东侧",
  "count": 145
}
```

### birdSpecies（鸟类种类）

```json
{
  "name": "麻雀",
  "count": 520,
  "color": "#00D9FF"
}
```

### trendData（趋势数据）

```json
{
  "date": "2024-01-14",
  "count": 1520
}
```

### weatherData（天气数据）

```json
{
  "date": "2024-01-14",
  "tempHigh": 28,
  "tempLow": 18,
  "windDirection": "NE",
  "windSpeed": 12,
  "condition": "晴朗"
}
```

### recentMonitoring（监测动态）

```json
{
  "species": "麻雀",
  "location": "跑道东侧",
  "time": "2024-01-14 14:32:45"
}
```

---

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| **React 19** | 前端框架 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS 4** | 样式框架 |
| **Recharts** | 图表库 |
| **Vite** | 构建工具 |
| **Express** | 后端服务器 |

---

## 📱 支持的浏览器

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🎯 常见任务

### 添加新的监测地点

1. 编辑 `/client/public/mock-data.json`
2. 在 `locations` 数组中添加新地点
3. 在 `timeSegmentData` 中添加该地点的数据

### 修改图表类型

编辑 `/client/src/pages/Dashboard.tsx`：

```tsx
// 改为柱状图
<BarChart data={data}>...</BarChart>

// 改为折线图
<LineChart data={data}>...</LineChart>

// 改为环形图
<PieChart data={data}>...</PieChart>
```

### 添加新的卡片

在 `/client/src/pages/Dashboard.tsx` 中复制现有卡片并修改内容。

### 修改更新频率

在 `/client/src/pages/Dashboard.tsx` 中找到 `setInterval`，修改时间间隔（毫秒）：

```tsx
setInterval(() => {
  // 每 3000 毫秒（3 秒）更新一次
  setScrollIndex((prev) => (prev + 1) % mockData.recentMonitoring.length);
}, 3000);  // ← 修改这里
```

---

## 🚨 常见问题

### Q: 如何连接真实数据库？

**A**: 升级项目到 **web-db-user** 版本，然后可以创建数据库表和 API 接口。

### Q: 如何添加 AI 识别框选？

**A**: 需要升级到 **web-db-user** 版本，然后集成 AI 模型（如 YOLOv8）。

### Q: 如何支持多个摄像头？

**A**: 修改 Dashboard 组件，为每个摄像头添加一个视频播放区域。

### Q: 如何优化性能？

**A**: 
- 启用 CDN 加速
- 优化图表数据量
- 使用缓存
- 启用 Gzip 压缩

---

## 📞 技术支持

- 📖 文档：查看项目中的 `.md` 文件
- 🐛 问题：检查浏览器控制台错误信息
- 💬 帮助：访问 https://help.manus.im

---

## 📄 许可证

MIT License

---

## 🎉 下一步

1. ✅ 修改数据（参考 `QUICK_START.md`）
2. ✅ 配置视频流（参考 `VIDEO_STREAM_CONFIGURATION.md`）
3. ✅ 本地测试（运行 `pnpm dev`）
4. ✅ 部署上线（参考 `DEPLOYMENT_GUIDE.md`）

**祝您使用愉快！** 🚀

---

**最后更新**：2024-01-14  
**版本**：1.0.0
