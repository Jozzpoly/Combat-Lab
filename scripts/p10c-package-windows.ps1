# P10c Windows portable packaging and native localhost smoke.
# A Node executable from actions/setup-node is redistributed with its license.
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$folder = Join-Path $repo "Combat-Lab-P10b-Portable-Windows"
$site = Join-Path $folder "site"
if (Test-Path $folder) { Remove-Item $folder -Recurse -Force }
New-Item -ItemType Directory -Force $site | Out-Null
$sourceSite = Join-Path $repo "p10c-tested-site"
if (!(Test-Path (Join-Path $sourceSite "p10.html"))) { throw "Tested P10b HTML missing" }
Copy-Item (Join-Path $sourceSite "*") $site -Recurse -Force
Copy-Item (Join-Path $repo "scripts/p10c-server.mjs") (Join-Path $folder "server.mjs")
Copy-Item (Join-Path $repo "scripts/p10c-launch.cmd") (Join-Path $folder "URUCHOM-COMBAT-LAB.cmd")
Copy-Item (Join-Path $repo "scripts/P10C_FIRST_LOOK_README.txt") (Join-Path $folder "README.txt")
$node = (Get-Command node.exe).Source
if (!(Test-Path $node)) { throw "No genuine setup-node Windows binary" }
Copy-Item $node (Join-Path $folder "node.exe")
$version = (& $node --version).Trim()
if ($version -notmatch "^v22\.\d+\.\d+$") { throw "Unexpected Node version $version" }
$nodeDir = Split-Path $node -Parent
$lic = @((Join-Path $nodeDir "LICENSE"), (Join-Path $nodeDir "LICENSE.md")) |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if ($lic) {
 Copy-Item $lic (Join-Path $folder "NODE-LICENSE.txt")
} else {
 # Official exact-tag upstream license is needed when redistributing Node.
 $uri = "https://raw.githubusercontent.com/nodejs/node/$version/LICENSE"
 Invoke-WebRequest -Uri $uri -OutFile (Join-Path $folder "NODE-LICENSE.txt") -ErrorAction Stop
}
if ((Get-Item (Join-Path $folder "NODE-LICENSE.txt")).Length -lt 1000) { throw "Node license missing/invalid" }
$signature = Get-AuthenticodeSignature (Join-Path $folder "node.exe")
Write-Host "Windows Node from official setup-node: $version ; Authenticode: $($signature.Status)"
# A third-party gate must not force users to disable Windows protections:
if ($signature.Status -ne "Valid") { throw "Node binary is not Authenticode-valid. Refuse untrusted portable package." }
$env:P10C_PORT="4174"
$env:P10C_NO_OPEN="1"
$outFile = Join-Path $repo "p10c-windows-stdout.log"
$errFile = Join-Path $repo "p10c-windows-stderr.log"
$proc = Start-Process -FilePath (Join-Path $folder "node.exe") -ArgumentList "server.mjs" -WorkingDirectory $folder -WindowStyle Hidden -RedirectStandardOutput $outFile -RedirectStandardError $errFile -PassThru
try {
 $success=$false
 for ($n=0;$n -lt 60;$n++){
  Start-Sleep -Milliseconds 250
  if ($proc.HasExited) { throw "Packaged Node exited with code $($proc.ExitCode)" }
  try {
   $page=Invoke-WebRequest "http://127.0.0.1:4174/p10.html" -UseBasicParsing -TimeoutSec 2
   if ($page.StatusCode -eq 200 -and $page.Content.Contains("Materialny warsztat")){
     $success=$true;break
   }
  } catch {}
 }
 if (!$success) { throw "Windows portable localhost HTML smoke FAIL" }
 $index=Invoke-WebRequest "http://127.0.0.1:4174/" -UseBasicParsing
 if ($index.StatusCode -ne 200 -or !$index.Content.Contains("Materialny warsztat")) { throw "Windows launcher root route FAIL" }
 if ($page.Content -notmatch 'src="([^"]+\.js)"') { throw "Missing Vite entry" }
 $scriptUrl=$Matches[1]
 $scriptUri=[uri]::new([uri]"http://127.0.0.1:4174/p10.html",$scriptUrl)
 $script=Invoke-WebRequest $scriptUri -UseBasicParsing
 $assets=@(Get-ChildItem -Path (Join-Path $site "assets") -File -Recurse)
 $allAssetsBytes=($assets | Measure-Object -Property Length -Sum).Sum
 $jsBytes=($assets | Where-Object Extension -eq ".js" | Measure-Object -Property Length -Sum).Sum
 $assetTypes=($assets | Group-Object Extension | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", "
 Write-Host "Windows entry JavaScript: status=$($script.StatusCode), MIME=$($script.Headers["Content-Type"]), bytes=$($script.RawContentLength), bundled JS=$jsBytes, TOTAL bundle assets=$allAssetsBytes; types=$assetTypes"
 if ($script.StatusCode -ne 200 -or $script.Headers["Content-Type"] -notmatch "javascript" -or $script.RawContentLength -lt 500 -or $jsBytes -lt 100000 -or $allAssetsBytes -lt 1000000) { throw "Windows served game source invalid (entry + full WASM/CSS/JS assets)" }
 Write-Host "Windows genuine packaged node localhost static smoke PASS; HTML + JS loaded. Full real Chromium interactions were separately tested on Linux."
} finally {
 if (!$proc.HasExited){ Stop-Process -Id $proc.Id -Force }
 Remove-Item Env:P10C_PORT -ErrorAction SilentlyContinue
 Remove-Item Env:P10C_NO_OPEN -ErrorAction SilentlyContinue
}
# Execute the ACTUAL double-click .cmd, not only node.exe directly.
# This is the last Windows startup boundary; native Chromium is on Linux.
$launcher=Join-Path $folder "URUCHOM-COMBAT-LAB.cmd"
if (!(Test-Path $launcher)) { throw "Windows launcher missing from ZIP tree" }
$env:P10C_PORT="4175"
$env:P10C_NO_OPEN="1"
$launchOut=Join-Path $repo "p10c-launcher-stdout.log"
$launchErr=Join-Path $repo "p10c-launcher-stderr.log"
$cmdArgs='/d /c "' + $launcher + '"'
$cmd=Start-Process -FilePath "$env:SystemRoot\System32\cmd.exe" -ArgumentList $cmdArgs -WorkingDirectory $folder -RedirectStandardOutput $launchOut -RedirectStandardError $launchErr -PassThru -WindowStyle Hidden
try {
 $started=$false
 for ($n=0;$n -lt 60;$n++){
  Start-Sleep -Milliseconds 250
  if ($cmd.HasExited) { throw "Windows launcher quit prematurely: $($cmd.ExitCode)" }
  try{
   $page=Invoke-WebRequest "http://127.0.0.1:4175/p10.html" -UseBasicParsing -TimeoutSec 2
   if ($page.StatusCode -eq 200 -and $page.Content.Contains("Materialny warsztat")){
    $started=$true;break
   }
  } catch {}
 }
 if (!$started) {
  $errorText=Get-Content $launchErr -Raw -ErrorAction SilentlyContinue
  throw "Actual .cmd launcher did not start packaged local server: $errorText"
 }
 Write-Host "ACTUAL .cmd Windows launch chain: PASS; localhost 127.0.0.1:4175."
} finally {
 try{ & taskkill.exe /PID $cmd.Id /T /F | Out-Null }catch{}
 Remove-Item Env:P10C_PORT -ErrorAction SilentlyContinue
 Remove-Item Env:P10C_NO_OPEN -ErrorAction SilentlyContinue
}

$zip=Join-Path $repo "Combat-Lab-P10b-Portable-Windows.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $folder -DestinationPath $zip -CompressionLevel Optimal
$hash=(Get-FileHash -Algorithm SHA256 $zip).Hash
$bytes=(Get-Item $zip).Length
Write-Host "P10C WINDOWS PACKAGE PASS: $zip, $bytes bytes, SHA256 $hash"
