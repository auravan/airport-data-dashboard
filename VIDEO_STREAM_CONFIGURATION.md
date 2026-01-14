# 机场周边鸟类大屏 - 视频流配置指南

## 1. 视频流概述

大屏中的"鸟类识别实时监控录像"区域可以显示实时视频流。目前为**模拟占位符**，您可以根据需要配置真实的视频源。

### 视频区域位置

在大屏左侧上方，标题为"鸟类识别实时监控录像"的卡片。

---

## 2. 支持的视频源类型

### 2.1 HTTP 流（推荐）

**协议**：HTTP/HTTPS

**格式**：M3U8、MP4、WebM 等

**示例**：
```
https://example.com/stream.m3u8
https://example.com/camera-feed.mp4
```

**优点**：
- 跨域友好（支持 CORS）
- 浏览器原生支持
- 无需额外插件

---

### 2.2 RTSP 流

**协议**：RTSP（Real Time Streaming Protocol）

**示例**：
```
rtsp://camera-ip:554/stream
```

**注意**：
- 浏览器不原生支持 RTSP
- 需要通过服务器代理转换为 HTTP/HLS
- 需要升级项目到 **web-db-user** 版本以添加代理服务

---

### 2.3 WebRTC 流

**协议**：WebRTC

**优点**：
- 低延迟
- 双向通信
- 现代浏览器支持

**需求**：
- WebRTC 服务器（如 Janus、Kurento）
- 升级到 **web-db-user** 版本

---

## 3. 配置方法

### 方法 1：使用 HTTP 直播流（最简单）

#### 步骤 1：获取视频流 URL

从您的摄像头或直播服务获取 HTTP 流地址，例如：
```
https://your-camera-server.com/stream.m3u8
```

#### 步骤 2：修改前端代码

编辑文件：`/client/src/pages/Dashboard.tsx`

找到以下代码（大约在第 170-185 行）：

```tsx
{/* 鸟类识别实时监控 */}
<div className="tech-card p-3 h-40 relative">
  <div className="card-title text-sm">鸟类识别实时监控录像</div>
  <div className="w-full h-full bg-black/50 rounded border border-accent/40 flex items-center justify-center relative overflow-hidden">
    <div className="text-center z-10">
      <Eye className="w-10 h-10 text-accent mx-auto mb-2 animate-pulse" />
      <p className="text-foreground text-xs">实时视频流</p>
      <p className="text-muted-foreground text-xs mt-0.5">AI识别系统就绪</p>
    </div>
    ...
  </div>
</div>
```

替换为：

```tsx
{/* 鸟类识别实时监控 */}
<div className="tech-card p-3 h-40 relative">
  <div className="card-title text-sm">鸟类识别实时监控录像</div>
  <div className="w-full h-full bg-black/50 rounded border border-accent/40 relative overflow-hidden">
    <video 
      width="100%" 
      height="100%" 
      controls 
      autoPlay 
      muted 
      style={{ objectFit: 'cover' }}
    >
      <source src="YOUR_STREAM_URL" type="application/x-mpegURL" />
      您的浏览器不支持视频播放
    </video>
    <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.2), transparent)", backgroundSize: "200% 100%", animation: "flowLight 3s linear infinite" }}></div>
  </div>
</div>
```

**替换 `YOUR_STREAM_URL` 为您的实际流地址**，例如：
```tsx
<source src="https://your-camera-server.com/stream.m3u8" type="application/x-mpegURL" />
```

#### 步骤 3：保存并测试

1. 保存文件
2. 刷新浏览器
3. 检查视频是否正常播放

---

### 方法 2：使用 HLS.js 库（支持更多格式）

如果简单的 `<video>` 标签不能满足需求，可以使用 HLS.js 库。

#### 步骤 1：安装 HLS.js

```bash
cd /home/ubuntu/airport-bird-dashboard
pnpm add hls.js
```

#### 步骤 2：修改代码

编辑文件：`/client/src/pages/Dashboard.tsx`

在文件顶部添加导入：

```tsx
import HLS from 'hls.js';
import { useRef, useEffect } from 'react';
```

在组件中添加视频播放逻辑：

```tsx
const videoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
  if (videoRef.current && HLS.isSupported()) {
    const hls = new HLS();
    hls.loadSource('YOUR_STREAM_URL');
    hls.attachMedia(videoRef.current);
  }
}, []);

// 在 JSX 中使用：
<video 
  ref={videoRef}
  width="100%" 
  height="100%" 
  controls 
  autoPlay 
  muted 
  style={{ objectFit: 'cover' }}
/>
```

---

