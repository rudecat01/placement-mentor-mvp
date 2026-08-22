# Safe Team Synchronization Script for Placement Mentor 2.0
# Usage: .\sync-from-main.ps1

Write-Host "🔄 Fetching latest updates from origin..." -ForegroundColor Cyan
git fetch origin

$currentBranch = (git branch --show-current).Trim()
Write-Host "📌 Current working branch: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -eq "main") {
    Write-Host "⚠️ You are on 'main'. Pulling origin/main..." -ForegroundColor Green
    git pull origin main
} else {
    Write-Host "🔀 Merging origin/main into '$currentBranch' to stay conflict-free..." -ForegroundColor Green
    git merge origin/main --no-edit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Merge conflict detected! Please review conflicted files." -ForegroundColor Red
    } else {
        Write-Host "✅ Branch '$currentBranch' is successfully synchronized with origin/main!" -ForegroundColor Green
    }
}
