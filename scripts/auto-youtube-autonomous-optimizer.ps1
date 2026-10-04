# YouTube Autonomous Channel Optimizer & 15-Minute Performance Watcher
# Fully autonomous daemon:
# 1. Analyzes performance analytics (views, views/hour, likes, comments, velocity) every 15 minutes.
# 2. Checks SEO completeness across all videos (titles, descriptions, manager contact, socials, tags).
# 3. Detects newly uploaded videos/shorts, classifies aspect ratio (9:16 vs 16:9), generates thumbnails, and optimizes metadata immediately.
# 4. Updates underperforming videos with stronger search hooks, full description blocks, and optimized tags.
# 5. Automatically inserts new videos into index.html and pushes to GitHub/Vercel.
# 6. Logs performance snapshots to track view growth over time.

[CmdletBinding()]
param(
    [switch]$Once,
    [int]$IntervalMinutes = 15
)

$ErrorActionPreference = "Continue"

Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ManagerScript = Join-Path $ScriptDir "youtube-manager.ps1"
$WatcherScript = Join-Path $ScriptDir "auto-youtube-watcher.ps1"
$ProcessedFile = Join-Path $ScriptDir "processed_videos.json"
$PerformanceLogFile = Join-Path $ScriptDir "youtube_performance_log.json"
$HistoryLogFile = Join-Path $ScriptDir "optimizer_history.log"
$IndexPath = "c:\Users\adity\Desktop\Soundriya Rathore\index.html"
$ThumbnailsDir = "c:\Users\adity\Desktop\Soundriya Rathore\assets\thumbnails\generated"
$FramesDir = "c:\Users\adity\Desktop\Soundriya Rathore\assets\thumbnails\watcher_frames"

if (-not (Test-Path $ThumbnailsDir)) { New-Item -ItemType Directory -Path $ThumbnailsDir -Force | Out-Null }
if (-not (Test-Path $FramesDir)) { New-Item -ItemType Directory -Path $FramesDir -Force | Out-Null }

. $ManagerScript

function Write-OptimizerLog([string]$msg, [string]$color = "White") {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logLine = "[$timestamp] $msg"
    Write-Host $logLine -ForegroundColor $color
    Add-Content -Path $HistoryLogFile -Value $logLine -ErrorAction SilentlyContinue
}

function Load-PerformanceLog {
    $dict = @{}
    if (Test-Path $PerformanceLogFile) {
        try {
            $raw = Get-Content -Raw $PerformanceLogFile | ConvertFrom-Json
            if ($raw.history) {
                foreach ($prop in $raw.history.PSObject.Properties) {
                    $dict[$prop.Name] = $prop.Value
                }
            }
        } catch {}
    }
    return $dict
}

function Save-PerformanceLog($historyDict) {
    $outObj = [ordered]@{
        last_checked = (Get-Date).ToUniversalTime().ToString("o")
        history = $historyDict
    }
    $outObj | ConvertTo-Json -Depth 6 | Set-Content -Path $PerformanceLogFile -Encoding UTF8
}

function Load-Registry {
    if (Test-Path $ProcessedFile) {
        try {
            return (Get-Content -Raw $ProcessedFile | ConvertFrom-Json)
        } catch {}
    }
    return [PSCustomObject]@{
        processed_at = (Get-Date).ToUniversalTime().ToString("o")
        videos = [ordered]@{}
    }
}

function Save-Registry($reg) {
    $reg.processed_at = (Get-Date).ToUniversalTime().ToString("o")
    $reg | ConvertTo-Json -Depth 5 | Set-Content -Path $ProcessedFile -Encoding UTF8
}