### 方法 3：集成 RTSP 流（需要后端代理）

RTSP 流需要通过服务器代理转换为 HTTP/HLS。

#### 前置条件

- 升级项目到 **web-db-user** 版本
- 安装 FFmpeg 服务器（如 Nginx + RTMP 模块）

#### 步骤 1：升级项目

在 Manus 管理界面中，选择"添加功能"→"web-db-user"

#### 步骤 2：配置后端代理

在升级后的项目中，编辑 `/server/index.ts`，添加 RTSP 代理路由：

```typescript
import { spawn } from 'child_process';

// 添加 RTSP 代理路由
app.get('/api/stream', (req, res) => {
  const rtspUrl = 'rtsp://your-camera-ip:554/stream';
  
  // 使用 FFmpeg 转换 RTSP 为 HLS
  const ffmpeg = spawn('ffmpeg', [
    '-rtsp_transport', 'tcp',
    '-i', rtspUrl,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-b:v', '500k',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-'
  ]);

  ffmpeg.stdout.pipe(res);
  ffmpeg.stderr.on('data', (data) => console.error(data.toString()));
});
```

#### 步骤 3：前端使用代理 URL

```tsx
<source src="/api/stream" type="application/x-mpegURL" />
```

---

## 4. 常见视频源配置

### 4.1 常见摄像头品牌

#### 海康威视（Hikvision）

```
http://camera-ip:8000/stream
rtsp://camera-ip:554/h264/ch1/main/av_stream
```

#### 大华（Dahua）

```
rtsp://camera-ip:554/stream1
http://camera-ip:8080/mjpg/video.mjpg
```

#### 宇视（Uniview）

```
rtsp://camera-ip:554/media/video1
http://camera-ip:8080/stream
```

#### 萤石云（Ezviz）

```
https://open.ys7.com/api/livestream/accessResource
```

### 4.2 在线直播服务

#### YouTube Live

```
https://manifest.googlevideo.com/api/manifest/hls_variant/...
```

#### Twitch

```
https://usher.ttvnw.net/api/channel/hls/channel_name.m3u8
```

---

## 5. 视频播放常见问题

### Q: 视频无法播放？

**可能原因和解决方案**：

1. **CORS 错误**
   - 错误信息：`Access to XMLHttpRequest blocked by CORS policy`
   - 解决：确保视频服务器支持 CORS，或使用后端代理

2. **格式不支持**
   - 检查浏览器是否支持该视频格式
   - 推荐使用 HLS（.m3u8）或 MP4 格式

3. **流地址错误**
   - 验证流地址是否正确
   - 在浏览器中直接访问流地址测试

4. **防火墙/网络问题**
   - 检查网络连接
   - 确保摄像头和浏览器在同一网络或有公网访问权限

### Q: 视频延迟很高？

**解决方案**：

1. 降低视频码率（在摄像头设置中）
2. 使用 WebRTC 而不是 HLS（延迟更低）
3. 使用 UDP 而不是 TCP 传输

### Q: 如何添加 AI 识别框选？

需要升级到 **web-db-user** 版本并集成 AI 模型（如 YOLOv8）。

---

## 6. 视频配置最佳实践

| 场景 | 推荐方案 | 优点 | 缺点 |
|------|--------|------|------|
| 本地 HTTP 流 | 直接 `<video>` 标签 | 简单，无需额外配置 | 不支持 RTSP |
| 远程 RTSP 摄像头 | 后端代理 + HLS.js | 支持所有摄像头 | 需要后端配置 |
| 低延迟需求 | WebRTC | 延迟 < 1 秒 | 需要 WebRTC 服务器 |
| 多摄像头 | 负载均衡器 + 代理 | 可扩展性强 | 配置复杂 |

---

## 7. 性能优化建议

1. **视频码率**：500-2000 kbps（根据网络带宽调整）
2. **分辨率**：720p 或 1080p（不要超过 1080p）
3. **帧率**：25-30 fps
4. **缓冲时间**：2-3 秒

---

## 8. 安全建议

1. **认证**：使用用户名和密码保护摄像头访问
   ```
   rtsp://username:password@camera-ip:554/stream
   ```

2. **加密**：使用 HTTPS 而不是 HTTP
   ```
   https://camera-server.com/stream.m3u8
   ```

3. **防火墙**：限制摄像头访问 IP 范围

4. **令牌过期**：定期更新访问令牌

---

## 9. 下一步

- 配置完视频流后，请参考 **部署流程指南** 进行部署
- 如需 AI 识别功能，请升级到 **web-db-user** 版本
- 如需多摄像头支持，请联系技术支持
