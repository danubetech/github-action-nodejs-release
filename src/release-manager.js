const fs = require('fs');
const { execSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');

class ReleaseManager {
    constructor(githubToken) {
        this.githubToken = githubToken;
        this.octokit = github.getOctokit(githubToken);
    }

    readPackageJson() {
        return JSON.parse(fs.readFileSync('package.json', 'utf8'));
    }

    writePackageJson(packageJson) {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    }

    incrementVersion(version, releaseType = 'minor') {
        const [major, minor, patch] = version.replace(/[^\d.]/g, '').split('.').map(Number);

        switch (releaseType) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
            default:
                throw new Error('Invalid release type. Use: major, minor, or patch');
        }
    }

    async configureGit() {
        execSync('git config user.name "GitHub Action"');
        execSync('git config user.email "action@github.com"');
    }

    async createRelease(version) {
        try {
            // Ensure working directory is clean
            execSync('git diff-index --quiet HEAD --');

            // Configure git
            await this.configureGit();

            // Create and push tag
            execSync(`git tag -a v${version} -m "Release version ${version}"`);
            execSync('git push --tags');

            // Create GitHub release
            const { owner, repo } = github.context.repo;
            await this.octokit.rest.repos.createRelease({
                owner,
                repo,
                tag_name: `v${version}`,
                name: `Release v${version}`,
                body: `Release of version ${version}`,
                draft: false,
                prerelease: false
            });

            core.info(`Successfully created release v${version}`);

        } catch (error) {
            if (error.status === 1) {
                throw new Error('Working directory is not clean. Please commit all changes first.');
            }
            throw error;
        }
    }

    async release(releaseType = 'minor') {
        try {
            // Read current version
            const packageJson = this.readPackageJson();
            const currentVersion = packageJson.version;
            core.info(`Current version: ${currentVersion}`);

            // Create new version
            const newVersion = this.incrementVersion(currentVersion, releaseType);
            core.info(`New version will be: ${newVersion}`);

            // Create and push tag
            await this.createRelease(newVersion);

            // Update package.json with next version
            packageJson.version = newVersion;
            this.writePackageJson(packageJson);

            // Commit package.json changes
            execSync('git add package.json');
            execSync(`git commit -m "Bump version to ${newVersion}"`);
            execSync('git push');

            core.info(`Successfully released version ${newVersion}`);

        } catch (error) {
            throw new Error(`Release failed: ${error.message}`);
        }
    }
}

module.exports = { ReleaseManager };