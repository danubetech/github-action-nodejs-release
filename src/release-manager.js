const fs = require('fs');
const { execSync } = require('child_process');
const core = require('@actions/core');

class ReleaseManager {
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

    configureGit() {
        execSync('git config user.name "GitHub Action"');
        execSync('git config user.email "action@github.com"');
    }

    async release(releaseType = 'minor') {
        try {
            // 1. Read current version and increment it
            const packageJson = this.readPackageJson();
            const currentVersion = packageJson.version;
            const newVersion = this.incrementVersion(currentVersion, releaseType);

            core.info(`Incrementing version from ${currentVersion} to ${newVersion}`);

            // 2. Update package.json with new version
            packageJson.version = newVersion;
            this.writePackageJson(packageJson);

            core.info('Updated package.json with new version');

            // 3. Commit and push changes
            this.configureGit();
            execSync('git add package.json');
            execSync(`git commit -m "skip ci: increment version to ${newVersion}"`);
            execSync('git push');

            core.info(`Successfully pushed version increment to ${newVersion}`);

        } catch (error) {
            throw new Error(`Version increment failed: ${error.message}`);
        }
    }
}

module.exports = { ReleaseManager };