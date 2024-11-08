const core = require('@actions/core');
const { ReleaseManager } = require('./release-manager');

async function run() {
    try {
        const token = core.getInput('github-token', { required: true });
        const releaseType = core.getInput('release-type') || 'minor';

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