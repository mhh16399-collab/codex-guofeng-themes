[CmdletBinding()]
param(
  [string]$OutputDirectory,
  [string]$IsccPath,
  [string]$NodeArchivePath,
  [string]$WorkingDirectory,
  [switch]$KeepWorkingDirectory
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$installerRoot = $PSScriptRoot
$windowsRoot = Split-Path -Parent $installerRoot
$repositoryRoot = Split-Path -Parent $windowsRoot
$manifestPath = Join-Path $installerRoot 'node-runtime.json'
$definitionPath = Join-Path $installerRoot 'codex-dream-skin.iss'
$bootstrapPath = Join-Path $installerRoot 'setup-bootstrap.ps1'
$versionPath = Join-Path $windowsRoot 'VERSION'
$macosVersionPath = Join-Path (Join-Path $repositoryRoot 'macos') 'VERSION'
$macosPackagePath = Join-Path (Join-Path $repositoryRoot 'macos') 'package.json'
$licensePath = Join-Path (Join-Path $repositoryRoot 'macos') 'LICENSE'
$noticePath = Join-Path (Join-Path $repositoryRoot 'macos') 'NOTICE.md'
$innoLanguageRoot = Join-Path $installerRoot 'languages'
$innoChineseLanguagePath = Join-Path $innoLanguageRoot 'ChineseSimplified.isl'
$innoSetupLicensePath = Join-Path $innoLanguageRoot 'Inno-Setup-License.txt'
$innoChineseLanguageSha256 = '7d544b9bb1d142cfa11f2e5d3cc8abe2e55f8e066c5124e3772675aa236e1278'
$innoSetupLicenseSha256 = '0c81595601bce47eeef8d865d5da7f9ca2c6a12235b7482b29f5ab23ed02ee5a'
$guofengPresetsRoot = Join-Path $windowsRoot 'presets'
$guofengPresetIds = @('preset-zhuqing', 'preset-zhusha', 'preset-moyun')
$guofengPresetHashes = [ordered]@{
  'catalog.json' = '56d82d8caeab90b22c3f4525554ff59f5e858e5230a0959310e07c87fd992d09'
  'preset-zhuqing\background.jpg' = '2715879d9a476d868146b9b9241a97fe10ef2d4eb0111ccb862ad09138449dde'
  'preset-zhuqing\theme.json' = '4e9b1d3a7ca0772a7980dbef7cdbf593bf5da0d18f1046ae240e46a37440dd01'
  'preset-zhuqing\theme.css' = '0e2c52f085d532d29a28f131d953877c8de93f1acdd0cebcfe606d67209b1201'
  'preset-zhusha\background.jpg' = 'd82bc8b11dbd4a505bbc26ddcb3ce52d86884b6d0c33037529227d496487e001'
  'preset-zhusha\theme.json' = '437ef9a53f3670eb3f79ead31b57fd77244faf6177117e72c0fb5b5c2d697ff2'
  'preset-zhusha\theme.css' = 'bf9e9afea05f0b7b07bb8356808dfc15e9fe12ba3c93da32cd511bee2952aa41'
  'preset-moyun\background.jpg' = 'e2783912293a6309b957d6b80db1e9adc256fe23941dfbe63ad8ae028e467c10'
  'preset-moyun\theme.json' = 'd90f9b974b10785bd2d8f386f7247be1c79653e21395d1b568511d52ba5ec104'
  'preset-moyun\theme.css' = '07dc515b3667bd7b047cc46af2f4242f7688487ee3ef31141848625d87df4e09'
}

function Read-ReleaseTextFile {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Required release input does not exist: $Path"
  }
  return [System.IO.File]::ReadAllText($Path, [System.Text.UTF8Encoding]::new($false))
}

function Resolve-ReleasePath {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$BasePath
  )
  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }
  return [System.IO.Path]::GetFullPath((Join-Path $BasePath $Path))
}

function Assert-NodeRuntimeManifest {
  param([Parameter(Mandatory = $true)][object]$Manifest)
  $expectedVersion = '22.23.1'
  $expectedArchive = "node-v$expectedVersion-win-x64.zip"
  $expectedRoot = "node-v$expectedVersion-win-x64"
  $expectedUrl = "https://nodejs.org/dist/v$expectedVersion/$expectedArchive"
  $expectedHash = '7df0bc9375723f4a86b3aa1b7cc73342423d9677a8df4538aca31a049e309c29'

  if ("$($Manifest.version)" -cne $expectedVersion -or
    "$($Manifest.platform)" -cne 'win' -or
    "$($Manifest.architecture)" -cne 'x64' -or
    "$($Manifest.archive)" -cne $expectedArchive -or
    "$($Manifest.url)" -cne $expectedUrl -or
    "$($Manifest.sha256)" -cne $expectedHash -or
    "$($Manifest.nodeEntry)" -cne "$expectedRoot/node.exe" -or
    "$($Manifest.licenseEntry)" -cne "$expectedRoot/LICENSE") {
    throw 'The pinned Node.js runtime manifest differs from the reviewed v22.23.1 win-x64 release.'
  }
}

