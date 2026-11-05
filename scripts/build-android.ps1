param([string]$Jdk17Path = $env:JDK17_HOME)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if ($projectRoot -match '[^\x00-\x7F]') { throw 'No Windows, copie o projeto para um caminho sem acentos, por exemplo C:\barbearia-agenda, antes de compilar Android.' }
if (-not $env:JAVA_HOME -or -not $env:ANDROID_HOME) { throw 'Configure JAVA_HOME (JDK compatível) e ANDROID_HOME (Android SDK) nesta sessão.' }
if ($Jdk17Path -and -not (Test-Path -LiteralPath (Join-Path $Jdk17Path 'bin/java.exe'))) { throw 'JDK17_HOME não aponta para um JDK 17 válido.' }
& npx.cmd expo prebuild --platform android --no-install
if ($LASTEXITCODE -ne 0) {
  # Fallback do template local no Windows. Não altera arquivos JS do aplicativo.
  $templateDir = Join-Path $projectRoot '.build-template'
  New-Item -ItemType Directory -Force $templateDir | Out-Null
  & tar -xf 'node_modules/expo/template.tgz' -C $templateDir 'package/android'
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao extrair o template nativo.' }
  Copy-Item -LiteralPath (Join-Path $templateDir 'package/android') -Destination $projectRoot -Recurse -Force
  & npx.cmd expo prebuild --platform android --no-install --no-clean
  if ($LASTEXITCODE -ne 0) { throw 'Falha no prebuild. Confira a mensagem do Expo.' }
}
$buildArgs = @('-p', 'android', 'assembleRelease', '--no-daemon')
if ($Jdk17Path) { $buildArgs += "-Porg.gradle.java.installations.paths=$Jdk17Path" }
& './android/gradlew.bat' @buildArgs
if ($LASTEXITCODE -ne 0) { throw 'Falha no Gradle. Consulte a mensagem de erro acima.' }
$destino = Join-Path $projectRoot 'builds'
New-Item -ItemType Directory -Force $destino | Out-Null
Copy-Item -LiteralPath 'android/app/build/outputs/apk/release/app-release.apk' -Destination (Join-Path $destino 'barbearia-agenda.apk') -Force
Write-Output 'APK gerado em builds/barbearia-agenda.apk'
