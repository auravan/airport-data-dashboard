# 机场周边鸟类大屏 - 部署流程指南

## 1. 部署概述

本指南介绍如何将大屏项目部署到生产环境。Manus 平台提供了内置的托管服务，您可以一键发布。

### 部署选项

| 选项 | 说明 | 推荐场景 |
|------|------|--------|
| **Manus 内置托管** | 一键发布，自动 HTTPS | 大多数用户 |
| **自定义域名** | 绑定您的域名 | 企业应用 |
| **外部服务器** | 自行部署到服务器 | 特殊需求 |

---

## 2. Manus 内置托管部署（推荐）

### 2.1 前置条件

- ✅ 项目已完成开发和测试
- ✅ 数据配置已完成（参考 `DATA_CONFIGURATION.md`）
- ✅ 视频流已配置（参考 `VIDEO_STREAM_CONFIGURATION.md`）
- ✅ 所有代码已保存到检查点

### 2.2 部署步骤

#### 步骤 1：创建最终检查点

在项目开发完成后，创建一个最终的检查点以保存所有更改。

```bash
# 在项目目录中运行
cd /home/ubuntu/airport-bird-dashboard

# 确保所有代码已保存
git status

# 如果有未提交的更改，创建新检查点
# （通过 Manus 管理界面或 CLI）
```

#### 步骤 2：访问 Manus 管理界面

1. 打开 Manus 管理界面
2. 找到 "airport-bird-dashboard" 项目
3. 点击项目卡片进入项目详情

#### 步骤 3：发布项目

1. 在管理界面中，找到最新的检查点
2. 点击 **"Publish"（发布）** 按钮
3. 等待部署完成（通常 1-5 分钟）

#### 步骤 4：获取公网 URL

部署完成后，您将获得一个公网 URL，例如：

```
https://airport-bird-dashboard.manus.space
```

或使用自动生成的子域名：

```
https://3000-xxxxx.manus.space
```

---

### 2.3 绑定自定义域名（可选）

#### 步骤 1：准备域名

- 购买或已拥有一个域名（如 `bird-dashboard.example.com`）
- 确保域名的 DNS 管理权限

#### 步骤 2：在 Manus 中添加域名

1. 打开项目设置 → **Domains（域名）**
2. 点击 **"Add Domain"（添加域名）**
3. 输入您的域名
4. 按照 Manus 提示配置 DNS 记录

#### 步骤 3：配置 DNS

根据 Manus 提供的 DNS 记录，在您的域名服务商处添加：

**示例 DNS 记录**：

| 类型 | 主机 | 值 |
|------|------|-----|
| CNAME | bird-dashboard | airport-bird-dashboard.manus.space |

或

| 类型 | 主机 | 值 |
|------|------|-----|
| A | bird-dashboard | 1.2.3.4 |

#### 步骤 4：验证域名

1. DNS 记录生效后（通常 5-30 分钟）
2. 访问您的域名验证是否正常工作
3. Manus 会自动为您的域名配置 HTTPS 证书

---

## 3. 部署后的配置

### 3.1 环境变量配置

如果项目需要环境变量（如 API 密钥、数据库连接等），可以在 Manus 管理界面中配置。

#### 步骤 1：打开项目设置

1. 项目管理界面 → **Settings（设置）**
2. 找到 **Secrets（密钥）** 部分

#### 步骤 2：添加环境变量

点击 **"Add Secret"** 添加新的环境变量：

```
变量名: CAMERA_STREAM_URL
值: https://your-camera-server.com/stream.m3u8
```

#### 步骤 3：重新部署

修改环境变量后，需要重新部署项目以应用更改。

---

### 3.2 监控和日志

#### 查看部署日志

1. 项目管理界面 → **Dashboard（仪表板）**
2. 查看最近的部署记录和日志

#### 性能监控

1. 项目管理界面 → **Analytics（分析）**
2. 查看访问量、性能指标等

---

## 4. 自定义服务器部署

如果您需要部署到自己的服务器（如 AWS、阿里云、腾讯云等），请按以下步骤操作。

### 4.1 前置条件

- ✅ 拥有一台 Linux 服务器（推荐 Ubuntu 20.04+）
- ✅ 服务器已安装 Node.js 18+ 和 npm/pnpm
- ✅ 服务器有公网 IP 或已配置反向代理

### 4.2 部署步骤

#### 步骤 1：克隆项目代码

```bash
# 登录服务器
ssh user@your-server-ip

# 克隆项目（假设您已将代码推送到 GitHub）
git clone https://github.com/your-username/airport-bird-dashboard.git
cd airport-bird-dashboard
```

#### 步骤 2：安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

#### 步骤 3：构建项目

```bash
# 生产构建
pnpm build

# 或
npm run build
```

#### 步骤 4：启动应用

