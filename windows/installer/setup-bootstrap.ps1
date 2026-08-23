[CmdletBinding()]
param(
  [switch]$Install,
  [switch]$LaunchTray,
  [switch]$Uninstall,
  [switch]$Silent
)

$ErrorActionPreference = 'Stop'
$payloadRoot = Join-Path $PSScriptRoot 'payload'
$payloadScripts = Join-Path $payloadRoot 'scripts'
$commonPath = Join-Path $payloadScripts 'common-windows.ps1'
$themePath = Join-Path $payloadScripts 'theme-windows.ps1'
$stateRoot = Join-Path $env:LOCALAPPDATA 'CodexDreamSkin'
$startupShortcut = Join-Path ([Environment]::GetFolderPath('Startup')) 'Codex Guofeng Themes.lnk'
$legacyStartupShortcut = Join-Path ([Environment]::GetFolderPath('Startup')) 'Codex Dream Skin.lnk'

function Show-DreamSkinBootstrapMessage {
  param(
    [Parameter(Mandatory = $true)][string]$Message,
    [ValidateSet('Info', 'Error')][string]$Kind = 'Info'
  )
  if ($Silent) { return }
  Add-Type -AssemblyName System.Windows.Forms
  $icon = if ($Kind -eq 'Error') {
    [System.Windows.Forms.MessageBoxIcon]::Error
  } else {
    [System.Windows.Forms.MessageBoxIcon]::Information
  }
  [void][System.Windows.Forms.MessageBox]::Show(
    $Message,
    'Codex Guofeng Themes',
    [System.Windows.Forms.MessageBoxButtons]::OK,
    $icon
  )
}

function Wait-DreamSkinCodexClosedForSetup {
  while ($true) {
    $registered = @(Get-DreamSkinRegisteredCodexInstalls)
    $running = @($registered | Where-Object { (Get-DreamSkinCodexProcesses -Codex $_).Count -gt 0 })
    if ($running.Count -eq 0) { return }
    if ($Silent) { throw 'Close Codex before installing or updating Codex Guofeng Themes.' }
    Add-Type -AssemblyName System.Windows.Forms
    $choice = [System.Windows.Forms.MessageBox]::Show(
      'Codex is currently running. Close it, then click Retry to continue setup.',
      'Codex Guofeng Themes Setup',
      [System.Windows.Forms.MessageBoxButtons]::RetryCancel,
      [System.Windows.Forms.MessageBoxIcon]::Information
    )
    if ($choice -ne [System.Windows.Forms.DialogResult]::Retry) {
      throw 'Setup was cancelled because Codex is still running.'
    }
  }
}

