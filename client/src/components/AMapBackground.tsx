import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    AMap: any;
  }
}

interface AMapBackgroundProps {
  center?: [number, number]; // [lng, lat] 默认北京首都机场
  zoom?: number;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [116.603039, 40.080098];
const DEFAULT_ZOOM = 14;

export default function AMapBackground({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "",
}: AMapBackgroundProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 仅用初次传入的 center/zoom，避免父组件重渲染导致依赖变化反复初始化
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const c = initialCenterRef.current;
    const z = initialZoomRef.current;
    let retryCount = 0;
    const maxRetry = 50;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const initMap = () => {
      try {
        if (!window.AMap) {
          if (retryCount < maxRetry) {
            retryCount++;
            timeoutId = setTimeout(initMap, 100);
            return;
          }
          setError("高德地图 SDK 未加载，请检查 API Key");
          return;
        }

        container.style.width = "100%";
        container.style.height = "100%";
        container.style.minHeight = "100vh";

        mapRef.current = new window.AMap.Map(container, {
          zoom: z,
          center: c,
          mapStyle: "amap://styles/normal", // 标准浅色，不用深色
          resizeEnable: true,
          scrollWheel: true,
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
        });

        mapRef.current.on("complete", () => {
          setMapReady(true);
        });

        window.AMap.plugin(["AMap.ToolBar", "AMap.Scale"], () => {
          try {
            if (mapRef.current) {
              mapRef.current.addControl(new window.AMap.ToolBar({ liteStyle: true }));
              mapRef.current.addControl(new window.AMap.Scale());
            }
          } catch (e) {
            console.warn("控件加载失败", e);
          }
        });

        try {
          const marker = new window.AMap.Marker({ position: c, title: "机场位置" });
          mapRef.current.add(marker);
        } catch (e) {
          console.warn("标记添加失败", e);
        }

        timeoutId = setTimeout(() => setMapReady(true), 2000);
      } catch (e) {
        console.error("地图初始化失败", e);
        setError("地图初始化失败：" + (e instanceof Error ? e.message : String(e)));
      }
    };

    initMap();

    return () => {
      clearTimeout(timeoutId);
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch (e) {
          console.warn("地图销毁失败", e);
        }
        mapRef.current = null;
      }
    };
    // 空依赖：只在挂载时初始化一次，避免父组件每秒重渲染导致地图反复重建
  }, []);

  // 始终只渲染一个结构：地图容器 + 遮罩层，避免 ref 指向的 DOM 被替换
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      {/* 地图容器：始终存在，保证地图挂载的 DOM 不被卸载 */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          minHeight: "100vh",
          opacity: mapReady ? 1 : 0,
          pointerEvents: mapReady ? "auto" : "none",
        }}
      />
      {/* 加载中或出错时的遮罩：地图就绪后隐藏 */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{
          zIndex: 1,
          opacity: mapReady && !error ? 0 : 1,
          pointerEvents: mapReady && !error ? "none" : "auto",
          backgroundImage: error || !mapReady ? "url('/images/airport-satellite-map.jpg')" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {error ? (
          <div className="bg-destructive/80 text-white px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        ) : !mapReady ? (
          <span className="text-muted-foreground bg-black/50 px-3 py-1 rounded">
            地图加载中...
          </span>
        ) : null}
      </div>
    </div>
  );
}
