# 机场周边鸟类大屏 - 快速开始指南

## 📋 目录

1. [项目结构](#项目结构)
2. [快速修改数据](#快速修改数据)
3. [快速配置视频](#快速配置视频)
4. [快速部署](#快速部署)
5. [常见问题](#常见问题)

---

## 项目结构

```
airport-bird-dashboard/
├── client/
│   ├── public/
│   │   ├── mock-data.json          ← 修改这里：数据配置
│   │   └── images/
│   │       └── airport-satellite-map.jpg
│   └── src/
│       ├── pages/
│       │   └── Dashboard.tsx        ← 修改这里：视频流配置
│       └── index.css
├── DATA_CONFIGURATION.md            ← 详细数据配置指南
├── VIDEO_STREAM_CONFIGURATION.md    ← 详细视频流配置指南
├── DEPLOYMENT_GUIDE.md              ← 详细部署指南
└── README.md
```

---

## 快速修改数据

### 1. 打开数据文件

```
/client/public/mock-data.json
```

### 2. 修改监测地点

找到 `locations` 部分，修改地点名称和数据：

```json
"locations": [
  { "id": 1, "name": "您的地点1", "totalCount": 1245 },
  { "id": 2, "name": "您的地点2", "totalCount": 892 }
]
```

### 3. 修改时段监测数据

找到 `timeSegmentData` 部分：

```json
"timeSegmentData": [
  { "location": "您的地点1", "count": 145 },
  { "location": "您的地点2", "count": 98 }
]
```

### 4. 修改鸟类种类

找到 `birdSpecies` 部分：

```json
"birdSpecies": [
  { "name": "物种名称", "count": 520, "color": "#00D9FF" }
]
```

### 5. 修改趋势数据

找到 `trendData` 部分（日期必须按顺序）：

```json
"trendData": [
  { "date": "2024-01-08", "count": 450 },
  { "date": "2024-01-09", "count": 520 }
]
```

### 6. 修改天气数据

找到 `weatherData` 部分：

```json
"weatherData": {
  "today": {
    "date": "2024-01-14",
    "tempHigh": 28,
    "tempLow": 18,
    "windDirection": "NE",
    "windSpeed": 12,
    "condition": "晴朗"
  }
}
```

### 7. 修改监测动态

找到 `recentMonitoring` 部分：

```json
"recentMonitoring": [
  { "species": "物种名称", "location": "地点名称", "time": "2024-01-14 14:32:45" }
]
```

### 8. 保存并刷新

- 保存文件
- 刷新浏览器（F5）
- 数据会自动更新

**详细说明**：参考 [`DATA_CONFIGURATION.md`](./DATA_CONFIGURATION.md)

---

## 快速部署
#### 步骤 1：安装依赖

```bash
pnpm install
```

#### 步骤 2：构建项目

```bash
pnpm build
```

#### 步骤 3：启动应用

```bash
# 使用 PM2（推荐）
npm install -g pm2
pm2 start "npm run start" --name "bird-dashboard"或者“pnpm run dev”
```

---

**A**: 
- **标题**：编辑 `Dashboard.tsx` 中的 `<h1>` 标签
- **颜色**：编辑 `index.css` 中的 CSS 变量

---

## 下一步

1. **修改数据**：按照上面的步骤修改 `mock-data.json`
2. **配置视频**：按照上面的步骤配置视频流
3. **本地测试**：运行 `pnpm dev` 在本地测试
4. **部署上线**：按照上面的步骤部署到生产环境

---

## 文件位置速查表

| 功能 | 文件位置 | 说明 |
|------|--------|------|
| 修改数据 | `/client/public/mock-data.json` | JSON 格式数据 |
| 修改视频 | `/client/src/pages/Dashboard.tsx` | React 组件 |
| 修改颜色 | `/client/src/index.css` | CSS 变量 |
| 修改标题 | `/client/src/pages/Dashboard.tsx` | React 组件 |
| 详细数据指南 | `./DATA_CONFIGURATION.md` | 完整文档 |
| 详细视频指南 | `./VIDEO_STREAM_CONFIGURATION.md` | 完整文档 |

---

## 命令速查表

```bash
# 开发环境
pnpm dev              # 启动开发服务器

# 生产环境
pnpm build            # 构建项目
npm run start         # 启动应用
NODE_ENV=production pnpm start  # 生产模式启动

# 进程管理
pm2 start "npm run start" --name "bird-dashboard"  # 启动应用
pm2 status            # 查看状态
pm2 logs              # 查看日志
pm2 restart           # 重启应用
pm2 stop              # 停止应用
```

---

## 获取帮助

- 📖 详细文档：查看项目中的 `.md` 文件
- 🐛 遇到问题：检查浏览器控制台错误信息
- 💬 技术支持：访问 https://help.manus.im

---

**祝您使用愉快！** 🚀
