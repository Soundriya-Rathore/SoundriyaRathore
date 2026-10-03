# YouTube Channel Automated Watcher & Content Optimizer
# Automatically detects newly uploaded videos or shorts on @soundriya.rathore,
# optimizes their Titles, Descriptions (with full socials & website), and Tags,
# generates 9:16 thumbnails for Shorts or 16:9 thumbnails for normal videos,
# and uploads them directly to YouTube via the official YouTube API.

[CmdletBinding()]
param(
    [switch]$Once,
    [int]$IntervalMinutes = 5
)

Add-Type -AssemblyName System.Drawing

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ManagerScript = Join-Path $ScriptDir "youtube-manager.ps1"
$ProcessedFile = Join-Path $ScriptDir "processed_videos.json"
$ThumbnailsDir = "c:\Users\adity\Desktop\Soundriya Rathore\assets\thumbnails\generated"
$FramesDir = "c:\Users\adity\Desktop\Soundriya Rathore\assets\thumbnails\watcher_frames"

if (-not (Test-Path $ThumbnailsDir)) { New-Item -ItemType Directory -Path $ThumbnailsDir -Force | Out-Null }
if (-not (Test-Path $FramesDir)) { New-Item -ItemType Directory -Path $FramesDir -Force | Out-Null }

. $ManagerScript

function Load-ProcessedRegistry {
    if (Test-Path $ProcessedFile) {
        return (Get-Content -Raw $ProcessedFile | ConvertFrom-Json)
    }
    return [PSCustomObject]@{
        processed_at = (Get-Date).ToUniversalTime().ToString("o")
        videos = @{}
    }
}

function Save-ProcessedRegistry($registry) {
    $registry.processed_at = (Get-Date).ToUniversalTime().ToString("o")
    $registry | ConvertTo-Json -Depth 5 | Set-Content -Path $ProcessedFile -Encoding UTF8
}

function Parse-IsoDuration([string]$isoDuration) {
    # Parses durations like PT56S, PT1M4S, PT1H2M3S into total seconds
    try {
        return [System.Xml.XmlConvert]::ToTimeSpan($isoDuration).TotalSeconds
    } catch {
        return 0
    }
}

function Get-VideoAspectRatioClassification([string]$VideoId) {
    Write-Host "[AspectRatio] Detecting native aspect ratio for video $VideoId..."
    
    # Method 1: Inspect frame0.jpg dimensions
    $frame0Url = "https://i.ytimg.com/vi/$VideoId/frame0.jpg"
    $testFramePath = Join-Path $FramesDir "${VideoId}_aspect_detect.jpg"
    curl.exe -s -L $frame0Url -o $testFramePath
    
    $width = 0
    $height = 0
    $ratio = 0.0
    if (Test-Path $testFramePath) {
        $fItem = Get-Item $testFramePath
        if ($fItem.Length -gt 1000) {
            try {
                $img = [System.Drawing.Image]::FromFile($testFramePath)
                $width = $img.Width
                $height = $img.Height
                if ($height -gt 0) {
                    $ratio = [double]$width / [double]$height
                }
                $img.Dispose()
            } catch {}
        }
    }

    # Method 2: Check YouTube Shorts endpoint redirect behavior
    $shortsUrl = "https://www.youtube.com/shorts/$VideoId"
    $req = [System.Net.WebRequest]::Create($shortsUrl)
    $req.Method = "HEAD"
    $req.AllowAutoRedirect = $false
    $statusCode = 0
    try {
        $resp = $req.GetResponse()
        $statusCode = [int]$resp.StatusCode
        $resp.Close()
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
    }

    # Decision: Width < Height (ratio < 1.0) or HTTP 200 => 9:16 Vertical Short
    # Width >= Height (ratio >= 1.0) or HTTP 303 => 16:9 Landscape Video
    $isVertical = $false
    if ($ratio -gt 0) {
        $isVertical = ($ratio -lt 1.0)
    } elseif ($statusCode -eq 200) {
        $isVertical = $true
    }

    $formatStr = if ($isVertical) { "9:16 Vertical Short" } else { "16:9 Landscape Video" }
    $typeStr = if ($isVertical) { "short" } else { "video" }

    Write-Host "[AspectRatio] Result: $formatStr (Dims: ${width}x${height}, Ratio: $([math]::Round($ratio, 3)), Shorts HTTP: $statusCode)"
    return [PSCustomObject]@{
        IsVertical = $isVertical
        AspectRatio = $ratio
        Width = $width
        Height = $height
        ShortsStatusCode = $statusCode
        Format = $formatStr
        Type = $typeStr
    }
}

