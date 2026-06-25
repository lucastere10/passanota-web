# Point the Cloud Run managed deploy trigger at cloudbuild.managed.yaml
# (passes trigger substitutions as docker --build-arg)
# Usage: .\scripts\patch-cloud-run-trigger.ps1

param(
    [string]$Project = "caldas-projects-dev",
    [string]$TriggerName = "rmgpgab-passanota-web-us-central1-lucastere10-passanota-web-rqi"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

gcloud config set project $Project

Write-Host "Updating trigger $TriggerName to use cloudbuild.managed.yaml..."
gcloud builds triggers update github $TriggerName `
    --project=$Project `
    --region=global `
    --build-config="$Root/cloudbuild.managed.yaml"

Write-Host ""
Write-Host "Done. Next push to develop will pass _SUPABASE_URL etc. as docker build-args."
Write-Host "Confirm substitutions: gcloud builds triggers describe $TriggerName --project=$Project --format='yaml(substitutions)'"