function Get-VideoClassification([string]$VideoId) {
    $frame0Url = "https://i.ytimg.com/vi/$VideoId/frame0.jpg"
    $testFramePath = Join-Path $FramesDir "${VideoId}_aspect_detect.jpg"
    curl.exe -s -L $frame0Url -o $testFramePath

    $ratio = 0.0
    if (Test-Path $testFramePath) {
        $fItem = Get-Item $testFramePath
        if ($fItem.Length -gt 1000) {
            try {
                $img = [System.Drawing.Image]::FromFile($testFramePath)
                if ($img.Height -gt 0) {
                    $ratio = [double]$img.Width / [double]$img.Height
                }
                $img.Dispose()
            } catch {}
        }
    }

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

    $isVertical = $false
    if ($ratio -gt 0) {
        $isVertical = ($ratio -lt 1.0)
    } elseif ($statusCode -eq 200) {
        $isVertical = $true
    }

    return [PSCustomObject]@{
        IsVertical = $isVertical
        Type = if ($isVertical) { "short" } else { "video" }
    }
}

function Build-CompleteDescription([string]$existingNarrative, [string[]]$extraHashtags = @()) {
    $cleanNarrative = $existingNarrative
    $splitMarkers = @(
        "Official Website & Media Portfolio:",
        "Official Website & Portfolio:",
        "Official Website:",
        "Direct Bookings & Management:",
        "Manager (WhatsApp & Calls):",
        "Manager / WhatsApp:",
        "Connect on Social Media & Official Channels:",
        "Connect on Social Media:",
        "Follow & Connect Across Platforms:",
        "https://soundriyarathore.vercel.app/"
    )
    foreach ($m in $splitMarkers) {
        if ($cleanNarrative.Contains($m)) {
            $parts = $cleanNarrative.Split(@($m), [System.StringSplitOptions]::None)
            $cleanNarrative = $parts[0].Trim()
        }
    }
    $cleanNarrative = ($cleanNarrative -replace "(?m)^#\S+\s*", "").Trim()
    if ([string]::IsNullOrWhiteSpace($cleanNarrative)) {
        $cleanNarrative = "Television Journalist, News Anchor, and Live Event Host Soundriya Rathore."
    }

    $allHashtags = @("#SoundriyaRathore") + $extraHashtags
    $uniqueHashtags = ($allHashtags | Select-Object -Unique) -join " "

    $standardBlock = @"
$cleanNarrative

Official Website & Media Portfolio:
https://soundriyarathore.vercel.app/

Connect on Social Media & Official Channels:
Journalism, Anchoring & Stage Hosting Instagram: https://www.instagram.com/no_but.seriously/
Personal Instagram: https://www.instagram.com/Soundriya_rathore/
LinkedIn: https://www.linkedin.com/in/soundriya-rathore-060988316/
YouTube Channel: https://www.youtube.com/@soundriya.rathore
Email: soundriyarathore221@gmail.com

$uniqueHashtags
"@
    return $standardBlock.Trim()
}

function Add-VideoToWebsite([string]$VideoId, [string]$Title, [bool]$IsShort) {
    if (-not (Test-Path $IndexPath)) { return }
    $html = Get-Content -Raw -Path $IndexPath -Encoding UTF8

    if ($html.Contains($VideoId)) {
        Write-OptimizerLog "Video $VideoId already embedded in index.html." "Gray"
        return
    }

    if ($IsShort) {
        $cleanTitle = ($Title -replace "#Shorts", "").Trim()
        $snippet = @"

              <!-- Short: $cleanTitle -->
              <article class="short-card">
                <div class="short-media-9x16">
                  <iframe 
                    src="https://www.youtube-nocookie.com/embed/${VideoId}?rel=0&amp;playsinline=1" 
                    title="$cleanTitle - Soundriya Rathore" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen 
                    loading="lazy">
                  </iframe>
                </div>
                <div class="short-info">
                  <span class="short-label">Featured Short</span>
                  <h4 class="short-name">$cleanTitle</h4>
                </div>
              </article>
"@
        $target = '<div class="shorts-grid" id="shorts-grid-container">'
        if ($html.Contains($target)) {
            $html = $html.Replace($target, "$target$snippet")
            $html | Set-Content -Path $IndexPath -Encoding UTF8
            Write-OptimizerLog "Inserted new short $VideoId into index.html shorts grid." "Green"

            # Push to GitHub
            try {
                & "$ScriptDir\push-github.ps1" -FilePath $IndexPath -RepoPath "index.html" -CommitMessage "Auto-embed new short $VideoId into portfolio"
                Write-OptimizerLog "Pushed updated index.html to GitHub." "Green"
            } catch {
                Write-OptimizerLog "Failed to push index.html: $($_.Exception.Message)" "Red"
            }
        }
    }
}

