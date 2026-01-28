# 机场周边鸟类大屏 - 数据配置指南

## 1. 数据源概述

大屏系统使用 JSON 格式的数据文件作为数据源。目前采用**模拟数据**，您可以根据需要修改或替换为真实数据。

### 数据文件位置

```
/client/public/mock-data.json
```

## 2. 数据结构说明

### 2.1 完整数据结构

```json
{
  "locations": [
    { "id": 1, "name": "地点名称", "totalCount": 总数 }
  ],
  "timeSegmentData": [
    { "location": "地点名称", "count": 数量 }
  ],
  "birdSpecies": [
    { "name": "物种名称", "count": 数量, "color": "#颜色代码" }
  ],
  "trendData": [
    { "date": "YYYY-MM-DD", "count": 数量 }
  ],
  "weatherData": {
    "today": { "date": "YYYY-MM-DD", "tempHigh": 最高温, "tempLow": 最低温, "windDirection": "风向", "windSpeed": 风速, "condition": "天气状况" },
    "tomorrow": { ... },
    "dayAfter": { ... }
  },
  "recentMonitoring": [
    { "species": "物种名称", "location": "地点名称", "time": "YYYY-MM-DD HH:MM:SS" }
  ]
}
```

## 3. 各字段详细说明

### 3.1 locations（地点汇总）

展示每个监测地点的历史累计鸟类数量。

**修改位置**：`mock-data.json` 中的 `locations` 数组

**示例**：
```json
"locations": [
  { "id": 1, "name": "跑道东侧", "totalCount": 1245 },
  { "id": 2, "name": "塔台区域", "totalCount": 892 },
  { "id": 3, "name": "草坪区", "totalCount": 756 }
]
```

**修改方法**：
- `id`：唯一标识符（整数）
- `name`：地点名称（字符串）
- `totalCount`：累计鸟类数量（整数）

---

### 3.2 timeSegmentData（时段监测）

显示不同地点在当前时间段内的鸟类出现数量。

**修改位置**：`mock-data.json` 中的 `timeSegmentData` 数组

**示例**：
```json
"timeSegmentData": [
  { "location": "跑道东侧", "count": 145 },
  { "location": "塔台区域", "count": 98 },
  { "location": "草坪区", "count": 67 }
]
```

**修改方法**：
- `location`：地点名称（必须与 `locations` 中的名称一致）
- `count`：该时段的鸟类数量（整数）

---

### 3.3 birdSpecies（鸟类种类占比）

展示不同鸟类物种的数量分布和占比。

**修改位置**：`mock-data.json` 中的 `birdSpecies` 数组

**示例**：
```json
"birdSpecies": [
  { "name": "麻雀", "count": 520, "color": "#00D9FF" },
  { "name": "燕子", "count": 380, "color": "#0099FF" },
  { "name": "老鹰", "count": 210, "color": "#00FF88" },
  { "name": "鸽子", "count": 183, "color": "#FF00FF" }
]
```

**修改方法**：
- `name`：鸟类物种名称（字符串）
- `count`：该物种的观测数量（整数）
- `color`：环形图中该物种的颜色（十六进制颜色代码）

**推荐颜色**：
- 青蓝色：`#00D9FF`
- 蓝色：`#0099FF`
- 绿色：`#00FF88`
- 紫红色：`#FF00FF`
- 金黄色：`#FFD700`

---

### 3.4 trendData（鸟类总数趋势）

显示每日鸟类总数的变化趋势。

**修改位置**：`mock-data.json` 中的 `trendData` 数组

**示例**：
```json
"trendData": [
  { "date": "2024-01-08", "count": 450 },
  { "date": "2024-01-09", "count": 520 },
  { "date": "2024-01-10", "count": 680 }
]
```

**修改方法**：
- `date`：日期（格式：`YYYY-MM-DD`）
- `count`：该日期的鸟类总数（整数）

**注意**：
- 日期必须按时间顺序排列
- 建议保留至少7天的数据以显示完整的趋势

---

### 3.5 weatherData（实时天气信息）

显示当日及未来两天的天气数据。

**修改位置**：`mock-data.json` 中的 `weatherData` 对象

**示例**：
```json
"weatherData": {
  "today": {
    "date": "2024-01-14",
    "tempHigh": 28,
    "tempLow": 18,
    "windDirection": "NE",
    "windSpeed": 12,
    "condition": "晴朗"
  },
  "tomorrow": { ... },
  "dayAfter": { ... }
}
```

**修改方法**：
- `date`：日期（格式：`YYYY-MM-DD`）
- `tempHigh`：最高温度（整数，单位：℃）
- `tempLow`：最低温度（整数，单位：℃）
- `windDirection`：风向（字符串，如：`NE`、`E`、`SE` 等）
- `windSpeed`：风速（整数，单位：km/h）
- `condition`：天气状况（字符串，如：`晴朗`、`多云`、`阴天`、`雨天` 等）

---

### 3.6 recentMonitoring（最新监测动态）

实时滚动显示最新的鸟类监测记录。

**修改位置**：`mock-data.json` 中的 `recentMonitoring` 数组

**示例**：
```json
"recentMonitoring": [
  { "species": "麻雀", "location": "跑道东侧", "time": "2024-01-14 14:32:45" },
  { "species": "燕子", "location": "草坪区", "time": "2024-01-14 14:31:22" }
]
```

