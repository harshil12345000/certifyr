Write-Host "Applying delete account migration..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "ERROR: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first: npm install -g supabase" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Pushing migration to Supabase..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The delete account functionality should now work." -ForegroundColor Green
    Write-Host "Test it by:" -ForegroundColor Cyan
    Write-Host "1. Going to Settings in your app" -ForegroundColor White
    Write-Host "2. Clicking 'Delete Account'" -ForegroundColor White
    Write-Host "3. Entering your password" -ForegroundColor White
    Write-Host "4. Confirming deletion" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Migration failed. Please check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "If you haven't linked your project yet, run:" -ForegroundColor Yellow
    Write-Host "supabase link --project-ref yjeeamhahyhfawwgebtd" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Press Enter to exit"
