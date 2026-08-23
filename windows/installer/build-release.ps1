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
$reviewedWindowsPresetSha256 = @{
  'catalog.json' = '26f2204a70306e6cae93c89d6ddbd764a22e7b2b91d2b0b547ac0fd5cd387222'
  'preset-zhuqing\background.jpg' = '2715879d9a476d868146b9b9241a97fe10ef2d4eb0111ccb862ad09138449dde'
  'preset-zhuqing\theme.json' = '4e9b1d3a7ca0772a7980dbef7cdbf593bf5da0d18f1046ae240e46a37440dd01'
  'preset-zhuqing\theme.css' = '0e2c52f085d532d29a28f131d953877c8de93f1acdd0cebcfe606d67209b1201'
  'preset-zhusha\background.jpg' = 'd82bc8b11dbd4a505bbc26ddcb3ce52d86884b6d0c33037529227d496487e001'
  'preset-zhusha\theme.json' = '437ef9a53f3670eb3f79ead31b57fd77244faf6177117e72c0fb5b5c2d697ff2'
  'preset-zhusha\theme.css' = 'bf9e9afea05f0b7b07bb8356808dfc15e9fe12ba3c93da32cd511bee2952aa41'
  'preset-moyun\background.jpg' = 'e2783912293a6309b957d6b80db1e9adc256fe23941dfbe63ad8ae028e467c10'
  'preset-moyun\theme.json' = 'd90f9b974b10785bd2d8f386f7247be1c79653e21395d1b568511d52ba5ec104'
  'preset-moyun\theme.css' = '07dc515b3667bd7b047cc46af2f4242f7688487ee3ef31141848625d87df4e09'
  'preset-ruyao-tianqing\background.jpg' = 'b87957a8a680819279e805ca9a201b3f19fb7b315e7f6a2a3ad3999e878f0a68'
  'preset-ruyao-tianqing\theme.json' = '6f3020e846402d330d47e9d5f18c15155b67edbd8f7a3d146702ea1c7fa9e974'
  'preset-ruyao-tianqing\theme.css' = '6753a134b469828a3655f8b707f7caff094ff7d886dd359809c2f13ded07769e'
  'preset-dunhuang-liujin\background.jpg' = '87833dc26c437f1c3245ef95c7936c55be51453e863e0cd0d129cd001df5ff24'
  'preset-dunhuang-liujin\theme.json' = '37f31fe66e22caa5ce914085d6585740f1d89742aae3983dc47fe793c8e5ae07'
  'preset-dunhuang-liujin\theme.css' = '8bfc269261d5d98233fd43fa7d006aae72d19e13bdb2b49b86fd1f05d894b962'
  'preset-qinghua-ci\background.jpg' = '8d9800617948999be55ba79a819b3db5e3d0066de84217e04e68f3b7ac885160'
  'preset-qinghua-ci\theme.json' = '5e11b1834f97505cc0d2941e144496cfa02af0e86bfbc47625b5648345b2c3f3'
  'preset-qinghua-ci\theme.css' = '0ed0de7e538e1a8e842f8a19e5ae976089fd0b08b3d4cd45e3dbf665f47af9ae'
  'preset-haitang-songjin\background.jpg' = '61e11828a9becd41817ce9cfaf10c9567c3c2df50859d60d06ed9f16694612df'
  'preset-haitang-songjin\theme.json' = '8089fed6e63967ff0768025a0b1c23bb14f23cc070147eab13cc9fb1811f7f52'
  'preset-haitang-songjin\theme.css' = '37891dd26c76968f2c853511f317d9f323dcaa20ffd30d1b8ef55a5c83a41285'
  'preset-jiye-xinghe\background.jpg' = '175e7bcd2c4c518ddbcbcf9db2434475d1233d18ccbcc61739a5c7154fe76de2'
  'preset-jiye-xinghe\theme.json' = 'c9abcd8048c34bec1498f2c56b6cdd25f4e5855ba05450d28dbc36141bddda47'
  'preset-jiye-xinghe\theme.css' = '039ef77ace4eec4c4557911585358fa096dd400676cdb9d1b54120b357d63f50'
  'preset-qianli-jiangshan\background.jpg' = '192478e4158c9bb855e26b3121a31dd7fc7f5593754b891581cd12a8f9a19e82'
  'preset-qianli-jiangshan\theme.json' = 'e4ac69245dadac99ed955f0a1eee81fd6bf737c9b5a89b42adbacc0b5c772a2f'
  'preset-qianli-jiangshan\theme.css' = '8f74fe4c80f715a1adb671b45b7d465e296f1ba231e4a00986cd9a66656010a7'
  'preset-jingtai-hualan\background.jpg' = '30302c7b43d4d23c24139d02d9f4ec7636a6e3258babd21eacb3092533b4e0dc'
  'preset-jingtai-hualan\theme.json' = 'e94443ce8001d07cae86f67d28b51142aa1c5ec624a3dd528462dc6cedce6c8e'
  'preset-jingtai-hualan\theme.css' = '84d4b9d521f0119738d5f839b47f62e55d64a4f65a0dfcd7aaf5fea4c22da584'
  'preset-heiqi-luodian\background.jpg' = '26d33618bc7891d74e8f7cea7f593101307337bf7ca7917f2f0db16b69482b0a'
  'preset-heiqi-luodian\theme.json' = '9aaededae95912e1b3af9aa282c2c90fc17d23290de13b6ce6ddb44ab27e2b8a'
  'preset-heiqi-luodian\theme.css' = 'd66d55bff404bc82bdd777bea22ce8df085f14d384fc7f8e53fcd50af6af0142'
  'preset-chayan-songfeng\background.jpg' = 'c9687ccc3d856db576bb23e51cdff98dc979c5fa485ff79aae6f8dd2d51ddeee'
  'preset-chayan-songfeng\theme.json' = 'e4ec2f0af7b7ecbb9e55625dfdf8bf7f1218ee26c53213284a962817e9c70d84'
  'preset-chayan-songfeng\theme.css' = '0683facee12988df10bdfeed528f89ca804ddcd410cd044caef513455367e3b1'
  'preset-sunmao-danying\background.jpg' = '9f0ba408d16df4db512949536e7e30a3dbadecfff538fa897b3c81266a720a8e'
  'preset-sunmao-danying\theme.json' = '8ecd581426958f91420044e7eaea90cc97714649b9e08faacfbf5830ba294635'
  'preset-sunmao-danying\theme.css' = '9fd7696971ffba7ce25d6bb6a18b542e8c9b4b2912ec2856ef2adaf8a69226be'
  'preset-ruihe-lingxiao\background.jpg' = 'b28285d58fd5ba8d607c7300ab51cd85fc251409aac0e02167d5e35a03d3ce1e'
  'preset-ruihe-lingxiao\theme.json' = '7137b9238125f6ad5eaef4f3a120197ff77604f6eb03ef487c43db79e0c66668'
  'preset-ruihe-lingxiao\theme.css' = '14c1650fecbf754e610b204dbde456d10633d0fa4df410070819eecb0c7875b2'
  'preset-tangsancai\background.jpg' = 'f99084b7a42c198fe07f0ac78761e27df688efa4a8cf1811897d4f409940a5a3'
  'preset-tangsancai\theme.json' = '30bec52696ea91c99a651393bdc048ba695652d076eda57a00d8f4a3ccef0673'
  'preset-tangsancai\theme.css' = '1b26dc50a359dab7a90219bc302bbf40788c5728501b57d0fc8a146bb90f76e4'
  'preset-hanjian-mohen\background.jpg' = 'cd109013b6ac12ea8539d2105d2d2ef11c088e3e4f74995c3c88f80df3a87af7'
  'preset-hanjian-mohen\theme.json' = '3a7ff6b349adb176a6c1e745e68af4455feb02fd133d43ab01ce4b9813c875d5'
  'preset-hanjian-mohen\theme.css' = '1901e44327024f95d985751a6bed075e1063681378a9522684f14e76b803f9b5'
  'preset-luoshui-liuxia\background.jpg' = 'de459c151d4be27b7333489ec491d37308a24e9118945582b1ccb2aecc361853'
  'preset-luoshui-liuxia\theme.json' = '1d5bd28b9360cc3cbffea8532f581a5cf39d36ba55ebe4ee32b0d993eeb9c2e5'
  'preset-luoshui-liuxia\theme.css' = '4c9dec03616ea5bb40e911da5cc7ccc9058392a69b14cdf896c9a230aafa430f'
  'preset-jinling-yunjin\background.jpg' = 'fed8ad25a74d8c2ff12872a0f0ddbe41b369a73ad58595f180fc2a637656854f'
  'preset-jinling-yunjin\theme.json' = 'd00cc1230bce0f1d43f6fc9fc47f8de3c747337b5b855c19c96a564cca518ae3'
  'preset-jinling-yunjin\theme.css' = 'f898c4038b3d3f001ddff22b942463740c040adf36a56c34d808191db5e7d05a'
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
foreach ($relativePath in $reviewedWindowsPresetSha256.Keys) {
  $presetPath = Join-Path (Join-Path $windowsRoot 'presets') $relativePath
  if (-not (Test-Path -LiteralPath $presetPath -PathType Leaf)) {
    throw "The reviewed Windows preset file is missing: $relativePath"
  }
  $presetHash = (Get-FileHash -LiteralPath $presetPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $expectedPresetHash = $reviewedWindowsPresetSha256[$relativePath]
  if ($presetHash -cne $expectedPresetHash) {
    throw "The reviewed Windows preset file changed: $relativePath. Expected $expectedPresetHash, found $presetHash."
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
  Copy-ReleaseDirectory -Source (Join-Path $windowsRoot 'presets') -Destination (Join-Path $payloadRoot 'presets')
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
  foreach ($relative in $expectedPayloadFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $payloadRoot $relative) -PathType Leaf)) {
      throw "Staged installer payload is incomplete: $relative"
    }
  }
  foreach ($relativePath in $reviewedWindowsPresetSha256.Keys) {
    $stagedPresetPath = Join-Path (Join-Path $payloadRoot 'presets') $relativePath
    $stagedPresetHash = (Get-FileHash -LiteralPath $stagedPresetPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($stagedPresetHash -cne $reviewedWindowsPresetSha256[$relativePath]) {
      throw "Staged installer payload changed a reviewed Guofeng file: $relativePath"
    }
  }

  $arguments = @(
    "/DAppVersion=$version",
    "/DStageRoot=$stageRoot",
    "/DOutputDir=$OutputDirectory",
    $definitionPath
  )
  Write-Host "Building CodexGuofengThemes-Setup-v$version.exe..."
  & $compiler @arguments
  if ($LASTEXITCODE -ne 0) { throw "ISCC.exe failed with exit code $LASTEXITCODE." }

  $artifactPath = Join-Path $OutputDirectory "CodexGuofengThemes-Setup-v$version.exe"
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