function Resolve-IsccExecutable {
  param([string]$RequestedPath)
  $candidates = @()
  if ($RequestedPath) { $candidates += $RequestedPath }
  if (${env:ProgramFiles(x86)}) {
    $candidates += Join-Path ${env:ProgramFiles(x86)} 'Inno Setup 6\ISCC.exe'
  }
  if ($env:ProgramFiles) {
    $candidates += Join-Path $env:ProgramFiles 'Inno Setup 6\ISCC.exe'
  }
  if ($env:ChocolateyInstall) {
    $candidates += Join-Path $env:ChocolateyInstall 'bin\iscc.exe'
  }
  $command = Get-Command 'ISCC.exe' -ErrorAction SilentlyContinue
  if ($command) { $candidates += $command.Source }

  foreach ($candidate in $candidates) {
    if (-not $candidate) { continue }
    $resolved = Resolve-ReleasePath -Path $candidate -BasePath $repositoryRoot
    if (Test-Path -LiteralPath $resolved -PathType Leaf) { return $resolved }
  }
  throw 'Inno Setup 6 compiler (ISCC.exe) was not found. Install Inno Setup 6 or pass -IsccPath.'
}

function Copy-ReleaseDirectory {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )
  if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
    throw "Required release directory does not exist: $Source"
  }
  New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  foreach ($item in Get-ChildItem -LiteralPath $Source -Force) {
    Copy-Item -LiteralPath $item.FullName -Destination $Destination -Recurse -Force -ErrorAction Stop
  }
}

function Copy-ZipEntry {
  param(
    [Parameter(Mandatory = $true)][object]$Archive,
    [Parameter(Mandatory = $true)][string]$EntryName,
    [Parameter(Mandatory = $true)][string]$Destination
  )
  $entry = $Archive.GetEntry($EntryName)
  if ($null -eq $entry -or $entry.Length -le 0) {
    throw "The Node.js archive is missing a non-empty entry: $EntryName"
  }
  $parent = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Path $parent -Force | Out-Null
  $input = $entry.Open()
  try {
    $output = [System.IO.File]::Open(
      $Destination,
      [System.IO.FileMode]::CreateNew,
      [System.IO.FileAccess]::Write,
      [System.IO.FileShare]::None
    )
    try { $input.CopyTo($output) } finally { $output.Dispose() }
  } finally {
    $input.Dispose()
  }
}

