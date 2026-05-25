# ==============================================================================
# PACK24 - BARCHA 10 TA PLATFORMANI ISHGA TUSHIRISH
# ==============================================================================
#
# Platformalar:
#   1.  Web sayt              -> localhost:3000
#   2.  Admin panel            -> localhost:3000/admin/login
#   3.  Mobil TWA (mijoz)     -> localhost:3000/mobile
#   4.  Haydovchi web app     -> localhost:3000/driver/login
#   5.  Customer Bot          -> @Pack24AI_bot  (polling)
#   6.  Driver Bot            -> @pack24MX_bot  (polling)
#   7.  Admin Bot             -> @pack24AUP_bot (polling)
#   8.  HQ Admin Bot          -> @pack24admin_bot (polling)
#   9.  Customer Expo App     -> localhost:8081
#  10.  Driver Expo App       -> localhost:8082
#
# Ishlatish:
#   powershell -ExecutionPolicy Bypass -File scripts/start-all-platforms.ps1
#   yoki: npm run start:all
#
# ==============================================================================

param(
    [switch]$NoBrowser,
    [switch]$NoMobile,
    [switch]$Clean,
    [int]$WebPort = 3000,
    [int]$CustomerPort = 8081,
    [int]$DriverPort = 8082
)

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$MobileRoot = "C:\pack24-mobile"
$CustomerApp = "$MobileRoot\apps\customer"
$DriverApp   = "$MobileRoot\apps\driver"

