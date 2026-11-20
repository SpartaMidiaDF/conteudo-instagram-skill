# OCR (Windows, sem instalar nada) dos carrosséis dos concorrentes.
# Para cada subpasta de -Root grava transcricao.md (texto slide a slide) e junta tudo em -Saida.
# uso: powershell -ExecutionPolicy Bypass -File ocr.ps1 -Root "<...\2 - Referencia de Concorrente>" -Saida "<...\3 - Base de Conhecimento\TRANSCRICOES.md>" [-Idioma pt-BR]
# Precisa do pacote de idioma do OCR instalado no Windows (Configurações > Idioma). Em Mac/Linux use tesseract.
param([Parameter(Mandatory)][string]$Root, [Parameter(Mandatory)][string]$Saida, [string]$Idioma = 'pt-BR')
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
$null = [Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Await($op, [Type]$t) { $task = $asTask.MakeGenericMethod($t).Invoke($null, @($op)); $task.Wait(); $task.Result }
$lang = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | ? { $_.LanguageTag -eq $Idioma } | Select-Object -First 1
if (-not $lang) { throw "Idioma de OCR '$Idioma' não instalado. Disponíveis: $(([Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages | % LanguageTag) -join ', ')" }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)

$tudo = New-Object System.Text.StringBuilder
[void]$tudo.AppendLine("# Transcrições dos concorrentes`n")
$n = 0
foreach ($dir in Get-ChildItem $Root -Directory | Sort-Object Name) {
  $out = New-Object System.Text.StringBuilder
  [void]$out.AppendLine("# $($dir.Name)`n")
  foreach ($f in Get-ChildItem $dir.FullName -File | ? { $_.Extension -match '^\.(jpe?g|png|webp|mp4|mov)$' } | Sort-Object Name) {
    [void]$out.AppendLine("## $($f.Name)")
    if ($f.Extension -match 'mp4|mov') { [void]$out.AppendLine("[vídeo]`n"); continue }
    $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName)) ([Windows.Storage.StorageFile])
    $stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $dec = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bmp = Await ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    $res = Await ($engine.RecognizeAsync($bmp)) ([Windows.Media.Ocr.OcrResult])
    $stream.Dispose()
    [void]$out.AppendLine((($res.Lines | % { $_.Text }) -join "`n")); [void]$out.AppendLine("")
  }
  [IO.File]::WriteAllText((Join-Path $dir.FullName 'transcricao.md'), $out.ToString(), (New-Object System.Text.UTF8Encoding $false))
  [void]$tudo.AppendLine($out.ToString()); [void]$tudo.AppendLine("---`n"); $n++
}
[IO.File]::WriteAllText($Saida, $tudo.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Output "$n posts transcritos -> $Saida"
