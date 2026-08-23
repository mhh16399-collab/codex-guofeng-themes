[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$windowsRoot = Split-Path -Parent $PSScriptRoot
. (Join-Path $windowsRoot 'scripts\common-windows.ps1')
. (Join-Path $windowsRoot 'scripts\theme-windows.ps1')

$expectedIds = @(
  'preset-zhuqing', 'preset-zhusha', 'preset-moyun', 'preset-ruyao-tianqing',
  'preset-dunhuang-liujin', 'preset-qinghua-ci', 'preset-haitang-songjin',
  'preset-jiye-xinghe', 'preset-qianli-jiangshan', 'preset-jingtai-hualan',
  'preset-heiqi-luodian', 'preset-chayan-songfeng', 'preset-sunmao-danying',
  'preset-ruihe-lingxiao', 'preset-tangsancai', 'preset-hanjian-mohen',
  'preset-luoshui-liuxia', 'preset-jinling-yunjin'
)
$catalogPath = Join-Path $windowsRoot 'presets\catalog.json'
$catalog = [System.IO.File]::ReadAllText($catalogPath) | ConvertFrom-Json
$actualIds = @($catalog.themes | ForEach-Object { "$_" })
if ($catalog.schemaVersion -ne 1 -or
  @(Compare-Object -ReferenceObject ($expectedIds | Sort-Object) -DifferenceObject ($actualIds | Sort-Object)).Count -ne 0) {
  throw 'Windows Guofeng preset catalog does not declare the exact 18-theme set.'
}

$stateRoot = Join-Path ([System.IO.Path]::GetTempPath()) `
  ('codex-guofeng-theme-test-' + [Guid]::NewGuid().ToString('N'))
try {
  $paths = Initialize-DreamSkinThemeStore -SkillRoot $windowsRoot -StateRoot $stateRoot
  $savedIds = @(Get-DreamSkinSavedThemes -StateRoot $stateRoot -SkipImageMetadata |
    ForEach-Object { $_.Id })
  foreach ($themeId in $expectedIds) {
    if ($savedIds -notcontains $themeId) {
      throw "Fresh Windows installation did not seed bundled theme: $themeId"
    }
  }

  $sourceQianli = Join-Path $windowsRoot 'presets\preset-qianli-jiangshan'
  $savedQianli = Join-Path $paths.Saved 'preset-qianli-jiangshan'
  $sourceCss = [System.IO.File]::ReadAllText((Join-Path $sourceQianli 'theme.css'))
  $savedCss = [System.IO.File]::ReadAllText((Join-Path $savedQianli 'theme.css'))
  if ($savedCss -cne $sourceCss -or $savedCss -notmatch '\[data-ds-part="composer"\]') {
    throw 'Fresh installation did not seed the complete Qianli Jiangshan CSS.'
  }

  [System.IO.File]::WriteAllText(
    (Join-Path $savedQianli 'theme.css'),
    "[data-ds-part=`"main`"] { background: pink; }`r`n",
    [System.Text.UTF8Encoding]::new($false)
  )
  Remove-Item -LiteralPath $paths.Active -Recurse -Force
  Copy-Item -LiteralPath $savedQianli -Destination $paths.Active -Recurse -Force
  $null = Initialize-DreamSkinThemeStore -SkillRoot $windowsRoot -StateRoot $stateRoot

  $refreshedSavedCss = [System.IO.File]::ReadAllText((Join-Path $savedQianli 'theme.css'))
  $refreshedActiveCss = [System.IO.File]::ReadAllText((Join-Path $paths.Active 'theme.css'))
  if ($refreshedSavedCss -cne $sourceCss -or $refreshedActiveCss -cne $sourceCss) {
    throw 'Upgrade did not refresh the saved and active Qianli Jiangshan CSS.'
  }
} finally {
  Remove-Item -LiteralPath $stateRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output 'PASS: Windows seeds all 18 Guofeng themes and refreshes active Qianli Jiangshan.'