# --- Yordamchi funksiyalar ---
function Log-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Log-Warn($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Log-Err($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red }
function Log-Nfo($msg)  { Write-Host "  [i]  $msg" -ForegroundColor Cyan }
function Log-Hdr($msg)  { Write-Host "`n$msg" -ForegroundColor Magenta }

# ==============================================================================
# 0. BANNER
# ==============================================================================
Write-Host ""
Write-Host "  +======================================================+" -ForegroundColor Cyan
Write-Host "  |     PACK24 - BARCHA PLATFORMALAR LAUNCHER            |" -ForegroundColor Cyan
Write-Host "  |              10 ta platform - 1 ta skript            |" -ForegroundColor Cyan
Write-Host "  +======================================================+" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Vaqt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""

# ==============================================================================
# 1. ESKI JARAYONLARNI TOZALASH
# ==============================================================================
Log-Hdr "[1/6] Portlarni tozalash..."

foreach ($port in @($WebPort, $CustomerPort, $DriverPort)) {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($proc -and $proc.Path -like "*node*") {
            Write-Host "     Port $port band - PID $($conn.OwningProcess) toxtatilmoqda..." -ForegroundColor Yellow
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 2
Log-Ok "Portlar tozalandi ($WebPort, $CustomerPort, $DriverPort)"

# ==============================================================================
# 2. CACHE TOZALASH (ixtiyoriy)
# ==============================================================================
if ($Clean) {
    Log-Hdr "[2/6] .next cache tozalanmoqda..."
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Log-Ok ".next tozalandi"
} else {
    Log-Nfo "[2/6] Cache tozalash otkazib yuborildi (-Clean flag bilan ishga tushiring)"
}

# ==============================================================================
# 3. NEXT.JS WEB SERVER (platformalar 1-8)
# ==============================================================================
Log-Hdr "[3/6] Next.js server ishga tushmoqda (localhost:$WebPort)..."
Log-Nfo "Bu server 8 ta platformani boshqaradi:"
Log-Nfo "  Web sayt, Admin, Mobil TWA, Haydovchi web, 4 ta Telegram bot"

$webJob = Start-Job -Name "Pack24-Web" -ScriptBlock {
    param($dir, $port)
    Set-Location $dir
    $env:TELEGRAM_DEV_AUTO_POLL = "true"
    $env:PORT = $port
    npm run dev 2>&1
} -ArgumentList $Root, $WebPort

# Server tayyor bolishini kutish
Log-Nfo "Server kompilatsiya qilmoqda... (90s gacha kutilmoqda)"
$deadline = (Get-Date).AddSeconds(90)
$serverReady = $false

while ((Get-Date) -lt $deadline) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$WebPort" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    } catch {
        # Server hali tayyor emas
    }
    Start-Sleep -Seconds 3
}

if ($serverReady) {
    Log-Ok "Next.js server tayyor (localhost:$WebPort)"
} else {
    Log-Warn "Server hali kompilatsiya qilayapti - davom etamiz..."
}

# Botlar ishga tushganini tekshirish
Start-Sleep -Seconds 5
Log-Nfo "Telegram botlar polling holati tekshirilmoqda..."
try {
    $health = Invoke-RestMethod -Uri "http://localhost:$WebPort/api/telegram/health" -Method GET -TimeoutSec 30 -ErrorAction Stop
    if ($health.pollingActive) {
        Log-Ok "4 ta Telegram bot polling rejimda ishlayapti"
        $tokens = $health.botTokensPresent
        if ($tokens.customerFromEnvOnly) { Log-Ok "  @Pack24AI_bot (Customer)" }
        if ($tokens.driver)              { Log-Ok "  @pack24MX_bot (Driver)" }
        if ($tokens.adminSupervisorBot)  { Log-Ok "  @pack24AUP_bot (Admin)" }
        if ($tokens.pack24AdminBot)      { Log-Ok "  @pack24admin_bot (HQ Admin)" }
    } else {
        Log-Warn "Botlar hali ishga tushmagan - bir necha soniyada avtomatik ishga tushadi"
    }
} catch {
    Log-Warn "Telegram health tekshirib bolmadi - botlar biroz keyin tayyor boladi"
}

# ==============================================================================
# 4. HEALTH CHECK - Web platformalar
# ==============================================================================
Log-Hdr "[4/6] Web platformalar health check..."

$endpoints = @(
    @{ Name = "Web sayt";       Url = "http://localhost:$WebPort" },
    @{ Name = "Admin panel";    Url = "http://localhost:$WebPort/admin/login" },
    @{ Name = "Mobil TWA";      Url = "http://localhost:$WebPort/mobile" },
    @{ Name = "Haydovchi app";  Url = "http://localhost:$WebPort/driver/login" },
    @{ Name = "Katalog";        Url = "http://localhost:$WebPort/catalog" },
    @{ Name = "Auth API";       Url = "http://localhost:$WebPort/api/auth/session" }
)

foreach ($ep in $endpoints) {
    try {
        $r = Invoke-WebRequest -Uri $ep.Url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        Log-Ok "$($ep.Name) - OK ($($r.StatusCode))"
    } catch {
        $code = $null
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        if ($code) {
            Log-Warn "$($ep.Name) - $code"
        } else {
            Log-Warn "$($ep.Name) - timeout (kompilatsiya qilmoqda)"
        }
    }
}

# ==============================================================================
# 5. EXPO MOBIL ILOVALAR (platformalar 9-10)
# ==============================================================================
$mobileCustomerJob = $null
$mobileDriverJob = $null

if (-not $NoMobile) {
    Log-Hdr "[5/6] Expo mobil ilovalar ishga tushmoqda..."

    # Customer App
    if (Test-Path $CustomerApp) {
        Log-Nfo "Pack24AI Customer app (port $CustomerPort)..."
        $mobileCustomerJob = Start-Job -Name "Pack24-Customer-Expo" -ScriptBlock {
            param($dir, $port)
            Set-Location $dir
            $env:NODE_OPTIONS = '--max-old-space-size=8192'
            npx expo start --web --port $port 2>&1
        } -ArgumentList $CustomerApp, $CustomerPort
        Log-Ok "Customer Expo app ishga tushdi (localhost:$CustomerPort)"
    } else {
        Log-Warn "Customer app topilmadi: $CustomerApp"
    }

    # Driver App
    if (Test-Path $DriverApp) {
        Log-Nfo "Pack24 Driver app (port $DriverPort)..."
        $mobileDriverJob = Start-Job -Name "Pack24-Driver-Expo" -ScriptBlock {
            param($dir, $port)
            Set-Location $dir
            $env:NODE_OPTIONS = '--max-old-space-size=8192'
            npx expo start --web --port $port 2>&1
        } -ArgumentList $DriverApp, $DriverPort
        Log-Ok "Driver Expo app ishga tushdi (localhost:$DriverPort)"
    } else {
        Log-Warn "Driver app topilmadi: $DriverApp"
    }
} else {
    Log-Nfo "[5/6] Expo mobil ilovalar otkazib yuborildi (-NoMobile flag)"
}

# ==============================================================================
# 6. BRAUZERDA OCHISH
# ==============================================================================
if (-not $NoBrowser) {
    Log-Hdr "[6/6] Brauzerda ochilmoqda..."
    Start-Sleep -Seconds 2

    Start-Process "http://localhost:$WebPort"
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:$WebPort/admin/login"
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:$WebPort/mobile"
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:$WebPort/driver/login"

    if (-not $NoMobile) {
        Start-Sleep -Seconds 15
        Start-Process "http://localhost:$CustomerPort"
        Start-Sleep -Milliseconds 600
        Start-Process "http://localhost:$DriverPort"
    }

    Log-Ok "Barcha sahifalar brauzerda ochildi"
} else {
    Log-Nfo "[6/6] Brauzerda ochish otkazib yuborildi (-NoBrowser flag)"
}

# ==============================================================================
# YAKUNIY XULOSA
# ==============================================================================
$LanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' } | Select-Object -First 1).IPAddress
if (-not $LanIp) { $LanIp = '192.168.0.113' }

Write-Host ""
Write-Host "  +======================================================+" -ForegroundColor Green
Write-Host "  |       BARCHA PLATFORMALAR ISHGA TUSHDI!              |" -ForegroundColor Green
Write-Host "  +======================================================+" -ForegroundColor Green
Write-Host ""
Write-Host "  -- Web platformalar ----------------------------------" -ForegroundColor Cyan
Write-Host "   1. Web sayt           http://localhost:$WebPort"
Write-Host "   2. Admin panel        http://localhost:$WebPort/admin/login"
Write-Host "   3. Mobil TWA          http://localhost:$WebPort/mobile"
Write-Host "   4. Haydovchi web      http://localhost:$WebPort/driver/login"
Write-Host ""
Write-Host "  -- Telegram botlar (polling) -------------------------" -ForegroundColor Cyan
Write-Host "   5. Customer Bot       @Pack24AI_bot"
Write-Host "   6. Driver Bot         @pack24MX_bot"
Write-Host "   7. Admin Bot          @pack24AUP_bot"
Write-Host "   8. HQ Admin Bot       @pack24admin_bot"
Write-Host ""
if (-not $NoMobile) {
    Write-Host "  -- Native mobil ilovalar (Expo) ----------------------" -ForegroundColor Cyan
    Write-Host "   9. Customer App       http://localhost:$CustomerPort"
    Write-Host "  10. Driver App         http://localhost:$DriverPort"
    Write-Host ""
}
Write-Host "  -- Telefon uchun (Wi-Fi) -----------------------------" -ForegroundColor DarkGray
Write-Host "   API:  http://${LanIp}:$WebPort"
Write-Host "   Emu:  http://10.0.2.2:$WebPort (Android Emulator)"
Write-Host ""
Write-Host "  -- Boshqarish ----------------------------------------" -ForegroundColor DarkGray
Write-Host "   Toxtatish:  Ctrl+C yoki bu terminalni yoping"
Write-Host "   Job list:   Get-Job | Format-Table"
Write-Host "   Job log:    Receive-Job -Name Pack24-Web -Keep"
Write-Host ""

# ==============================================================================
# LOG STREAM - asosiy web server loglari
# ==============================================================================
Write-Host "  -- Next.js loglar ------------------------------------" -ForegroundColor DarkGray
Write-Host ""

try {
    Receive-Job $webJob -Wait
} finally {
    Write-Host "`n  Barcha jarayonlar toxtatilmoqda..." -ForegroundColor Yellow
    Get-Job | Where-Object { $_.Name -like "Pack24-*" } | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Where-Object { $_.Name -like "Pack24-*" } | Remove-Job -Force -ErrorAction SilentlyContinue
    Write-Host "  Barcha Pack24 jarayonlari toxtatildi." -ForegroundColor Green
}