function Write-DreamSkinIcon {
  param([Parameter(Mandatory = $true)][string]$Path)
  $sizes = @(16, 24, 32, 48, 64, 256)
  $images = New-Object System.Collections.Generic.List[byte[]]

  foreach ($size in $sizes) {
    $pixelBytes = $size * $size * 4
    $maskStride = [int]([Math]::Ceiling($size / 32.0) * 4)
    $stream = [System.IO.MemoryStream]::new()
    $writer = [System.IO.BinaryWriter]::new($stream)
    try {
      $writer.Write([uint32]40)
      $writer.Write([int32]$size)
      $writer.Write([int32]($size * 2))
      $writer.Write([uint16]1)
      $writer.Write([uint16]32)
      $writer.Write([uint32]0)
      $writer.Write([uint32]$pixelBytes)
      $writer.Write([int32]3780)
      $writer.Write([int32]3780)
      $writer.Write([uint32]0)
      $writer.Write([uint32]0)

      $alphaRows = New-Object 'byte[][]' $size
      for ($row = $size - 1; $row -ge 0; $row--) {
        $alphaRow = New-Object byte[] $size
        for ($column = 0; $column -lt $size; $column++) {
          $coverage = 0
          $darkCoverage = 0
          $dotCoverage = 0
          $edgeCoverage = 0
          foreach ($sampleY in @(0.125, 0.375, 0.625, 0.875)) {
            foreach ($sampleX in @(0.125, 0.375, 0.625, 0.875)) {
              # DreamSkin 品牌 mark（与网站 favicon 同源）：白圆角方 +
              # 墨色对角半区（x+y>=1）+ 青点 + 14% 发丝描边环。
              $x = ($column + $sampleX) / $size
              $y = ($row + $sampleY) / $size
              $dx = [Math]::Max([Math]::Abs($x - 0.5) - 0.16, 0.0)
              $dy = [Math]::Max([Math]::Abs($y - 0.5) - 0.16, 0.0)
              $edgeDistance = [Math]::Sqrt($dx * $dx + $dy * $dy)
              if ($edgeDistance -le 0.285) {
                $coverage++
                if (($x + $y) -ge 1.0) { $darkCoverage++ }
                $ddx = $x - 0.719
                $ddy = $y - 0.281
                if (($ddx * $ddx + $ddy * $ddy) -le (0.08 * 0.08)) { $dotCoverage++ }
                if ($edgeDistance -gt (0.285 - [Math]::Max(0.028, 1.1 / $size))) { $edgeCoverage++ }
              }
            }
          }

          $alpha = [int][Math]::Round(255.0 * $coverage / 16.0)
          $alphaRow[$column] = [byte]$alpha
          $darkBlend = $darkCoverage / 16.0
          $dotBlend = $dotCoverage / 16.0
          $edgeBlend = 0.14 * ($edgeCoverage / 16.0)
          $red = 253.0 * (1.0 - $darkBlend) + 23.0 * $darkBlend
          $green = 253.0 * (1.0 - $darkBlend) + 24.0 * $darkBlend
          $blue = 252.0 * (1.0 - $darkBlend) + 28.0 * $darkBlend
          $red = $red * (1.0 - $dotBlend) + 45.0 * $dotBlend
          $green = $green * (1.0 - $dotBlend) + 225.0 * $dotBlend
          $blue = $blue * (1.0 - $dotBlend) + 194.0 * $dotBlend
          $red = [int][Math]::Round($red * (1.0 - $edgeBlend) + 23.0 * $edgeBlend)
          $green = [int][Math]::Round($green * (1.0 - $edgeBlend) + 24.0 * $edgeBlend)
          $blue = [int][Math]::Round($blue * (1.0 - $edgeBlend) + 28.0 * $edgeBlend)
          $writer.Write([byte]$blue)
          $writer.Write([byte]$green)
          $writer.Write([byte]$red)
          $writer.Write([byte]$alpha)
        }
        $alphaRows[$row] = $alphaRow
      }

      for ($row = $size - 1; $row -ge 0; $row--) {
        $maskRow = New-Object byte[] $maskStride
        for ($column = 0; $column -lt $size; $column++) {
          if ($alphaRows[$row][$column] -eq 0) {
            $byteIndex = [int][Math]::Floor($column / 8.0)
            $maskRow[$byteIndex] = $maskRow[$byteIndex] -bor (0x80 -shr ($column % 8))
          }
        }
        $writer.Write($maskRow)
      }
      $writer.Flush()
      $images.Add($stream.ToArray())
    } finally {
      $writer.Dispose()
      $stream.Dispose()
    }
  }

  $parent = Split-Path -Parent $Path
  New-Item -ItemType Directory -Path $parent -Force | Out-Null
  $iconStream = [System.IO.File]::Open(
    $Path,
    [System.IO.FileMode]::Create,
    [System.IO.FileAccess]::Write,
    [System.IO.FileShare]::None
  )
  $iconWriter = [System.IO.BinaryWriter]::new($iconStream)
  try {
    $iconWriter.Write([uint16]0)
    $iconWriter.Write([uint16]1)
    $iconWriter.Write([uint16]$sizes.Count)
    $offset = 6 + (16 * $sizes.Count)
    for ($index = 0; $index -lt $sizes.Count; $index++) {
      $dimension = if ($sizes[$index] -eq 256) { 0 } else { $sizes[$index] }
      $iconWriter.Write([byte]$dimension)
      $iconWriter.Write([byte]$dimension)
      $iconWriter.Write([byte]0)
      $iconWriter.Write([byte]0)
      $iconWriter.Write([uint16]1)
      $iconWriter.Write([uint16]32)
      $iconWriter.Write([uint32]$images[$index].Length)
      $iconWriter.Write([uint32]$offset)
      $offset += $images[$index].Length
    }
    foreach ($image in $images) { $iconWriter.Write($image) }
  } finally {
    $iconWriter.Dispose()
    $iconStream.Dispose()
  }
}

$version = (Read-ReleaseTextFile -Path $versionPath).Trim()
if ($version -cnotmatch '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$') {
  throw "windows/VERSION must contain a three-part semantic version: $version"
}
$macosVersion = (Read-ReleaseTextFile -Path $macosVersionPath).Trim()
$macosPackage = (Read-ReleaseTextFile -Path $macosPackagePath) | ConvertFrom-Json
if ($macosVersion -cne $version -or "$($macosPackage.version)" -cne $version) {
  throw "Release versions differ: windows=$version macOS=$macosVersion package=$($macosPackage.version)"
}