function Optimize-AllVideosPerformance {
    Write-OptimizerLog "Starting 15-minute channel performance and SEO analysis..." "Cyan"
    
    $token = Get-ValidAccessToken
    $headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }

    $chUri = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true"
    $chRes = Invoke-RestMethod -Uri $chUri -Headers $headers
    if (-not $chRes.items) {
        Write-OptimizerLog "Failed to retrieve channel data." "Red"
        return
    }
    $ch = $chRes.items[0]
    $uploadsId = $ch.contentDetails.relatedPlaylists.uploads
    Write-OptimizerLog "Channel: $($ch.snippet.title) | Subs: $($ch.statistics.subscriberCount) | Views: $($ch.statistics.viewCount) | Videos: $($ch.statistics.videoCount)" "Green"

    $plUri = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=$uploadsId&maxResults=50"
    $plRes = Invoke-RestMethod -Uri $plUri -Headers $headers
    $videoIds = ($plRes.items | ForEach-Object { $_.contentDetails.videoId }) -join ","

    $vUri = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=$videoIds"
    $vRes = Invoke-RestMethod -Uri $vUri -Headers $headers

    $registry = Load-Registry
    $perfDict = Load-PerformanceLog
    $now = (Get-Date).ToUniversalTime()
    $updatesMade = 0

    foreach ($v in $vRes.items) {
        $id = $v.id
        $title = $v.snippet.title
        $desc = $v.snippet.description
        $tags = if ($v.snippet.tags) { @($v.snippet.tags) } else { @() }
        $views = [int]($v.statistics.viewCount)
        $likes = [int]($v.statistics.likeCount)
        $comments = [int]($v.statistics.commentCount)
        $pub = [DateTime]::Parse($v.snippet.publishedAt).ToUniversalTime()
        $ageHours = [Math]::Max(0.5, ($now - $pub).TotalHours)
        $vph = [Math]::Round(($views / $ageHours), 2)

        $prevViews = $views
        if ($perfDict.ContainsKey($id)) {
            $prevViews = [int]($perfDict[$id].latest_views)
        }
        $deltaViews = $views - $prevViews

        # Detect if brand new video
        $isBrandNew = $false
        if (-not ($registry.videos -and $registry.videos.$id)) {
            $isBrandNew = $true
            Write-OptimizerLog "BRAND NEW VIDEO DETECTED: $id ($title)" "Cyan"
        }

        # Determine video aspect ratio & classification
        $isShort = $false
        if ($registry.videos -and $registry.videos.$id) {
            $isShort = ($registry.videos.$id.type -eq "short")
        } else {
            $class = Get-VideoClassification -VideoId $id
            $isShort = $class.IsVertical
        }

        # Check SEO completeness
        $needsDescUpdate = $false
        $needsTagUpdate = $false
        $needsTitleUpdate = $false

        if ($desc -match "95718 59038" -or $desc -match "Direct Bookings & Management:") { $needsDescUpdate = $true }
        if (-not ($desc -match "soundriyarathore.vercel.app")) { $needsDescUpdate = $true }
        if (-not ($desc -match "no_but.seriously") -or -not ($desc -match "Soundriya_rathore")) { $needsDescUpdate = $true }
        if ($tags.Count -lt 10) { $needsTagUpdate = $true }
        if ($isShort -and (-not ($title -match "#Shorts"))) { $needsTitleUpdate = $true }

        $newTitle = $title
        if ($isShort -and (-not ($newTitle -match "#Shorts"))) {
            $newTitle = "$newTitle #Shorts"
            $needsTitleUpdate = $true
        }

        # Apply updates if needed
        if ($needsDescUpdate -or $needsTagUpdate -or $needsTitleUpdate -or $isBrandNew) {
            Write-OptimizerLog "Optimizing Video: $id (Views: $views, Delta: +$deltaViews)..." "Yellow"

            $enrichedTags = @($tags)
            $defaultTags = @("Soundriya Rathore", "Indian Journalist", "TV News Anchor", "Live Event Host", "Emcee India", "Stage Presenter")
            foreach ($dt in $defaultTags) {
                if (-not ($enrichedTags -contains $dt)) { $enrichedTags += $dt }
            }
            if ($isShort) {
                if (-not ($enrichedTags -contains "Shorts")) { $enrichedTags += "Shorts" }
                if (-not ($enrichedTags -contains "YouTube Shorts")) { $enrichedTags += "YouTube Shorts" }
            }

            $topicHashtags = @("#SoundriyaRathore", "#Journalism", "#NewsAnchor", "#MediaHost")
            if ($isShort) { $topicHashtags += @("#Shorts", "#ShortsFeed") }
            if ($title -match "Protest|Police|Jantar Mantar|Women Safety") {
                $topicHashtags += @("#DelhiProtest", "#GroundReport", "#FieldReporting")
            }
            $enrichedDesc = Build-CompleteDescription -existingNarrative $desc -extraHashtags $topicHashtags

            try {
                $catId = if ($title -match "Protest|Police|News|Bulletin|Disaster|Floods") { "25" } else { "24" }
                Update-YouTubeVideoMetadata -Id $id -NewTitle $newTitle -NewDescription $enrichedDesc -NewTags $enrichedTags -NewCategoryId $catId
                Write-OptimizerLog "SUCCESS: Updated metadata on YouTube for $id" "Green"
                $updatesMade++
            } catch {
                Write-OptimizerLog "ERROR updating video $id : $($_.Exception.Message)" "Red"
            }

            # Update registry
            if (-not $registry.videos) { $registry | Add-Member -NotePropertyName "videos" -NotePropertyValue @{} -Force }
            $registry.videos | Add-Member -NotePropertyName $id -NotePropertyValue @{
                type = if ($isShort) { "short" } else { "video" }
                title = $newTitle
                processed = $true
                processed_at = (Get-Date).ToUniversalTime().ToString("o")
            } -Force
            Save-Registry $registry

            # If brand new, embed on website and push
            if ($isBrandNew) {
                Add-VideoToWebsite -VideoId $id -Title $newTitle -IsShort $isShort
            }
        }

        # Save to performance dictionary
        $perfDict[$id] = [ordered]@{
            title = $newTitle
            latest_views = $views
            delta_views_last_interval = $deltaViews
            views_per_hour = $vph
            likes = $likes
            comments = $comments
            last_checked = (Get-Date).ToUniversalTime().ToString("o")
        }
    }

    Save-PerformanceLog $perfDict
    Write-OptimizerLog "Cycle completed. $updatesMade video(s) updated." "Green"
}

# Main Execution Loop
if ($Once) {
    Optimize-AllVideosPerformance
} else {
    Write-OptimizerLog "YouTube Autonomous Optimizer Daemon active. Interval: $IntervalMinutes minutes." "Cyan"
    while ($true) {
        try {
            Optimize-AllVideosPerformance
        } catch {
            Write-OptimizerLog "Daemon Exception: $($_.Exception.Message)" "Red"
        }
        Write-OptimizerLog "Sleeping for $IntervalMinutes minutes until next check..." "Gray"
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
}
