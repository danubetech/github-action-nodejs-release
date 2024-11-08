#!/bin/sh

# entrypoint.sh

# Configure git to handle GitHub Actions workspace
git config --global --add safe.directory /github/workspace

# Configure git user for commits
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git config --global user.name "github-actions[bot]"

# Execute the main Node.js script
node /app/src/index.js