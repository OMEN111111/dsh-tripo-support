# Start the mock API and an isolated DSH Web instance.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$sandbox = Join-Path $root 'sandbox'
$homeDir = Join-Path $sandbox 'dsh-home'
$artifactDir = Join-Path $root 'artifacts'
$mockLog = Join-Path $sandbox 'mock.log'
$webOut = Join-Path $sandbox 'web.out.log'
$webErr = Join-Path $sandbox 'web.err.log'
$dsh = 'D:\Software\05_AI\DSH\resources\runtime\cli\bin\dsh.cmd'
$port = 6130

New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $homeDir 'tripo-support') | Out-Null

# Stop previous instances started from this sandbox (best effort).
Get-CimInstance Win32_Process -Filter "Name='DeepSeek Harness.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like "*$homeDir*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
foreach ($stalePort in @(6130, 6123)) {
  Get-NetTCPConnection -LocalPort $stalePort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Milliseconds 500

$mock = Start-Process -FilePath 'node' -ArgumentList (Join-Path $root 'mock\server.mjs') -WorkingDirectory (Join-Path $root 'mock') -RedirectStandardOutput $mockLog -RedirectStandardError (Join-Path $sandbox 'mock.err.log') -PassThru -WindowStyle Hidden
Start-Sleep -Milliseconds 800
if ($mock.HasExited) { throw "mock server exited: $(Get-Content (Join-Path $sandbox 'mock.err.log') -Raw)" }
Set-Content -Path (Join-Path $sandbox 'mock.pid') -Value $mock.Id

$env:DSH_HOME = $homeDir
$env:DSH_PROFILE = 'feas'
$env:DSH_PROFILE_DIR = Join-Path $homeDir 'profiles\feas'
$web = Start-Process -FilePath $dsh -ArgumentList @('--profile', 'feas', '--port', "$port", '--no-open') -WorkingDirectory $root -RedirectStandardOutput $webOut -RedirectStandardError $webErr -PassThru -WindowStyle Hidden
Set-Content -Path (Join-Path $sandbox 'web.pid') -Value $web.Id

$deadline = (Get-Date).AddSeconds(60)
$ready = $false
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 1
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -SkipHttpErrorCheck -TimeoutSec 2 -SkipCertificateCheck
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { $ready = $true; break }
  } catch { }
  if ($web.HasExited) { break }
}

Write-Host "mock pid=$($mock.Id) web pid=$($web.Id) ready=$ready"
Write-Host "web log tail:"
Get-Content $webOut -Tail 20 -ErrorAction SilentlyContinue
Get-Content $webErr -Tail 20 -ErrorAction SilentlyContinue
if (-not $ready) { throw "DSH web did not become ready on port $port" }

