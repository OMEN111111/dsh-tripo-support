# Stop the sandbox processes started by start.ps1.
$ErrorActionPreference = 'Continue'
$sandbox = $PSScriptRoot
foreach ($name in @('web.pid', 'mock.pid')) {
  $file = Join-Path $sandbox $name
  if (Test-Path $file) {
    $processId = [int](Get-Content $file -Raw)
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Remove-Item $file -Force -ErrorAction SilentlyContinue
    Write-Host "stopped $name ($processId)"
  }
}
# The launcher may exit while its Electron child keeps the port; stop the
# exact listeners this sandbox owns and nothing else.
foreach ($port in @(6130, 6123)) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host "stopped port $port owner ($_)" }
}