function Build-AutoShortThumbnail($id, $title, $framePath, $outPath) {
    Write-Host "[Thumbnail] Rendering 9:16 vertical thumbnail for Short ($id)..."
    $bmp = New-Object System.Drawing.Bitmap 1080, 1920
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background
    $rect = New-Object System.Drawing.Rectangle 0, 0, 1080, 1920
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Draw frame in center
    if (Test-Path $framePath) {
        $src = [System.Drawing.Image]::FromFile($framePath)
        $cropRect = New-Object System.Drawing.Rectangle 426, 0, 428, 720
        $destRect = New-Object System.Drawing.Rectangle 0, 0, 1080, 1920
        $g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
        $src.Dispose()
    }

    # Top dark gradient overlay for text readability
    $topSolidRect = New-Object System.Drawing.Rectangle 0, 0, 1080, 480
    $topSolidBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 10, 15, 25))
    $g.FillRectangle($topSolidBrush, $topSolidRect)
    $topSolidBrush.Dispose()

    $topFadeRect = New-Object System.Drawing.Rectangle 0, 480, 1080, 200
    $topFadeBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        $topFadeRect,
        [System.Drawing.Color]::FromArgb(240, 10, 15, 25),
        [System.Drawing.Color]::FromArgb(0, 10, 15, 25),
        90.0
    )
    $g.FillRectangle($topFadeBrush, $topFadeRect)
    $topFadeBrush.Dispose()

    $fontBadge = New-Object System.Drawing.Font ("Arial", [float]24, [System.Drawing.FontStyle]::Bold)
    $fontHero = New-Object System.Drawing.Font ("Impact", [float]76, [System.Drawing.FontStyle]::Regular)
    $fontSub = New-Object System.Drawing.Font ("Arial", [float]30, [System.Drawing.FontStyle]::Bold)

    # Top Pill Badge
    $badgeText = "NEW RELEASE"
    $bSize = $g.MeasureString($badgeText, $fontBadge)
    $bWidth = [int]($bSize.Width + 40)
    $bRect = New-Object System.Drawing.Rectangle 80, 180, $bWidth, 60
    $bBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 38, 38))
    $g.FillRectangle($bBrush, $bRect)
    $bBrush.Dispose()

    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString($badgeText, $fontBadge, $whiteBrush, [float]100, [float]192)

    # Clean title for thumbnail display
    $displayTitle = ($title -replace "#Shorts", "" -replace "\|.*", "").Trim()
    $words = $displayTitle.Split(" ")
    $mid = [int]($words.Count / 2)
    $line1 = ($words[0..($mid - 1)] -join " ").ToUpper()
    $line2 = ($words[$mid..($words.Count - 1)] -join " ").ToUpper()
    if (-not $line2) { $line2 = "EXCLUSIVE REPORT" }

    $shBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 0, 0, 0))
    $yellowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 240, 138))
    $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 226, 226))

    $g.DrawString($line1, $fontHero, $shBrush, [float]84, [float]264)
    $g.DrawString($line1, $fontHero, $yellowBrush, [float]80, [float]260)

    $g.DrawString($line2, $fontHero, $shBrush, [float]84, [float]364)
    $g.DrawString($line2, $fontHero, $whiteBrush, [float]80, [float]360)

    $g.DrawString("Soundriya Rathore | Official", $fontSub, $shBrush, [float]82, [float]472)
    $g.DrawString("Soundriya Rathore | Official", $fontSub, $subBrush, [float]80, [float]470)

    $shBrush.Dispose()
    $whiteBrush.Dispose()
    $yellowBrush.Dispose()
    $subBrush.Dispose()

    # Save as high-quality JPEG under 2MB
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
    $bmp.Save($outPath, $jpegCodec, $encoderParams)

    $g.Dispose()
    $bmp.Dispose()
    Write-Host "[Thumbnail] Saved 9:16 thumbnail to: $outPath"
}

