# Universal Safe Merge & Push Script for Placement Mentor 2.0
# Usage: .\push-to-main.ps1

Write-Host "🧪 Running Python Test Suites..." -ForegroundColor Cyan

# Run engine tests
python -m unittest discover -s server/tests -p "test_*.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Aborting push to main to protect repo stability." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All tests passed! Fetching latest origin..." -ForegroundColor Green
git fetch origin

$currentBranch = (git branch --show-current).Trim()

Write-Host "🔄 Merging origin/main into '$currentBranch' to ensure zero conflicts..." -ForegroundColor Cyan
git merge origin/main --no-edit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Conflict detected while merging main into $currentBranch. Please resolve conflicts first." -ForegroundColor Red
    exit 1
}

Write-Host "🔀 Switching to main and merging '$currentBranch'..." -ForegroundColor Cyan
git checkout main
git pull origin main
git merge $currentBranch --no-edit

if ($LASTEXITCODE -eq 0) {
    Write-Host "🚀 Pushing updated main to origin/main..." -ForegroundColor Green
    git push origin main
    Write-Host "✅ Successfully pushed $currentBranch updates to main!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to merge $currentBranch into main." -ForegroundColor Red
}

Write-Host "↩️ Switching back to $currentBranch branch..." -ForegroundColor Cyan
git checkout $currentBranch
Write-Host "📌 You are now back on branch: $currentBranch" -ForegroundColor Yellow
