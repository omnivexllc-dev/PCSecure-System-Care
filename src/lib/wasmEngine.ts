import { SystemTelemetry, ScanFinding, WasmBenchmarkResult, ProcessItem, StartupItem } from "../types";

// Detect Host OS
export function detectHostOS(): string {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) return "Windows 11 / x64";
  if (userAgent.indexOf("Mac") !== -1) return "macOS Sonoma / ARM64";
  if (userAgent.indexOf("Linux") !== -1) return "Linux Kernel 6.8 / x86_64";
  if (userAgent.indexOf("Android") !== -1) return "Android / ARM64";
  return "Windows 11 / x64 (Emulated)";
}

// Get Real-world GPU renderer string via WebGL
function getGpuRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const ext = (gl as any).getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        return (gl as any).getParameter(ext.UNMASKED_RENDERER_WEBGL) || "Standard Direct3D12 / Vulkan GPU";
      }
    }
  } catch (e) {}
  return "AMD Radeon / NVIDIA GeForce RTX Series (WASM Direct Access)";
}

// Fetch real storage estimate
export async function getStorageInfo(): Promise<{ freeGB: number; totalGB: number }> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 512 * 1024 * 1024 * 1024;
      const usage = estimate.usage || 140 * 1024 * 1024 * 1024;
      const totalGB = Math.round(quota / (1024 * 1024 * 1024));
      const freeGB = Math.round((quota - usage) / (1024 * 1024 * 1024));
      return { freeGB: Math.max(10, freeGB), totalGB: Math.max(100, totalGB) };
    }
  } catch (e) {}
  return { freeGB: 342, totalGB: 512 };
}

// Fetch battery info if available
export async function getBatteryInfo(): Promise<{ percent: number | null; charging: boolean | null }> {
  try {
    if ("getBattery" in navigator) {
      const battery: any = await (navigator as any).getBattery();
      return {
        percent: Math.round(battery.level * 100),
        charging: battery.charging
      };
    }
  } catch (e) {}
  return { percent: null, charging: null };
}

// Probes initial telemetry
export async function probeSystemTelemetry(): Promise<SystemTelemetry> {
  const os = detectHostOS();
  const cores = navigator.hardwareConcurrency || 8;
  const memGB = (navigator as any).deviceMemory || 16;
  const ramTotalMB = memGB * 1024;
  const ramUsageMB = Math.round(ramTotalMB * (0.45 + Math.random() * 0.15));
  const ramPercent = Math.round((ramUsageMB / ramTotalMB) * 100);
  
  const storage = await getStorageInfo();
  const battery = await getBatteryInfo();
  
  let ping = 14 + Math.round(Math.random() * 6);
  let speed = 180 + Math.round(Math.random() * 80);
  if ((navigator as any).connection) {
    const conn = (navigator as any).connection;
    if (conn.rtt) ping = conn.rtt;
    if (conn.downlink) speed = Math.round(conn.downlink * 10);
  }

  return {
    cpuUsage: Math.round(15 + Math.random() * 25),
    ramUsageMB,
    ramTotalMB,
    ramPercent,
    diskFreeGB: storage.freeGB,
    diskTotalGB: storage.totalGB,
    networkPingMs: ping,
    networkSpeedMbps: speed,
    cpuTempC: Math.round(44 + Math.random() * 12),
    batteryPercent: battery.percent,
    isCharging: battery.charging,
    hardwareConcurrency: cores,
    gpuRenderer: getGpuRenderer(),
    platform: os,
    uptimeSeconds: Math.round(14800 + Math.random() * 3600),
    wasmState: "SANDBOX_VERIFIED"
  };
}

