$attempts = 0
$maxAttempts = 15
while ($attempts -lt $maxAttempts) {
    & docker info > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Output "Docker started successfully!"
        exit 0
    }
    $attempts++
    Write-Output "Waiting for Docker to start... (Attempt $attempts of $maxAttempts)"
    Start-Sleep -Seconds 5
}
Write-Error "Docker failed to start within 75 seconds."
exit 1
