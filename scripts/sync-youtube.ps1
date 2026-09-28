# Soundriya Rathore - Local YouTube Auto-Sync Script (PowerShell)
# Double-click sync-youtube.bat or run this script to update videos!

$ChannelId = "UCm3C__y6F_KLPH-D-5Rc4jQ"
$RssUrl = "https://www.youtube.com/feeds/videos.xml?channel_id=$ChannelId"

Write-Host "Fetching latest uploads from Soundriya Rathore YouTube channel..." -ForegroundColor Cyan

$xmlText = curl.exe -s $RssUrl
if (-not $xmlText -or $xmlText.Length -lt 200) {
    Write-Host "Error: Could not retrieve YouTube RSS feed." -ForegroundColor Red
    exit 1
}

$entryMatches = [regex]::Matches($xmlText, '(?s)<entry>(.*?)</entry>')
Write-Host "Found $($entryMatches.Count) entries on YouTube." -ForegroundColor Green

$featured = @()
$shorts = @()

foreach ($m in $entryMatches) {
    $chunk = $m.Groups[1].Value
    $id = if ($chunk -match '<yt:videoId>([^<]+)</yt:videoId>') { $matches[1] } else { '' }
    $title = if ($chunk -match '<title>([^<]+)</title>') { $matches[1] } else { '' }
    $link = if ($chunk -match '<link[^>]+href=\"([^\"]+)\"') { $matches[1] } else { '' }
    
    if (-not $id -or -not $title) { continue }
    
    $cleanTitle = $title -replace '\s*\|\|\s*Soundriya Rathore\s*\|\|', '' -replace '\s*-\s*Soundriya Rathore', '' -replace '\s*\.$', ''
    $cleanTitle = $cleanTitle.Trim()
    if (-not $cleanTitle) { $cleanTitle = $title }
    
    $isShort = $link -like '*shorts*'
    
    if ($isShort) {
        $shorts += [PSCustomObject]@{ Id = $id; Title = $cleanTitle }
    } elseif ($id -ne 'E0j9MgTL14U') { # Exclude main showreel
        $featured += [PSCustomObject]@{ Id = $id; Title = $cleanTitle }
    }
}

# Update js/config.js
$configPath = Join-Path $PSScriptRoot "..\js\config.js"
if (Test-Path $configPath) {
    $configText = Get-Content $configPath -Raw -Encoding utf8
    
    $featuredList = @()
    foreach ($v in ($featured | Select-Object -First 8)) {
        $lower = $v.Title.ToLower()
        $badge = "Special Coverage"
        $category = "Broadcast Journalism"
        if ($lower -like "*documentary*") { $badge = "Documentary"; $category = "Documentary Production" }
        elseif ($lower -like "*anchoring*" -or $lower -like "*studio*") { $badge = "Anchoring"; $category = "News Studio Desk" }
        elseif ($lower -like "*bulletin*" -or $lower -like "*news*") { $badge = "Bulletin"; $category = "Broadcast Journalism" }
        elseif ($lower -like "*reporting*" -or $lower -like "*camera*" -or $lower -like "*ground*" -or $lower -like "*protest*") { $badge = "Field Reporting"; $category = "Field Journalism" }
        elseif ($lower -like "*talk show*" -or $lower -like "*interview*") { $badge = "Talk Show"; $category = "Moderation & Panel" }
        elseif ($lower -like "*podcast*") { $badge = "Podcast"; $category = "Dialogue & Audio-Visual" }
        
        $item = @"
    {
      youtubeId: "$($v.Id)",
      title: "$($v.Title.Replace('"', '\"'))",
      category: "$category",
      badge: "$badge"
    }
"@
        $featuredList += $item
    }
    
    $shortsList = @()
    foreach ($s in ($shorts | Select-Object -First 6)) {
        $lower = $s.Title.ToLower()
        $label = "Live Stage Event"
        if ($lower -like "*holi*" -or $lower -like "*festival*") { $label = "Cultural Festival" }
        elseif ($lower -like "*comedy*" -or $lower -like "*stand*") { $label = "Comedy & Entertainment" }
        elseif ($lower -like "*alumni*" -or $lower -like "*gala*") { $label = "Institutional Gala" }
        elseif ($lower -like "*digital*" -or $lower -like "*news*" -or $lower -like "*reel*") { $label = "Digital News Desk" }
        
        $item = @"
    {
      youtubeId: "$($s.Id)",
      title: "$($s.Title.Replace('"', '\"'))",
      label: "$label"
    }
"@
        $shortsList += $item
    }
    
    $featuredBlock = "featuredVideos: [`n" + ($featuredList -join ",`n") + "`n  ]"
    $shortsBlock = "shorts: [`n" + ($shortsList -join ",`n") + "`n  ]"
    
    $configText = [regex]::Replace($configText, 'featuredVideos:\s*\[[\s\S]*?\n\s*\]', $featuredBlock)
    $configText = [regex]::Replace($configText, 'shorts:\s*\[[\s\S]*?\n\s*\]', $shortsBlock)
    
    Set-Content -Path $configPath -Value $configText -Encoding utf8
    Write-Host "Updated js/config.js successfully!" -ForegroundColor Green
}

# Update sitemap.xml
$sitemapPath = Join-Path $PSScriptRoot "..\sitemap.xml"
if (Test-Path $sitemapPath) {
    $sitemapText = Get-Content $sitemapPath -Raw -Encoding utf8
    $today = (Get-Date).ToString("yyyy-MM-dd")
    $sitemapText = [regex]::Replace($sitemapText, '<lastmod>[^<]+<\/lastmod>', "<lastmod>$today</lastmod>")
    Set-Content -Path $sitemapPath -Value $sitemapText -Encoding utf8
    Write-Host "Updated sitemap.xml with lastmod $today!" -ForegroundColor Green
}

Write-Host "All files synchronized with latest YouTube uploads!" -ForegroundColor Cyan