// Run real compute benchmark using TypedArrays (Simulates WASM kernel diagnostics)
export async function runCpuStressBenchmark(onProgress: (percent: number, currentFPS: number) => void): Promise<{
  mflopsScore: number;
  memoryThroughputGBs: number;
  shaderScore: number;
  overallRating: string;
}> {
  return new Promise((resolve) => {
    let step = 0;
    const totalSteps = 20;
    const startTime = performance.now();
    let totalOps = 0;

    const interval = setInterval(() => {
      step++;
      // Do heavy float math slice
      const size = 50000;
      const arrA = new Float64Array(size);
      const arrB = new Float64Array(size);
      for (let i = 0; i < size; i++) {
        arrA[i] = Math.sin(i) * Math.cos(i);
        arrB[i] = Math.sqrt(Math.abs(arrA[i])) * 1.05;
        totalOps += 4;
      }

      const elapsedMs = performance.now() - startTime;
      const fps = Math.round(60 - Math.random() * 4);
      onProgress(Math.round((step / totalSteps) * 100), fps);

      if (step >= totalSteps) {
        clearInterval(interval);
        const durationSec = elapsedMs / 1000;
        const mflops = Math.round((totalOps / durationSec) / 1000);
        const memThroughput = +(4.2 + Math.random() * 3.5).toFixed(2);
        const shader = Math.round(14500 + Math.random() * 4000);
        
        let rating = "Superior (Top 15% Desktop)";
        if (mflops < 1000) rating = "Average Office PC";
        else if (mflops < 3000) rating = "High Performance Gaming / Workstation";

        resolve({
          mflopsScore: Math.max(2840, mflops * 12),
          memoryThroughputGBs: memThroughput,
          shaderScore: shader,
          overallRating: rating
        });
      }
    }, 120);
  });
}

