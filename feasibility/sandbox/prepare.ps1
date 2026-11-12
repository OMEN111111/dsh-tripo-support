# Prepare an isolated DSH home and profile for the feasibility test.
# Nothing here touches the user's real profile at C:\Users\<user>\.dsh\profiles\desktop.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$sandbox = Join-Path $root 'sandbox'
$homeDir = Join-Path $sandbox 'dsh-home'
$pluginDir = Join-Path $root 'plugin'
$dsh = 'D:\Software\05_AI\DSH\resources\runtime\cli\bin\dsh.cmd'

New-Item -ItemType Directory -Force -Path $homeDir | Out-Null
$env:DSH_HOME = $homeDir
$env:DSH_PROFILE = 'feas'
$env:DSH_PROFILE_DIR = Join-Path $homeDir 'profiles\feas'

Write-Host "DSH_HOME=$env:DSH_HOME"
Write-Host "plugin=$pluginDir"

# Initialize a fresh web profile from the shipped template.
& $dsh --profile feas --from-default-profile web --dump-config *> (Join-Path $sandbox 'init.log')
Write-Host "init exit=$LASTEXITCODE"
Get-Content (Join-Path $sandbox 'init.log') -Tail 20

# Install the local bundle into the isolated profile. A local directory install
# links the checkout, so later edits to the plugin are visible without packing.
& $dsh plugin --profile feas add $pluginDir *> (Join-Path $sandbox 'install.log')
Write-Host "install exit=$LASTEXITCODE"
Get-Content (Join-Path $sandbox 'install.log') -Tail 30
