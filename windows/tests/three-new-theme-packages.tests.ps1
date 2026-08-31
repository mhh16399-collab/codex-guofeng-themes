[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$windowsRoot = Split-Path -Parent $PSScriptRoot
$repositoryRoot = Split-Path -Parent $windowsRoot
. (Join-Path $windowsRoot 'scripts\common-windows.ps1')
. (Join-Path $windowsRoot 'scripts\theme-windows.ps1')

$packages = @(
  'preset-lanting-qushui'
  'preset-yanshan-qiuse'
  'preset-chibi-yehang'
)
$stateRoot = Join-Path ([System.IO.Path]::GetTempPath()) `
  ('codex-three-guofeng-packages-' + [Guid]::NewGuid().ToString('N'))

try {
  $paths = Initialize-DreamSkinThemeStore -SkillRoot $windowsRoot -StateRoot $stateRoot
  $activeBefore = Get-DreamSkinThemeSemanticFingerprint -ThemeDirectory $paths.Active

  foreach ($themeId in $packages) {
    $archive = Join-Path $repositoryRoot "site\public\downloads\$themeId.zip"
    if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) {
      throw "Missing downloadable theme package: $themeId"
    }

    $result = Import-DreamSkinThemeZip -ArchivePath $archive -StateRoot $stateRoot
    if ($result.Status -cne 'Imported' -or
      $result.Id -cne $themeId -or
      $result.SafeCssStatus -cne 'validated') {
      throw "Theme package did not import through the strict client path: $themeId"
    }

    $loaded = Read-DreamSkinTheme -ThemeDirectory $result.Path
    if ("$($loaded.Theme.id)" -cne $themeId -or
      "$($loaded.Theme.image)" -cne 'background.png') {
      throw "Imported theme package identity is incorrect: $themeId"
    }
  }

  if ((Get-DreamSkinThemeSemanticFingerprint -ThemeDirectory $paths.Active) -cne $activeBefore) {
    throw 'Importing the three new themes changed the active theme.'
  }
} finally {
  Remove-Item -LiteralPath $stateRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output 'PASS: all three new Guofeng ZIPs import safely without changing the active theme.'
