[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$windowsRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $windowsRoot 'scripts\common-windows.ps1')

if (-not (Get-Command Test-DreamSkinRecordedInjectorRunning -ErrorAction SilentlyContinue)) {
  throw 'Tray status has no live recorded-injector health check.'
}

$deadState = [pscustomobject]@{
  injectorPid = 2147483647
  injectorStartedAt = '2026-01-01T00:00:00.0000000Z'
}
if (Test-DreamSkinRecordedInjectorRunning -State $deadState) {
  throw 'A missing recorded injector was reported as running.'
}

$currentState = [pscustomobject]@{
  injectorPid = $PID
  injectorStartedAt = (Get-Process -Id $PID -ErrorAction Stop).StartTime.ToUniversalTime().ToString('o')
}
if (-not (Test-DreamSkinRecordedInjectorRunning -State $currentState)) {
  throw 'A live process with the recorded start time was reported as stopped.'
}

$wrongStartState = [pscustomobject]@{
  injectorPid = $PID
  injectorStartedAt = '2026-01-01T00:00:00.0000000Z'
}
if (Test-DreamSkinRecordedInjectorRunning -State $wrongStartState) {
  throw 'A reused PID with a mismatched start time was reported as running.'
}

Write-Output 'PASS: tray status requires a live recorded injector with the matching start time.'