$manifest = (Read-ReleaseTextFile -Path $manifestPath) | ConvertFrom-Json
Assert-NodeRuntimeManifest -Manifest $manifest
$null = Read-ReleaseTextFile -Path $definitionPath
$null = Read-ReleaseTextFile -Path $bootstrapPath
$null = Read-ReleaseTextFile -Path $licensePath
$null = Read-ReleaseTextFile -Path $noticePath
$null = Read-ReleaseTextFile -Path $innoChineseLanguagePath
$null = Read-ReleaseTextFile -Path $innoSetupLicensePath
$innoChineseLanguageHash = (Get-FileHash -LiteralPath $innoChineseLanguagePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($innoChineseLanguageHash -cne $innoChineseLanguageSha256) {
  throw "The pinned Inno Setup Simplified Chinese messages changed. Expected $innoChineseLanguageSha256, found $innoChineseLanguageHash."
}
$innoSetupLicenseHash = (Get-FileHash -LiteralPath $innoSetupLicensePath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($innoSetupLicenseHash -cne $innoSetupLicenseSha256) {
  throw "The pinned Inno Setup license changed. Expected $innoSetupLicenseSha256, found $innoSetupLicenseHash."
}
$guofengCatalog = (Read-ReleaseTextFile -Path (Join-Path $guofengPresetsRoot 'catalog.json')) |
  ConvertFrom-Json
if ([int]$guofengCatalog.schemaVersion -ne 1 -or
  "$($guofengCatalog.defaultThemeId)" -cne 'preset-zhuqing' -or
  @($guofengCatalog.themes).Count -ne $guofengPresetIds.Count) {
  throw 'The reviewed Guofeng theme catalog metadata is unexpected.'
}
for ($presetIndex = 0; $presetIndex -lt $guofengPresetIds.Count; $presetIndex++) {
  $presetId = $guofengPresetIds[$presetIndex]
  if ("$(@($guofengCatalog.themes)[$presetIndex])" -cne $presetId) {
    throw 'The reviewed Guofeng theme catalog order is unexpected.'
  }
  $presetTheme = (Read-ReleaseTextFile -Path (Join-Path $guofengPresetsRoot "$presetId\theme.json")) |
    ConvertFrom-Json
  if ("$($presetTheme.id)" -cne $presetId -or "$($presetTheme.image)" -cne 'background.jpg') {
    throw "The reviewed Guofeng theme metadata is unexpected: $presetId"
  }
}
foreach ($relative in $guofengPresetHashes.Keys) {
  $sourceFile = Join-Path $guofengPresetsRoot $relative
  if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
    throw "A reviewed Guofeng theme file is missing: $relative"
  }
  $actualHash = (Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actualHash -cne $guofengPresetHashes[$relative]) {
    throw "A reviewed Guofeng theme file changed: $relative"
  }
}
$compiler = Resolve-IsccExecutable -RequestedPath $IsccPath

if (-not $OutputDirectory) { $OutputDirectory = Join-Path $repositoryRoot 'release' }
$OutputDirectory = Resolve-ReleasePath -Path $OutputDirectory -BasePath $repositoryRoot
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

if ($WorkingDirectory) {
  $WorkingDirectory = Resolve-ReleasePath -Path $WorkingDirectory -BasePath $repositoryRoot
  if (Test-Path -LiteralPath $WorkingDirectory) {
    throw "The requested working directory already exists: $WorkingDirectory"
  }
  New-Item -ItemType Directory -Path $WorkingDirectory | Out-Null
} else {
  $WorkingDirectory = Join-Path ([System.IO.Path]::GetTempPath()) (
    'codex-dream-skin-windows-release-' + [guid]::NewGuid().ToString('N')
  )
  New-Item -ItemType Directory -Path $WorkingDirectory | Out-Null
}

try {
  $archivePath = if ($NodeArchivePath) {
    Resolve-ReleasePath -Path $NodeArchivePath -BasePath $repositoryRoot
  } else {
    Join-Path $WorkingDirectory "$($manifest.archive)"
  }
  if (-not $NodeArchivePath) {
    $previousProtocol = [Net.ServicePointManager]::SecurityProtocol
    try {
      [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
      Write-Host "Downloading pinned Node.js v$($manifest.version) runtime..."
      Invoke-WebRequest -UseBasicParsing -Uri "$($manifest.url)" -OutFile $archivePath
    } finally {
      [Net.ServicePointManager]::SecurityProtocol = $previousProtocol
    }
  }
  if (-not (Test-Path -LiteralPath $archivePath -PathType Leaf)) {
    throw "Node.js archive does not exist: $archivePath"
  }
  $archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($archiveHash -cne "$($manifest.sha256)") {
    throw "Node.js archive SHA-256 mismatch. Expected $($manifest.sha256), found $archiveHash."
  }

  $stageRoot = Join-Path $WorkingDirectory 'stage'
  $payloadRoot = Join-Path $stageRoot 'payload'
  $nodeRoot = Join-Path (Join-Path $payloadRoot 'runtime') 'node'
  $languageRoot = Join-Path $stageRoot 'languages'
  New-Item -ItemType Directory -Path $payloadRoot | Out-Null
  New-Item -ItemType Directory -Path $languageRoot | Out-Null
  Copy-ReleaseDirectory -Source (Join-Path $windowsRoot 'assets') -Destination (Join-Path $payloadRoot 'assets')
  Copy-ReleaseDirectory -Source (Join-Path $windowsRoot 'scripts') -Destination (Join-Path $payloadRoot 'scripts')
  Copy-ReleaseDirectory -Source $guofengPresetsRoot -Destination (Join-Path $payloadRoot 'presets')
  [System.IO.File]::WriteAllText(
    (Join-Path $payloadRoot 'VERSION'),
    "$version`r`n",
    [System.Text.UTF8Encoding]::new($false)
  )
  Copy-Item -LiteralPath $bootstrapPath -Destination (Join-Path $stageRoot 'setup-bootstrap.ps1') -Force
  Copy-Item -LiteralPath $licensePath -Destination (Join-Path $stageRoot 'LICENSE.txt') -Force
  Copy-Item -LiteralPath $noticePath -Destination (Join-Path $stageRoot 'NOTICE.md') -Force
  Copy-Item -LiteralPath $innoChineseLanguagePath `
    -Destination (Join-Path $languageRoot 'ChineseSimplified.isl') -Force

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    Copy-ZipEntry -Archive $zip -EntryName "$($manifest.nodeEntry)" `
      -Destination (Join-Path $nodeRoot 'node.exe')
    Copy-ZipEntry -Archive $zip -EntryName "$($manifest.licenseEntry)" `
      -Destination (Join-Path $nodeRoot 'LICENSE')
  } finally {
    $zip.Dispose()
  }
  Write-DreamSkinIcon -Path (Join-Path (Join-Path $payloadRoot 'assets') 'codex-dream-skin.ico')

  $expectedPayloadFiles = @(
    'VERSION',
    'assets\dream-reference.jpg',
    'assets\dream-skin.css',
    'assets\renderer-inject.js',
    'assets\safe-css-policy.json',
    'assets\safe-css-validator.mjs',
    'assets\selectors.json',
    'assets\theme-package-validator.mjs',
    'assets\theme.json',
    'assets\theme.css',
    'assets\codex-dream-skin.ico',
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
  foreach ($relative in $expectedPayloadFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $payloadRoot $relative) -PathType Leaf)) {
      throw "Staged installer payload is incomplete: $relative"
    }
  }
  foreach ($relative in $guofengPresetHashes.Keys) {
    $stagedHash = (Get-FileHash -LiteralPath (Join-Path (Join-Path $payloadRoot 'presets') $relative) `
      -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($stagedHash -cne $guofengPresetHashes[$relative]) {
      throw 'Staged installer payload did not retain the reviewed Guofeng theme catalog.'
    }
  }

  $arguments = @(
    "/DAppVersion=$version",
    "/DStageRoot=$stageRoot",
    "/DOutputDir=$OutputDirectory",
    $definitionPath
  )
  Write-Host "Building CodexDreamSkin-Setup-v$version.exe..."
  & $compiler @arguments
  if ($LASTEXITCODE -ne 0) { throw "ISCC.exe failed with exit code $LASTEXITCODE." }

  $artifactPath = Join-Path $OutputDirectory "CodexDreamSkin-Setup-v$version.exe"
  if (-not (Test-Path -LiteralPath $artifactPath -PathType Leaf)) {
    throw "Inno Setup did not create the expected artifact: $artifactPath"
  }
  Write-Host "Windows release created: $artifactPath"
} finally {
  if (-not $KeepWorkingDirectory -and (Test-Path -LiteralPath $WorkingDirectory)) {
    Remove-Item -LiteralPath $WorkingDirectory -Recurse -Force -ErrorAction SilentlyContinue
  } elseif ($KeepWorkingDirectory) {
    Write-Host "Windows release working directory preserved at: $WorkingDirectory"
  }
}