try {
  if ($Install -and ($LaunchTray -or $Uninstall)) {
    throw 'Choose exactly one installer bootstrap action.'
  }
  if (-not (Test-Path -LiteralPath $commonPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $themePath -PathType Leaf)) {
    throw 'The installer payload is incomplete.'
  }
  . $commonPath
  . $themePath

  $engine = Get-DreamSkinRuntimeEnginePaths -StateRoot $stateRoot
  if ($Uninstall) {
    Stop-DreamSkinTrayProcess -ScriptPaths @($engine.Tray) -RequireStopped
    $restoreRequired = (Test-Path -LiteralPath $engine.Root -PathType Container) -or
      (Test-Path -LiteralPath (Join-Path $stateRoot 'config.before-dream-skin.toml') -PathType Leaf)
    if ($restoreRequired -and -not (Test-Path -LiteralPath $engine.Restore -PathType Leaf)) {
      throw 'The installed restore engine is missing. Reinstall Codex Guofeng Themes, then uninstall again so Codex can be restored safely.'
    }
    if ($restoreRequired) {
      $restoreParameters = @{
        Uninstall = $true
        ForceRestart = $true
        NoRelaunch = $true
      }
      if (Test-Path -LiteralPath (Join-Path $stateRoot 'config.before-dream-skin.toml') -PathType Leaf) {
        $restoreParameters.RestoreBaseTheme = $true
      }
      & $engine.Restore @restoreParameters
    }
    if (Test-Path -LiteralPath $engine.Root -PathType Container) {
      Remove-DreamSkinRuntimeTree -Path $engine.Root -StateRoot $stateRoot
    }
    Remove-Item -LiteralPath $startupShortcut -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $legacyStartupShortcut -Force -ErrorAction SilentlyContinue
    exit 0
  }

  Remove-Item -LiteralPath $legacyStartupShortcut -Force -ErrorAction SilentlyContinue

  $payloadNode = Join-Path $payloadRoot 'runtime\node\node.exe'
  $payloadNodeLicense = Join-Path $payloadRoot 'runtime\node\LICENSE'
  if (-not (Test-Path -LiteralPath $payloadNode -PathType Leaf) -or
    -not (Test-Path -LiteralPath $payloadNodeLicense -PathType Leaf)) {
    throw 'The installer payload is missing its bundled Node.js runtime. Re-download Setup.exe.'
  }
  $payloadVersion = ([System.IO.File]::ReadAllText((Join-Path $payloadRoot 'VERSION'))).Trim()
  if ($payloadVersion -cnotmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
    throw "The installer payload version is invalid: $payloadVersion"
  }
  $installedVersion = if (Test-Path -LiteralPath $engine.Version -PathType Leaf) {
    ([System.IO.File]::ReadAllText($engine.Version)).Trim()
  } else { '' }
  if ($installedVersion -cmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$' -and
    ([version]$installedVersion) -gt ([version]$payloadVersion)) {
    throw "A newer Codex Guofeng Themes v$installedVersion is already installed. Download that version or newer instead of downgrading to v$payloadVersion."
  }
  $backupExists = Test-Path -LiteralPath (Join-Path $stateRoot 'config.before-dream-skin.toml') -PathType Leaf
  $requiredEngineFiles = @(
    'VERSION',
    'assets\codex-dream-skin.ico',
    'assets\dream-reference.jpg',
    'assets\dream-skin.css',
    'assets\renderer-inject.js',
    'assets\safe-css-policy.json',
    'assets\safe-css-validator.mjs',
    'assets\selectors.json',
    'assets\theme-package-validator.mjs',
    'assets\theme.json',
    'assets\theme.css',
    'presets\catalog.json',
    'presets\preset-zhuqing\background.jpg',
    'presets\preset-zhuqing\theme.json',
    'presets\preset-zhuqing\theme.css',
    'presets\preset-zhusha\background.jpg',
    'presets\preset-zhusha\theme.json',
    'presets\preset-zhusha\theme.css',
    'presets\preset-moyun\background.jpg',
    'presets\preset-moyun\theme.json',
    'presets\preset-moyun\theme.css',
    'presets\preset-ruyao-tianqing\background.jpg',
    'presets\preset-ruyao-tianqing\theme.json',
    'presets\preset-ruyao-tianqing\theme.css',
    'presets\preset-dunhuang-liujin\background.jpg',
    'presets\preset-dunhuang-liujin\theme.json',
    'presets\preset-dunhuang-liujin\theme.css',
    'presets\preset-qinghua-ci\background.jpg',
    'presets\preset-qinghua-ci\theme.json',
    'presets\preset-qinghua-ci\theme.css',
    'presets\preset-haitang-songjin\background.jpg',
    'presets\preset-haitang-songjin\theme.json',
    'presets\preset-haitang-songjin\theme.css',
    'presets\preset-jiye-xinghe\background.jpg',
    'presets\preset-jiye-xinghe\theme.json',
    'presets\preset-jiye-xinghe\theme.css',
    'presets\preset-qianli-jiangshan\background.jpg',
    'presets\preset-qianli-jiangshan\theme.json',
    'presets\preset-qianli-jiangshan\theme.css',
    'presets\preset-jingtai-hualan\background.jpg',
    'presets\preset-jingtai-hualan\theme.json',
    'presets\preset-jingtai-hualan\theme.css',
    'presets\preset-heiqi-luodian\background.jpg',
    'presets\preset-heiqi-luodian\theme.json',
    'presets\preset-heiqi-luodian\theme.css',
    'presets\preset-chayan-songfeng\background.jpg',
    'presets\preset-chayan-songfeng\theme.json',
    'presets\preset-chayan-songfeng\theme.css',
    'presets\preset-sunmao-danying\background.jpg',
    'presets\preset-sunmao-danying\theme.json',
    'presets\preset-sunmao-danying\theme.css',
    'presets\preset-ruihe-lingxiao\background.jpg',
    'presets\preset-ruihe-lingxiao\theme.json',
    'presets\preset-ruihe-lingxiao\theme.css',
    'presets\preset-tangsancai\background.jpg',
    'presets\preset-tangsancai\theme.json',
    'presets\preset-tangsancai\theme.css',
    'presets\preset-hanjian-mohen\background.jpg',
    'presets\preset-hanjian-mohen\theme.json',
    'presets\preset-hanjian-mohen\theme.css',
    'presets\preset-luoshui-liuxia\background.jpg',
    'presets\preset-luoshui-liuxia\theme.json',
    'presets\preset-luoshui-liuxia\theme.css',
    'presets\preset-jinling-yunjin\background.jpg',
    'presets\preset-jinling-yunjin\theme.json',
    'presets\preset-jinling-yunjin\theme.css',
    'scripts\apply-community-theme.ps1',
    'scripts\check-update.ps1',
    'scripts\common-windows.ps1',
    'scripts\config-utf8.ps1',
    'scripts\image-metadata.mjs',
    'scripts\injector.mjs',
    'scripts\install-dream-skin.ps1',
    'scripts\localization-windows.ps1',
    'scripts\restore-dream-skin.ps1',
    'scripts\start-dream-skin.ps1',
    'scripts\theme-windows.ps1',
    'scripts\tray-dream-skin.ps1',
    'scripts\validate-safe-css-file.mjs',
    'scripts\verify-dream-skin.ps1',
    'runtime\node\node.exe',
    'runtime\node\LICENSE'
  )
  $missingEngineFiles = @($requiredEngineFiles | Where-Object {
    -not (Test-Path -LiteralPath (Join-Path $engine.Root $_) -PathType Leaf)
  })
  $engineComplete = $missingEngineFiles.Count -eq 0
  $needsInstall = $Install -or $payloadVersion -cne $installedVersion -or
    -not $backupExists -or -not $engineComplete

  if ($needsInstall) {
    Wait-DreamSkinCodexClosedForSetup
    Stop-DreamSkinTrayProcess -ScriptPaths @($engine.Tray) -RequireStopped
    & (Join-Path $payloadScripts 'install-dream-skin.ps1') -NoShortcuts
    $engine = Get-DreamSkinRuntimeEnginePaths -StateRoot $stateRoot
    $committedVersion = if (Test-Path -LiteralPath $engine.Version -PathType Leaf) {
      ([System.IO.File]::ReadAllText($engine.Version)).Trim()
    } else { '' }
    $missingEngineFiles = @($requiredEngineFiles | Where-Object {
      -not (Test-Path -LiteralPath (Join-Path $engine.Root $_) -PathType Leaf)
    })
    if ($committedVersion -cne $payloadVersion -or $missingEngineFiles.Count -gt 0 -or
      -not (Test-Path -LiteralPath (Join-Path $stateRoot 'config.before-dream-skin.toml') -PathType Leaf)) {
      throw 'Runtime installation did not commit a complete managed engine.'
    }
  }

  if ($LaunchTray -and -not (Test-DreamSkinTrayActive)) {
    $powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
    $argumentLine = '-NoProfile -STA -WindowStyle Hidden -ExecutionPolicy RemoteSigned -File ' +
      (ConvertTo-DreamSkinProcessArgument -Value $engine.Tray)
    Start-Process -FilePath $powershell -ArgumentList $argumentLine -WindowStyle Hidden | Out-Null
  }
} catch {
  Show-DreamSkinBootstrapMessage -Message $_.Exception.Message -Kind Error
  Write-Error $_
  exit 1
}
