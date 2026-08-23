[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateNotNullOrEmpty()]
  [string[]]$PresetIds
)

$ErrorActionPreference = 'Stop'
$windowsRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $windowsRoot
. (Join-Path $windowsRoot 'scripts\common-windows.ps1')
. (Join-Path $windowsRoot 'scripts\theme-windows.ps1')

$catalogPath = Join-Path $windowsRoot 'presets\catalog.json'
$catalog = [System.IO.File]::ReadAllText($catalogPath) | ConvertFrom-Json
$catalogIds = @($catalog.themes | ForEach-Object { "$_" })
$requestedIds = @($PresetIds | Select-Object -Unique)
if ($requestedIds.Count -eq 0) { throw 'At least one changed preset ID is required.' }

$buildReleasePath = Join-Path $windowsRoot 'installer\build-release.ps1'
$bootstrapPath = Join-Path $windowsRoot 'installer\setup-bootstrap.ps1'
$galleryPath = Join-Path $repoRoot 'site\src\App.jsx'
$buildReleaseSource = [System.IO.File]::ReadAllText($buildReleasePath)
$bootstrapSource = [System.IO.File]::ReadAllText($bootstrapPath)
$gallerySource = [System.IO.File]::ReadAllText($galleryPath)

foreach ($presetId in $requestedIds) {
  if ($presetId -cnotmatch '^preset-[a-z0-9]+(?:-[a-z0-9]+)*$') {
    throw "Changed preset ID is not canonical: $presetId"
  }
  if ($presetId -cnotin $catalogIds) {
    throw "Changed preset is not listed in catalog.json: $presetId"
  }

  $presetRoot = Join-Path (Join-Path $windowsRoot 'presets') $presetId
  $themePath = Join-Path $presetRoot 'theme.json'
  $cssPath = Join-Path $presetRoot 'theme.css'
  $backgroundPath = Join-Path $presetRoot 'background.jpg'
  $loaded = Read-DreamSkinTheme -ThemeDirectory $presetRoot
  if ("$($loaded.Theme.id)" -cne $presetId -or
    "$($loaded.Theme.image)" -cne 'background.jpg' -or
    "$($loaded.Theme.appearance)" -cnotin @('light', 'dark') -or
    "$($loaded.Theme.art.safeArea)" -cne 'left' -or
    "$($loaded.Theme.art.taskMode)" -cnotin @('ambient', 'full') -or
    @($loaded.Theme.colors.PSObject.Properties).Count -ne 10 -or
    -not (Test-Path -LiteralPath $themePath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $cssPath -PathType Leaf) -or
    -not (Test-Path -LiteralPath $backgroundPath -PathType Leaf)) {
    throw "Changed preset contract is incomplete: $presetId"
  }
  Assert-DreamSkinSafeCssFile -Path $cssPath

  foreach ($relativeFile in @('background.jpg', 'theme.json', 'theme.css')) {
    $manifestRelative = "$presetId\$relativeFile"
    $payloadRelative = "presets\$manifestRelative"
    $filePath = Join-Path $presetRoot $relativeFile
    $hash = (Get-FileHash -LiteralPath $filePath -Algorithm SHA256).Hash.ToLowerInvariant()
    $hashPattern = [regex]::Escape("'$manifestRelative'") + "\s*=\s*'$hash'"
    if ($buildReleaseSource -cnotmatch $hashPattern) {
      throw "Changed preset hash is missing or stale in build-release.ps1: $manifestRelative"
    }
    if (-not $buildReleaseSource.Contains("'$payloadRelative'")) {
      throw "Changed preset release payload is missing: $payloadRelative"
    }
    if (-not $bootstrapSource.Contains("'$payloadRelative'")) {
      throw "Changed preset repair payload is missing: $payloadRelative"
    }
  }

  $slug = $presetId.Substring('preset-'.Length)
  if (-not $gallerySource.Contains("id: `"$slug`"") -or
    -not $gallerySource.Contains("image: `"themes/$slug.png`"") -or
    -not (Test-Path -LiteralPath (Join-Path $repoRoot "site\public\themes\$slug.png") -PathType Leaf)) {
    throw "Changed preset is missing from the gallery or has no preview: $presetId"
  }
}

$catalogHash = (Get-FileHash -LiteralPath $catalogPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($buildReleaseSource -cnotmatch ([regex]::Escape("'catalog.json'") + "\s*=\s*'$catalogHash'")) {
  throw 'catalog.json hash is stale in build-release.ps1.'
}

Write-Output "PASS: incrementally validated $($requestedIds.Count) changed Guofeng preset(s): $($requestedIds -join ', ')"
