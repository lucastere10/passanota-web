# One-time: store deploy config in Secret Manager (alternative to Cloud Build substitutions)
# Usage: .\scripts\setup-deploy-secrets.ps1

param(
    [string]$Project = "caldas-projects-dev",
    [string]$SupabaseUrl = "https://kdmiptpxatsobroqzjnq.supabase.co",
    [string]$AppUrl = "https://passanota-web-399951936554.us-central1.run.app",
    [string]$ApiUrl = "https://passanota-api-399951936554.us-central1.run.app"
)

$ErrorActionPreference = "Stop"
gcloud config set project $Project

function Set-SecretValue {
    param([string]$Name, [string]$Value)
    $exists = gcloud secrets describe $Name --project=$Project 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Updating secret $Name..."
        $Value | gcloud secrets versions add $Name --data-file=-
    } else {
        Write-Host "Creating secret $Name..."
        $Value | gcloud secrets create $Name --replication-policy=automatic --data-file=-
    }
}

Set-SecretValue "PASSANOTA_SUPABASE_URL" $SupabaseUrl
Set-SecretValue "PASSANOTA_APP_URL" $AppUrl
Set-SecretValue "PASSANOTA_API_URL" $ApiUrl

Write-Host ""
Write-Host "Done. Cloud Build resolves these when trigger substitutions are empty."
Write-Host "Ensure Cloud Build SA has secretAccessor on these secrets."
