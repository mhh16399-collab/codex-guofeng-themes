[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$windowsRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $windowsRoot 'scripts\common-windows.ps1')
. (Join-Path $windowsRoot 'scripts\theme-windows.ps1')

$catalogPath = Join-Path $windowsRoot 'presets\catalog.json'
if (-not (Test-Path -LiteralPath $catalogPath -PathType Leaf)) {
  throw 'Windows Guofeng preset catalog is missing.'
}
$catalog = [System.IO.File]::ReadAllText($catalogPath) | ConvertFrom-Json
$expectedIds = @('preset-moyun', 'preset-zhuqing', 'preset-zhusha')
$actualIds = @($catalog.themes | ForEach-Object { "$_" } | Sort-Object)
if ($catalog.schemaVersion -ne 1 -or
  "$($catalog.defaultThemeId)" -cne 'preset-zhuqing' -or
  @(Compare-Object -ReferenceObject $expectedIds -DifferenceObject $actualIds).Count -ne 0) {
  throw 'Windows Guofeng preset catalog does not declare the exact v1 theme set.'
}

foreach ($themeId in $actualIds) {
  $themeRoot = Join-Path (Join-Path $windowsRoot 'presets') $themeId
  $themePath = Join-Path $themeRoot 'theme.json'
  $cssPath = Join-Path $themeRoot 'theme.css'
  $loaded = Read-DreamSkinTheme -ThemeDirectory $themeRoot
  if ("$($loaded.Theme.id)" -cne $themeId -or
    "$($loaded.Theme.image)" -cne 'background.jpg' -or
    "$($loaded.Theme.appearance)" -cne 'light' -or
    "$($loaded.Theme.art.safeArea)" -cne 'left' -or
    "$($loaded.Theme.art.taskMode)" -cne 'ambient' -or
    -not (Test-Path -LiteralPath $themePath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $cssPath -PathType Leaf)) {
    throw "Bundled Guofeng theme contract is incomplete: $themeId"
  }
  Assert-DreamSkinSafeCssFile -Path $cssPath
}

$stateRoot = Join-Path ([System.IO.Path]::GetTempPath()) `
  ('codex-guofeng-theme-test-' + [Guid]::NewGuid().ToString('N'))
try {
  $paths = Initialize-DreamSkinThemeStore -SkillRoot $windowsRoot -StateRoot $stateRoot
  $active = Read-DreamSkinTheme -ThemeDirectory $paths.Active
  if ("$($active.Theme.id)" -cne 'preset-zhuqing' -or
    "$($active.Theme.name)" -cne '竹青') {
    throw 'Fresh Windows theme state did not default to Zhuqing.'
  }

  $savedThemes = @(Get-DreamSkinSavedThemes -StateRoot $stateRoot)
  $savedIds = @($savedThemes | ForEach-Object { $_.Id } | Sort-Object)
  if ($savedThemes.Count -ne 3 -or
    @(Compare-Object -ReferenceObject $expectedIds -DifferenceObject $savedIds).Count -ne 0) {
    throw 'Fresh Windows theme state did not save exactly the three Guofeng themes.'
  }

  $custom = Set-DreamSkinActiveTheme `
    -ImagePath (Join-Path $windowsRoot 'assets\dream-reference.jpg') `
    -Theme $null -Name '保留我的主题' -StateRoot $stateRoot
  $null = Initialize-DreamSkinThemeStore -SkillRoot $windowsRoot -StateRoot $stateRoot
  $activeAfterReinitialize = Read-DreamSkinTheme -ThemeDirectory $paths.Active
  $savedAfterReinitialize = @(Get-DreamSkinSavedThemes -StateRoot $stateRoot)
  if ("$($custom.Theme.id)" -cne 'custom' -or
    "$($activeAfterReinitialize.Theme.id)" -cne 'custom' -or
    $savedAfterReinitialize.Count -ne 3) {
    throw 'Guofeng preset refresh overwrote a custom active theme or duplicated saved presets.'
  }
} finally {
  Remove-Item -LiteralPath $stateRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output 'PASS: Windows seeds exactly Zhuqing, Zhusha, and Moyun while preserving custom active themes.'
