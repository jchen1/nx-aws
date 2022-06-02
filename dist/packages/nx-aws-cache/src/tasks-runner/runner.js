"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRunner = void 0;
const tslib_1 = require("tslib");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const default_1 = require("@nrwl/workspace/tasks-runners/default");
const rxjs_1 = require("rxjs");
const aws_cache_1 = require("./aws-cache");
const logger_1 = require("./logger");
const message_reporter_1 = require("./message-reporter");
function getOptions(options) {
    var _a, _b, _c, _d;
    return {
        awsAccessKeyId: process.env.NX_AWS_ACCESS_KEY_ID,
        awsBucket: (_a = options.awsBucket) !== null && _a !== void 0 ? _a : process.env.NX_AWS_BUCKET,
        awsRegion: (_b = options.awsRegion) !== null && _b !== void 0 ? _b : process.env.NX_AWS_REGION,
        awsSecretAccessKey: process.env.NX_AWS_SECRET_ACCESS_KEY,
        awsProfile: (_c = options.awsProfile) !== null && _c !== void 0 ? _c : process.env.NX_AWS_PROFILE,
        awsEndpoint: (_d = options.awsEndpoint) !== null && _d !== void 0 ? _d : process.env.NX_AWS_ENDPOINT,
    };
}
// eslint-disable-next-line max-lines-per-function
const tasksRunner = (tasks, options, 
// eslint-disable-next-line no-magic-numbers
context) => {
    var _a;
    const awsOptions = getOptions(options);
    const logger = new logger_1.Logger();
    try {
        if (process.env.NX_AWS_DISABLE === 'true') {
            logger.note('USING LOCAL CACHE (NX_AWS_DISABLE is set to true)');
            return default_1.default(tasks, options, context);
        }
        logger.note('USING REMOTE CACHE');
        const messages = new message_reporter_1.MessageReporter(logger);
        const remoteCache = new aws_cache_1.AwsCache(awsOptions, messages);
        const runnerWrapper = new rxjs_1.Subject(), runner$ = default_1.default(tasks, Object.assign(Object.assign({}, options), { remoteCache }), context);
        rxjs_1.from(runner$).subscribe({
            next: (value) => runnerWrapper.next(value),
            error: (err) => runnerWrapper.error(err),
            complete: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                yield remoteCache.waitForStoreRequestsToComplete();
                messages.printMessages();
                runnerWrapper.complete();
            }),
        });
        if (typeof ((_a = runner$) === null || _a === void 0 ? void 0 : _a.subscribe) === 'function') {
            return runnerWrapper;
        }
        return runnerWrapper.toPromise();
    }
    catch (err) {
        logger.warn(err.message);
        logger.note('USING LOCAL CACHE');
        return default_1.default(tasks, options, context);
    }
};
exports.tasksRunner = tasksRunner;
exports.default = exports.tasksRunner;
//# sourceMappingURL=runner.js.map