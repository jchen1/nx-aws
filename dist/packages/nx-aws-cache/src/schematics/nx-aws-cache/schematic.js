"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_1 = require("@nrwl/workspace");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const rxjs_1 = require("rxjs");
function isCompatibleVersion() {
    const json = JSON.parse(fs_1.readFileSync('package.json').toString());
    let version = json.dependencies['@nrwl/workspace'] || json.devDependencies['@nrwl/workspace'];
    if (!version) {
        throw new Error(`You must use Nx >= 8.0 to enable Storage Cache`);
    }
    if (version.startsWith('^') || version.startsWith('~')) {
        version = version.substr(1);
    }
    const [major, minor] = version.split('.');
    const majorNumber = Number.parseInt(major, 10);
    if (isNaN(majorNumber)) {
        return true;
    }
    // eslint-disable-next-line no-magic-numbers
    if (majorNumber >= 9) {
        return true;
    }
    // eslint-disable-next-line no-magic-numbers
    if (Number.parseInt(minor, 10) >= 12) {
        return true;
    }
    return false;
}
function isYarn() {
    try {
        return fs_1.statSync('yarn.lock').isFile();
    }
    catch (err) {
        return false;
    }
}
function updateWorkspacePackage() {
    console.log(`Updating @nrwl/workspace to 8.12.10 to make the workspace compatible with Storage Cache.`);
    if (isYarn()) {
        console.log(`yarn add --dev @nrwl/workspace@8.12.10`);
        child_process_1.execSync(`yarn add --dev @nrwl/workspace@8.12.10`, {
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }
    else {
        console.log(`npm i --save-dev @nrwl/workspace@8.12.10`);
        child_process_1.execSync(`npm i --save-dev @nrwl/workspace@8.12.10`, {
            stdio: ['inherit', 'inherit', 'inherit'],
        });
    }
}
function updateNxJson(ops) {
    workspace_1.updateJsonFile('nx.json', (json) => {
        json.tasksRunnerOptions = {
            default: {
                runner: '@nx-aws-plugin/nx-aws-cache',
                options: Object.assign(Object.assign(Object.assign({}, (ops.awsBucket ? { awsBucket: ops.awsBucket } : {})), (ops.awsRegion ? { awsRegion: ops.awsRegion } : {})), { cacheableOperations: ['build', 'test', 'lint', 'e2e'] }),
            },
        };
    });
}
// eslint-disable-next-line func-names
function default_1(options) {
    return () => {
        if (!isCompatibleVersion()) {
            updateWorkspacePackage();
        }
        updateNxJson(options);
        return rxjs_1.noop();
    };
}
exports.default = default_1;
//# sourceMappingURL=schematic.js.map