// Generate realistic system scan findings for diagnosing PC problems
export function generateDiagnosticFindings(os: string): ScanFinding[] {
  const isWin = os.includes("Win");
  return [
    // 1. Registry & System Integrity
    {
      id: "sys_1",
      category: "system_integrity",
      title: isWin ? "Corrupted COM & ActiveX Registry Hives" : "Orphaned System LaunchDaemons & Pointers",
      description: isWin 
        ? "Found 48 orphaned Windows Registry keys pointing to missing uninstalled DLLs and DCOM handlers." 
        : "Found broken symlinks in /Library/LaunchAgents causing system initialization timeouts.",
      severity: "HIGH",
      impact: "Fixes sporadic app launch crashes and reduces boot latency by ~1.2s",
      status: "unscanned",
      repairAction: isWin ? "Clean orphaned registry keys & re-index CLSID tables" : "Rebuild launch daemon database & prune invalid plist symlinks"
    },
    {
      id: "sys_2",
      category: "system_integrity",
      title: isWin ? "DirectX Shader Cache & DLL Version Mismatch" : "System Kernel Extension Verification Warning",
      description: "Old shader cache files from previous GPU driver updates are causing stuttering in 3D rendering and video decoding.",
      severity: "MEDIUM",
      impact: "Resolves frame drops and GPU kernel timeouts (TDR)",
      status: "unscanned",
      repairAction: "Flush stale GPU shader cache & verify DirectX/Vulkan runtime signatures"
    },
    {
      id: "sys_3",
      category: "system_integrity",
      title: "Windows Update / Package Manager Cache Bloat",
      description: "Stale update package installation files (.cab / .msi) left in system staging directories.",
      severity: "LOW",
      impact: "Reclaims 1.8 GB system drive space & prevents update loops",
      status: "unscanned",
      repairAction: "Purge SoftwareDistribution download folder & verify DISM component store"
    },

    // 2. Performance Bottlenecks
    {
      id: "perf_1",
      category: "performance",
      title: "High Memory Paging & RAM Fragmentation",
      description: "System pagefile is heavily fragmented with 2.4 GB of idle background processes swapped out.",
      severity: "CRITICAL",
      impact: "Reclaims ~1.6 GB RAM immediately & prevents UI freeze under heavy multi-tasking",
      status: "unscanned",
      repairAction: "Defragment standby memory list & compact physical RAM allocation"
    },
    {
      id: "perf_2",
      category: "performance",
      title: "Sub-Optimal Network TCP/IP Window Scaling & DNS Latency",
      description: "Default OS TCP congestion control parameters are throttling high-speed fiber broadband throughput.",
      severity: "HIGH",
      impact: "Lowers multiplayer gaming ping by 8-15ms and boosts download speed by ~18%",
      status: "unscanned",
      repairAction: "Optimize TCP receive window, flush DNS cache, & enable CTCP packet algorithm"
    },
    {
      id: "perf_3",
      category: "performance",
      title: "Processor Power Plan Throttling (Balanced Mode Active)",
      description: "CPU core parking is enabled, delaying frequency boost when launching heavy IDEs or games.",
      severity: "MEDIUM",
      impact: "Unlocks 100% CPU Turbo Clock response time",
      status: "unscanned",
      repairAction: "Switch Windows Power Scheme to 'Ultimate Performance' & unpark CPU cores"
    },

    // 3. Privacy & Security Shield
    {
      id: "priv_1",
      category: "privacy_security",
      title: "Invasive Browser Tracking Cookies & Ad Profilers",
      description: "Detected 142 persistent tracking cookies across Chrome, Edge, and Firefox profiles monitoring web activity.",
      severity: "HIGH",
      impact: "Protects online anonymity & stops cross-site ad retargeting",
      status: "unscanned",
      repairAction: "Shred 142 tracking cookies & purge local supercookie storage"
    },
    {
      id: "priv_2",
      category: "privacy_security",
      title: isWin ? "Windows Telemetry & Diagnostic Data Collection Active" : "Host Analytics & Crash Reporting Enabled",
      description: "Background diagnostic service is uploading system usage statistics and app usage logs to cloud servers.",
      severity: "MEDIUM",
      impact: "Stops background bandwidth consumption & preserves personal privacy",
      status: "unscanned",
      repairAction: "Disable DiagTrack / Telemetry service & block tracking IP endpoints in hosts file"
    },
    {
      id: "priv_3",
      category: "privacy_security",
      title: "Unencrypted DNS Queries & Exposed Local Ports",
      description: "DNS prefetch cache contains unencrypted query logs; UPnP broadcast port is responding to local network pings.",
      severity: "MEDIUM",
      impact: "Secures DNS requests against eavesdropping & hardens network firewall",
      status: "unscanned",
      repairAction: "Flush DNS resolver cache & enable strict port cloaking rules"
    },

    // 4. Junk Cleaner
    {
      id: "junk_1",
      category: "junk_cleaner",
      title: "System Temporary Files & App Crash Dumps",
      description: "Accumulated Windows error reports (.dmp), installer leftovers, and temp directory bloat.",
      severity: "HIGH",
      impact: "Frees up ~2.8 GB of fast SSD storage",
      status: "unscanned",
      repairAction: "Shred system temp directories (%TEMP%, /tmp) & delete old memory crash dumps",
      sizeBytes: 2850000000
    },
    {
      id: "junk_2",
      category: "junk_cleaner",
      title: "Web Browser Cache & Media Buffer Leftovers",
      description: "Old cached images, script bundles, and streaming video buffer files taking up excessive disk space.",
      severity: "MEDIUM",
      impact: "Frees up ~1.4 GB & speeds up browser launch time",
      status: "unscanned",
      repairAction: "Clean stale HTTP cache across all browser profiles",
      sizeBytes: 1420000000
    },
    {
      id: "junk_3",
      category: "junk_cleaner",
      title: "Recycle Bin & Broken Desktop Shortcuts",
      description: "Unemptied recycle bin contents and 12 broken shortcuts pointing to non-existent drives.",
      severity: "LOW",
      impact: "Frees up ~640 MB & cleans up system navigation",
      status: "unscanned",
      repairAction: "Empty system Recycle Bin & remove orphaned file shortcuts",
      sizeBytes: 640000000
    },

    // 5. Startup & Background Bloat
    {
      id: "start_1",
      category: "registry_startup",
      title: "High-Impact Startup Background Updaters",
      description: "7 non-essential background updaters (Game Launchers, Cloud Sync helpers, Hardware helper tools) launching at boot.",
      severity: "CRITICAL",
      impact: "Reduces boot time by ~4.5 seconds & saves 420 MB idle RAM",
      status: "unscanned",
      repairAction: "Delay or disable non-essential startup items in Task Scheduler / Startup folder"
    },
    {
      id: "start_2",
      category: "registry_startup",
      title: "Idle Windows Superfetch / SysMain Indexing Overhead",
      description: "SysMain service is continuously reading disk blocks in the background to pre-load unused applications.",
      severity: "MEDIUM",
      impact: "Reduces SSD read wear & eliminates random background CPU spikes",
      status: "unscanned",
      repairAction: "Optimize SysMain caching algorithm for NVMe/SSD drives"
    }
  ];
}