function Build-AutoVideoThumbnail($id, $title, $framePath, $outPath) {
    Write-Host "[Thumbnail] Rendering 16:9 landscape thumbnail for Normal Video ($id)..."
    $bmp = New-Object System.Drawing.Bitmap 1280, 720
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Dark studio background
    $rect = New-Object System.Drawing.Rectangle 0, 0, 1280, 720
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 15, 30))
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    if (Test-Path $framePath) {
        $src = [System.Drawing.Image]::FromFile($framePath)
        $g.DrawImage($src, 0, 0, 1280, 720)
        $src.Dispose()
    }

    # Left-side dark gradient overlay
    $ovRect = New-Object System.Drawing.Rectangle 0, 0, 800, 720
    $ovBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        $ovRect,
        [System.Drawing.Color]::FromArgb(240, 10, 15, 30),
        [System.Drawing.Color]::FromArgb(0, 10, 15, 30),
        0.0
    )
    $g.FillRectangle($ovBrush, $ovRect)
    $ovBrush.Dispose()

    $fontBadge = New-Object System.Drawing.Font ("Arial", [float]15, [System.Drawing.FontStyle]::Bold)
    $fontHero = New-Object System.Drawing.Font ("Impact", [float]54, [System.Drawing.FontStyle]::Regular)
    $fontSub = New-Object System.Drawing.Font ("Arial", [float]22, [System.Drawing.FontStyle]::Bold)

    # Top Pill Badge
    $badgeText = "FEATURED BROADCAST"
    $bSize = $g.MeasureString($badgeText, $fontBadge)
    $bRect = New-Object System.Drawing.Rectangle 70, 80, [int]($bSize.Width + 40), 40
    $bBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(37, 99, 235))
    $g.FillRectangle($bBrush, $bRect)
    $bBrush.Dispose()
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString($badgeText, $fontBadge, $whiteBrush, [float]90, [float]88)

    $cleanTitle = ($title -replace "\|.*", "").Trim().ToUpper()
    $shBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 0, 0, 0))
    $yellowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 240, 138))

    $g.DrawString($cleanTitle, $fontHero, $shBrush, [float]74, [float]154)
    $g.DrawString($cleanTitle, $fontHero, $yellowBrush, [float]70, [float]150)

    $g.DrawString("Soundriya Rathore | Television Journalist & Host", $fontSub, $shBrush, [float]72, [float]242)
    $g.DrawString("Soundriya Rathore | Television Journalist & Host", $fontSub, $whiteBrush, [float]70, [float]240)

    $shBrush.Dispose()
    $whiteBrush.Dispose()
    $yellowBrush.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "[Thumbnail] Saved 16:9 thumbnail to: $outPath"
}