**修改方法**：
- `species`：鸟类物种名称（字符串）
- `location`：观测地点（字符串）
- `time`：观测时间（格式：`YYYY-MM-DD HH:MM:SS`）

**注意**：
- 建议保留至少8-10条最新记录
- 时间应该按降序排列（最新的在前）

---

## 4. 如何修改数据

### 方法 1：直接编辑 JSON 文件

1. 打开文件：`/client/public/mock-data.json`
2. 修改相应的数据字段
3. 保存文件
4. 刷新浏览器（开发环境会自动热更新）

### 方法 2：连接真实数据库（高级）

如果您需要连接真实的数据库或 API，需要升级项目到 **web-db-user** 版本：

```bash
# 升级项目（需要在 Manus 管理界面中操作）
# 或通过以下命令（如果支持）
pnpm webdev:add-feature web-db-user
```

升级后可以：
- 创建数据库表存储鸟类监测数据
- 编写后端 API 接口获取实时数据
- 实现数据的动态更新

---

## 5. 数据验证

修改数据后，请检查以下几点：

- ✅ JSON 格式是否正确（使用 JSON 验证工具）
- ✅ 所有必需字段是否都已填写
- ✅ 日期格式是否为 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:MM:SS`
- ✅ 数字字段是否为整数或浮点数
- ✅ 颜色代码是否为有效的十六进制格式（如 `#00D9FF`）
- ✅ 地点名称在不同数据集中是否保持一致

---

## 6. 常见问题

### Q: 修改数据后页面没有更新？
**A**: 
- 检查 JSON 文件是否保存成功
- 清除浏览器缓存（Ctrl+Shift+Delete）
- 刷新页面（F5 或 Ctrl+R）
- 如果仍未更新，检查浏览器控制台是否有错误信息

### Q: 如何添加新的监测地点？
**A**: 
1. 在 `locations` 数组中添加新地点
2. 在 `timeSegmentData` 中为新地点添加数据
3. 确保地点名称一致

### Q: 可以添加超过 3 个监测地点吗？
**A**: 可以。只需在 `locations` 和 `timeSegmentData` 中添加更多地点即可。布局会自动适应。

### Q: 如何修改环形图的颜色？
**A**: 修改 `birdSpecies` 数组中每个物种的 `color` 字段，使用十六进制颜色代码。

---

## 7. 数据示例完整版

完整的 `mock-data.json` 文件示例：

```json
{
  "locations": [
    { "id": 1, "name": "跑道东侧", "totalCount": 1245 },
    { "id": 2, "name": "塔台区域", "totalCount": 892 },
    { "id": 3, "name": "草坪区", "totalCount": 756 }
  ],
  "timeSegmentData": [
    { "location": "跑道东侧", "count": 145 },
    { "location": "塔台区域", "count": 98 },
    { "location": "草坪区", "count": 67 }
  ],
  "birdSpecies": [
    { "name": "麻雀", "count": 520, "color": "#00D9FF" },
    { "name": "燕子", "count": 380, "color": "#0099FF" },
    { "name": "老鹰", "count": 210, "color": "#00FF88" },
    { "name": "鸽子", "count": 183, "color": "#FF00FF" }
  ],
  "trendData": [
    { "date": "2024-01-08", "count": 450 },
    { "date": "2024-01-09", "count": 520 },
    { "date": "2024-01-10", "count": 680 },
    { "date": "2024-01-11", "count": 890 },
    { "date": "2024-01-12", "count": 1100 },
    { "date": "2024-01-13", "count": 1320 },
    { "date": "2024-01-14", "count": 1520 }
  ],
  "weatherData": {
    "today": {
      "date": "2024-01-14",
      "tempHigh": 28,
      "tempLow": 18,
      "windDirection": "NE",
      "windSpeed": 12,
      "condition": "晴朗"
    },
    "tomorrow": {
      "date": "2024-01-15",
      "tempHigh": 26,
      "tempLow": 16,
      "windDirection": "E",
      "windSpeed": 8,
      "condition": "多云"
    },
    "dayAfter": {
      "date": "2024-01-16",
      "tempHigh": 24,
      "tempLow": 14,
      "windDirection": "SE",
      "windSpeed": 15,
      "condition": "阴天"
    }
  },
  "recentMonitoring": [
    { "species": "麻雀", "location": "跑道东侧", "time": "2024-01-14 14:32:45" },
    { "species": "燕子", "location": "草坪区", "time": "2024-01-14 14:31:22" },
    { "species": "鸽子", "location": "塔台区域", "time": "2024-01-14 14:29:18" },
    { "species": "老鹰", "location": "跑道东侧", "time": "2024-01-14 14:27:05" },
    { "species": "麻雀", "location": "草坪区", "time": "2024-01-14 14:25:33" },
    { "species": "燕子", "location": "塔台区域", "time": "2024-01-14 14:23:11" },
    { "species": "鸽子", "location": "跑道东侧", "time": "2024-01-14 14:21:44" },
    { "species": "麻雀", "location": "塔台区域", "time": "2024-01-14 14:19:29" }
  ]
}
```

---
- 如需后续升级请联系技术支持auravan