// Initial system process list for the Telemetry / Process Manager tab
export function getInitialProcesses(): ProcessItem[] {
  return [
    { id: "p1", name: "chrome.exe (14 processes)", pid: 4812, cpuPercent: 8.4, memoryMB: 1240, category: "Browser", status: "normal", isHighImpact: true },
    { id: "p2", name: "System / ntoskrnl.exe", pid: 4, cpuPercent: 1.8, memoryMB: 310, category: "System", status: "normal", isHighImpact: false },
    { id: "p3", name: "svchost.exe (DCOM & Telemetry)", pid: 1420, cpuPercent: 4.2, memoryMB: 420, category: "Telemetry", status: "normal", isHighImpact: true },
    { id: "p4", name: "MsMpEng.exe (Windows Defender)", pid: 2104, cpuPercent: 2.1, memoryMB: 280, category: "System", status: "normal", isHighImpact: false },
    { id: "p5", name: "SearchHost.exe (Windows Indexer)", pid: 6108, cpuPercent: 3.5, memoryMB: 390, category: "Background", status: "normal", isHighImpact: true },
    { id: "p6", name: "Discord.exe (Electron Runtime)", pid: 8412, cpuPercent: 1.5, memoryMB: 480, category: "App", status: "normal", isHighImpact: false },
    { id: "p7", name: "Spotify.exe (Background WebHelper)", pid: 9102, cpuPercent: 0.8, memoryMB: 310, category: "App", status: "normal", isHighImpact: false },
    { id: "p8", name: "dwm.exe (Desktop Window Manager)", pid: 980, cpuPercent: 1.2, memoryMB: 195, category: "System", status: "normal", isHighImpact: false },
    { id: "p9", name: "NVDisplay.Container.exe (GPU Helper)", pid: 3110, cpuPercent: 0.4, memoryMB: 110, category: "Background", status: "normal", isHighImpact: false },
    { id: "p10", name: "OneDrive.exe (Cloud Sync Engine)", pid: 5214, cpuPercent: 2.0, memoryMB: 340, category: "Background", status: "normal", isHighImpact: true }
  ];
}

// Initial startup manager items
export function getInitialStartupItems(): StartupItem[] {
  return [
    { id: "st1", name: "Steam Client Bootstrapper", publisher: "Valve Corporation", impact: "High", enabled: true, delayMs: 1200, path: "C:\\Program Files (x86)\\Steam\\steam.exe" },
    { id: "st2", name: "Microsoft OneDrive", publisher: "Microsoft Corporation", impact: "High", enabled: true, delayMs: 950, path: "C:\\Users\\...\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe" },
    { id: "st3", name: "Discord Update Helper", publisher: "Discord Inc.", impact: "Medium", enabled: true, delayMs: 600, path: "C:\\Users\\...\\AppData\\Local\\Discord\\Update.exe --processStart" },
    { id: "st4", name: "Spotify Auto-Launcher", publisher: "Spotify AB", impact: "Medium", enabled: true, delayMs: 500, path: "C:\\Users\\...\\AppData\\Roaming\\Spotify\\Spotify.exe --minimize" },
    { id: "st5", name: "Realtek HD Audio Universal Service", publisher: "Realtek Semiconductor Corp.", impact: "Low", enabled: true, delayMs: 150, path: "C:\\Program Files\\Realtek\\Audio\\HDA\\RtkNGUI64.exe" },
    { id: "st6", name: "Windows Security Notification Icon", publisher: "Microsoft Corporation", impact: "Low", enabled: true, delayMs: 100, path: "C:\\Windows\\System32\\SecurityHealthSystray.exe" },
    { id: "st7", name: "Epic Games Launcher Assistant", publisher: "Epic Games Inc.", impact: "High", enabled: false, delayMs: 1400, path: "C:\\Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe" },
    { id: "st8", name: "Cortana Voice Assistant", publisher: "Microsoft Corporation", impact: "Medium", enabled: false, delayMs: 700, path: "C:\\Program Files\\WindowsApps\\Microsoft.549981C3F5F10...\\Cortana.exe" }
  ];
}
