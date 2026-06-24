# Create Cloud Build GitHub triggers for passanota-web
# Usage: .\scripts\setup-cloud-build-trigger.ps1 -GitHubOwner OWNER -GitHubRepo passanota-web

param(
    [string]$Project = "caldas-projects-dev",
    [string]$Region = "us-central1",
    [Parameter(Mandatory = $true)]
    [string]$GitHubOwner,
    [Parameter(Mandatory = $true)]
    [string]$GitHubRepo,
    [string]$Branch = "main",
    [string]$PassanotaApiUrl = "",
    [string]$SupabaseUrl = "",
    [string]$AppUrl = ""
)

$ErrorActionPreference = "Stop"

gcloud config set project $Project

$MainSubstitutions = @(
    "_TAG=`$SHORT_SHA",
    "_PASSANOTA_API_URL=$PassanotaApiUrl",
    "_SUPABASE_URL=$SupabaseUrl",
    "_APP_URL=$AppUrl"
) -join ","

Write-Host "Manual trigger creation:"
Write-Host @"
gcloud builds triggers create github --name=passanota-web-main --region=$Region \\
  --repo-name=$GitHubRepo --repo-owner=$GitHubOwner \\
  --branch-pattern=^${Branch}$$ --build-config=cloudbuild.yaml \\
  --substitutions=$MainSubstitutions

gcloud builds triggers create github --name=passanota-web-pr --region=$Region \\
  --repo-name=$GitHubRepo --repo-owner=$GitHubOwner \\
  --pull-request-pattern=^${Branch}$$ --build-config=cloudbuild.pr.yaml
"@

Write-Host ""
Write-Host "Ensure secret PASSANOTA_SUPABASE_PUBLISHABLE_KEY exists in Secret Manager."
Write-Host "Grant Cloud Build SA roles/secretmanager.secretAccessor on that secret."
