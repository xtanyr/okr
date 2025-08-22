# Create a scheduled task to run the backup every Sunday at 2 AM
$action = New-ScheduledTaskAction -Execute "node" -Argument "$PSScriptRoot\backup-db.js" -WorkingDirectory $PSScriptRoot
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Register the scheduled task
$taskName = "OKR Database Backup"
$description = "Weekly backup of OKR database, running every Sunday at 2 AM"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    # Update existing task
    Set-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $description -Force
    Write-Host "Updated existing scheduled task: $taskName" -ForegroundColor Green
} else {
    # Create new task
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description $description -RunLevel Highest -Force
    Write-Host "Created new scheduled task: $taskName" -ForegroundColor Green
}

# Display task information
Write-Host "`nScheduled task details:" -ForegroundColor Cyan
Get-ScheduledTask -TaskName $taskName | Select-Object TaskName, State, TaskPath, Description | Format-List

# Test the backup script
Write-Host "`nTesting backup script..." -ForegroundColor Cyan
try {
    & "$PSScriptRoot\backup-db.js"
    Write-Host "Backup test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Backup test failed: $_" -ForegroundColor Red
}
