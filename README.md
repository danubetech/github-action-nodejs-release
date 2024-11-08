# github-action-nodejs-release

This GitHub Action automates the release process for Node.js projects, similar to the Maven Release Plugin for Java projects.

## Features

- Automatically reads current version from package.json
- Creates and pushes Git tags
- Creates GitHub releases
- Updates package.json with the next version
- Supports semantic versioning (major, minor, patch)
- Defaults to minor version increments
- Uses built-in GitHub Actions authentication

## Authentication

This action uses the `GITHUB_TOKEN` that is automatically provided by GitHub Actions. You don't need to create or manage any Personal Access Tokens (PAT). The `GITHUB_TOKEN` is:
- Automatically created for each workflow run
- Scoped to the current repository
- Automatically expires after the workflow completes
- Requires explicit permissions configuration in your workflow

## Usage

Add the following to your GitHub workflow (e.g., `.github/workflows/release.yml`):

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      release-type:
        description: 'Release type (major, minor, patch)'
        required: false
        default: 'minor'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required for creating releases and tags
      
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Required for git history
          
      - name: Create Release
        uses: your-username/nodejs-release-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          release-type: ${{ github.event.inputs.release-type }}
```

## Workflow Permissions

The action requires the following permissions to function:
- `contents: write` - For creating tags, releases, and updating files

You can configure these permissions in two ways:

1. In the workflow file (recommended):
```yaml
jobs:
  release:
    permissions:
      contents: write
```

2. In repository settings:
    - Go to Settings > Actions > General
    - Scroll to "Workflow permissions"
    - Select "Read and write permissions"

## Inputs

| Input | Description | Required | Default | Notes |
|-------|-------------|----------|---------|-------|
| github-token | GitHub token for authentication | Yes | N/A | Use `${{ secrets.GITHUB_TOKEN }}` |
| release-type | Type of release (major, minor, patch) | No | minor | Determines version increment |

## Action Behavior

When executed, the action will:
1. Verify repository permissions
2. Read the current version from package.json
3. Calculate the new version based on release-type
4. Create and push a new git tag
5. Create a GitHub release
6. Update package.json with the new version
7. Commit and push the changes

## Error Handling

The action will fail if:
- Working directory is not clean
- Required permissions are not configured
- Invalid release type is specified
- Unable to push tags or create release
- package.json is not found or invalid

## Examples

### Basic Usage
```yaml
- name: Create Release
  uses: your-username/nodejs-release-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Specifying Release Type
```yaml
- name: Create Major Release
  uses: your-username/nodejs-release-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    release-type: major
```

## Development

To contribute to this action:

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Make your changes
4. Run tests:
```bash
npm test
```
5. Submit a pull request

## License

MIT

## Notes

- The action requires a clean working directory
- Commits will be made using the GitHub Actions bot
- All git operations are performed with the provided GITHUB_TOKEN
- Action runs in a Docker container for consistency