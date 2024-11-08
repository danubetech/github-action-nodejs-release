const core = require('@actions/core');
const { ReleaseManager } = require('./release-manager');

async function run() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const releaseType = process.env.RELEASE_TYPE || 'minor';

        if (!['major', 'minor', 'patch'].includes(releaseType)) {
            throw new Error('Invalid release type. Use: major, minor, or patch');
        }

        const releaseManager = new ReleaseManager(token);
        await releaseManager.release(releaseType);

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();