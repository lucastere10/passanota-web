#!/usr/bin/env bash
# Create Cloud Build GitHub triggers for passanota-web
# Usage: ./scripts/setup-cloud-build-trigger.sh OWNER REPO [project] [region]

set -euo pipefail

OWNER="${1:?GitHub owner required}"
REPO="${2:?GitHub repo required}"
PROJECT="${3:-caldas-projects-dev}"
REGION="${4:-us-central1}"
BRANCH="${BRANCH:-main}"

gcloud config set project "$PROJECT"

echo "Main (deploy on push to $BRANCH):"
echo "  build-config: cloudbuild.yaml"
echo "  substitutions: _TAG=\$SHORT_SHA,_PASSANOTA_API_URL=...,_SUPABASE_URL=...,_APP_URL=..."
echo ""
echo "PR (quality checks):"
echo "  build-config: cloudbuild.pr.yaml"
echo ""
echo "Ensure secret PASSANOTA_SUPABASE_PUBLISHABLE_KEY exists in Secret Manager."
cat <<EOF
gcloud builds triggers create github \\
  --name=passanota-web-main \\
  --repo-name=$REPO \\
  --repo-owner=$OWNER \\
  --branch-pattern=^${BRANCH}\$ \\
  --build-config=cloudbuild.yaml \\
  --substitutions=_TAG=\$SHORT_SHA

gcloud builds triggers create github \\
  --name=passanota-web-pr \\
  --repo-name=$REPO \\
  --repo-owner=$OWNER \\
  --pull-request-pattern=^${BRANCH}\$ \\
  --build-config=cloudbuild.pr.yaml
EOF