function Check-And-Process-NewVideos {
    Write-Host "`n[Watcher] $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Checking for new uploads on @soundriya.rathore..."
    
    $token = Get-ValidAccessToken
    $headers = @{ Authorization = "Bearer $token" }

    $chUri = "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true"
    $ch = Invoke-RestMethod -Uri $chUri -Headers $headers
    $uploadsId = $ch.items[0].contentDetails.relatedPlaylists.uploads

    $plUri = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails,snippet&playlistId=$uploadsId&maxResults=20"
    $pl = Invoke-RestMethod -Uri $plUri -Headers $headers

    $registry = Load-ProcessedRegistry
    $newCount = 0

    foreach ($item in $pl.items) {
        $vId = $item.contentDetails.videoId
        $vTitle = $item.snippet.title

        $isProcessed = $false
        if ($registry.videos -and $registry.videos.$vId) {
            $isProcessed = $registry.videos.$vId.processed
        }

        if (-not $isProcessed) {
            Write-Host "`n========================================================"
            Write-Host "[Watcher] NEW UNPROCESSED VIDEO DETECTED!" -ForegroundColor Cyan
            Write-Host "Video ID: $vId"
            Write-Host "Raw Title: $vTitle"
            Write-Host "========================================================"

            # Fetch complete video details
            $vUri = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=$vId"
            $vDetails = Invoke-RestMethod -Uri $vUri -Headers $headers
            if (-not $vDetails.items) { continue }

            $detail = $vDetails.items[0]
            $durationSec = Parse-IsoDuration $detail.contentDetails.duration
            $classification = Get-VideoAspectRatioClassification -VideoId $vId
            $isShort = $classification.IsVertical
            $typeStr = $classification.Type

            Write-Host "[Watcher] Video Duration: $durationSec seconds | Aspect: $($classification.Format)"

            # 1. Optimize Title
            $optimizedTitle = $vTitle
            if ($isShort -and (-not ($optimizedTitle.Contains("#Shorts")))) {
                $optimizedTitle = "$optimizedTitle #Shorts"
            }

            # 2. Optimize Description with Official Links
            $originalDesc = $detail.snippet.description
            $socialsBlock = @"

Official Website & Media Portfolio:
Website: https://soundriyarathore.vercel.app/

Connect on Social Media:
Journalism & Stage Hosting Instagram: https://www.instagram.com/no_but.seriously/
Personal Instagram: https://www.instagram.com/Soundriya_rathore/
LinkedIn: https://www.linkedin.com/in/soundriya-rathore-060988316/
YouTube: https://www.youtube.com/@soundriya.rathore
Email: soundriyarathore221@gmail.com
"@

            $optimizedDesc = $originalDesc
            if (-not ($optimizedDesc.Contains("soundriyarathore.vercel.app"))) {
                $optimizedDesc = "$optimizedDesc`n`n$socialsBlock"
            }

            # 3. Optimize Tags
            $tags = $detail.snippet.tags
            if (-not $tags -or $tags.Count -eq 0) {
                $tags = @("Soundriya Rathore", "Indian Journalist", "Media Host", "News Anchor")
                if ($isShort) { $tags += @("Shorts", "YouTube Shorts") }
            }

            # Update Metadata via YouTube API
            Write-Host "[Watcher] Updating metadata for $vId..."
            Update-YouTubeVideoMetadata -Id $vId -NewTitle $optimizedTitle -NewDescription $optimizedDesc -NewTags $tags

            # 4. Download Frame & Generate Thumbnail
            $frameFile = Join-Path $FramesDir "$vId.jpg"
            $maxresUrl = "https://img.youtube.com/vi/$vId/maxresdefault.jpg"
            curl.exe -s -L $maxresUrl -o $frameFile
            $fItem = Get-Item $frameFile
            if ($fItem.Length -lt 2000) {
                $hqUrl = "https://img.youtube.com/vi/$vId/hqdefault.jpg"
                curl.exe -s -L $hqUrl -o $frameFile
            }

            $thumbFile = $null
            if ($isShort) {
                # 9:16 Vertical Thumbnail for Shorts
                $thumbFile = Join-Path $ThumbnailsDir "$($vId)_vertical.jpg"
                Build-AutoShortThumbnail -id $vId -title $optimizedTitle -framePath $frameFile -outPath $thumbFile
            } else {
                # 16:9 Landscape Thumbnail for Normal Videos
                $thumbFile = Join-Path $ThumbnailsDir "$($vId).png"
                Build-AutoVideoThumbnail -id $vId -title $optimizedTitle -framePath $frameFile -outPath $thumbFile
            }

            # 5. Upload Custom Thumbnail to YouTube
            if (Test-Path $thumbFile) {
                Write-Host "[Watcher] Uploading generated thumbnail ($thumbFile) to YouTube..."
                Set-YouTubeThumbnailImage -Id $vId -File $thumbFile
                Write-Host "[Watcher] SUCCESS: Thumbnail updated for $vId!" -ForegroundColor Green
            }

            # 6. Mark as processed
            $registry.videos | Add-Member -NotePropertyName $vId -NotePropertyValue @{
                type = $typeStr
                title = $optimizedTitle
                processed = $true
                processed_at = (Get-Date).ToUniversalTime().ToString("o")
            } -Force
            Save-ProcessedRegistry $registry
            $newCount++
        }
    }

    if ($newCount -eq 0) {
        Write-Host "[Watcher] All videos are up to date. No new uploads detected."
    } else {
        Write-Host "[Watcher] Successfully processed and optimized $newCount new video(s)!" -ForegroundColor Green
    }
}

# Execution Entry Point
if ($Once) {
    Check-And-Process-NewVideos
} else {
    Write-Host "=========================================================="
    Write-Host "YouTube Automatic Channel Watcher Active"
    Write-Host "Monitoring @soundriya.rathore every $IntervalMinutes minutes..."
    Write-Host "Press Ctrl+C to terminate."
    Write-Host "=========================================================="

    while ($true) {
        try {
            Check-And-Process-NewVideos
        } catch {
            Write-Host "[Watcher Error] $($_.Exception.Message)" -ForegroundColor Red
        }
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
}