```bash
# 方式 1：直接启动（开发环境）
pnpm dev

# 方式 2：生产启动
NODE_ENV=production pnpm start

# 方式 3：使用 PM2 进程管理（推荐）
npm install -g pm2
pm2 start "npm run start" --name "bird-dashboard"
pm2 save
pm2 startup
```

#### 步骤 5：配置反向代理（Nginx）

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/bird-dashboard
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # 代理到 Node.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/bird-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 步骤 6：配置 SSL 证书（可选）

使用 Let's Encrypt 免费证书：

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

---

## 5. 部署检查清单

部署前，请检查以下项目：

- ✅ 所有代码已提交和保存
- ✅ 数据配置文件（`mock-data.json`）已更新
- ✅ 视频流 URL 已配置
- ✅ 环境变量已设置
- ✅ 依赖已安装（`pnpm install`）
- ✅ 项目已构建成功（`pnpm build`）
- ✅ 本地测试通过（`pnpm dev`）
- ✅ 没有控制台错误
- ✅ 响应式设计在各种屏幕尺寸上正常工作
- ✅ 所有图表和数据正确显示

---

## 6. 部署后的维护

### 6.1 监控应用健康状态

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs bird-dashboard

# 查看实时监控
pm2 monit
```

### 6.2 更新应用

当需要更新代码时：

```bash
# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有新的依赖）
pnpm install

# 重新构建
pnpm build

# 重启应用
pm2 restart bird-dashboard
```

### 6.3 备份数据

定期备份数据文件：

```bash
# 备份 mock-data.json
cp /path/to/mock-data.json /backup/mock-data.json.$(date +%Y%m%d)
```

### 6.4 日志管理

```bash
# 查看应用日志
pm2 logs bird-dashboard

# 导出日志
pm2 logs bird-dashboard > logs.txt

# 清理日志
pm2 flush
```

---

## 7. 常见部署问题

### Q: 部署后页面无法访问？

**解决步骤**：

1. 检查应用是否正常运行：
   ```bash
   pm2 status
   ```

2. 检查端口是否开放：
   ```bash
   netstat -tuln | grep 3000
   ```

3. 检查防火墙设置：
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

4. 检查 Nginx 配置：
   ```bash
   sudo nginx -t
   ```

### Q: 视频流在部署后无法播放？

**解决方案**：

1. 检查视频流 URL 是否正确
2. 确保视频服务器允许跨域请求（CORS）
3. 检查防火墙是否阻止了视频流访问
4. 使用浏览器开发者工具查看具体错误信息

### Q: 如何处理高并发访问？

**优化建议**：

1. 启用 CDN 加速
2. 配置负载均衡
3. 优化数据库查询
4. 启用缓存（Redis）
5. 增加服务器资源

### Q: 如何处理 SSL 证书过期？

**解决方案**：

```bash
# 自动续期（Let's Encrypt）
sudo certbot renew

# 或手动续期
sudo certbot certonly --nginx -d your-domain.com
```

---

## 8. 性能优化建议

### 8.1 前端优化

1. **启用 Gzip 压缩**：
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **启用缓存**：
   ```nginx
   expires 30d;
   add_header Cache-Control "public, immutable";
   ```

3. **使用 CDN**：将静态资源部署到 CDN

### 8.2 后端优化

1. **启用 HTTP/2**：
   ```nginx
   listen 443 ssl http2;
   ```

2. **优化数据库查询**：添加索引、使用缓存

3. **启用连接复用**：
   ```nginx
   keepalive_timeout 65;
   ```

---

## 9. 安全建议

1. **定期更新依赖**：
   ```bash
   pnpm update
   ```

2. **使用 HTTPS**：所有连接都应该使用 HTTPS

3. **设置安全头**：
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   ```

4. **限制请求速率**：
   ```nginx
   limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
   limit_req zone=general burst=20;
   ```

5. **定期备份**：每周备份一次数据和配置

---

## 10. 故障恢复

### 应用崩溃恢复

```bash
# 查看崩溃日志
pm2 logs bird-dashboard

# 重启应用
pm2 restart bird-dashboard

# 如果频繁崩溃，查看系统资源
free -h
df -h
```

### 数据恢复

```bash
# 从备份恢复
cp /backup/mock-data.json.20240114 /path/to/mock-data.json

# 重启应用
pm2 restart bird-dashboard
```

---

## 11. 下一步

- 部署完成后，定期监控应用状态
- 根据需要优化性能和安全性
- 收集用户反馈并持续改进
- 考虑升级到 **web-db-user** 版本以获得更多功能

---

## 12. 技术支持

如遇到部署问题，请提供以下信息：

- 部署环境（Manus / 自定义服务器）
- 操作系统和版本
- Node.js 版本
- 错误日志
- 浏览器控制台错误信息

联系方式：
- 📧 Email: support@manus.im
- 🌐 Website: https://help.manus.im
