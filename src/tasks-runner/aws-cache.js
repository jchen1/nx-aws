"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCache = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const util_1 = require("util");
const clientS3 = require("@aws-sdk/client-s3");
const credential_providers_1 = require("@aws-sdk/credential-providers");
const property_provider_1 = require("@aws-sdk/property-provider");
const tar_1 = require("tar");
const logger_1 = require("./logger");
class AwsCache {
    constructor(options, messages) {
        this.messages = messages;
        this.logger = new logger_1.Logger();
        this.uploadQueue = [];
        this.bucket = options.awsBucket;
        const clientConfig = {};
        if (options.awsRegion) {
            clientConfig.region = options.awsRegion;
        }
        if (options.awsEndpoint) {
            clientConfig.endpoint = options.awsEndpoint;
        }
        if (options.awsAccessKeyId && options.awsSecretAccessKey) {
            clientConfig.credentials = {
                accessKeyId: options.awsAccessKeyId,
                secretAccessKey: options.awsSecretAccessKey,
            };
        }
        else {
            clientConfig.credentials = credential_providers_1.fromNodeProviderChain(options.awsProfile ? { profile: options.awsProfile } : {});
        }
        this.s3 = new clientS3.S3Client(clientConfig);
    }
    checkConfig(options) {
        const missingOptions = [];
        if (!options.awsBucket) {
            missingOptions.push('NX_AWS_BUCKET | awsBucket');
        }
        if (missingOptions.length > 0) {
            throw new Error(`Missing AWS options: \n\n${missingOptions.join('\n')}`);
        }
    }
    // eslint-disable-next-line max-statements
    retrieve(hash, cacheDirectory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield this.s3.config.credentials();
            }
            catch (err) {
                this.messages.error = err;
                return false;
            }
            if (this.messages.error) {
                return false;
            }
            try {
                this.logger.debug(`Storage Cache: Downloading ${hash}`);
                const tgzFilePath = this.getTgzFilePath(hash, cacheDirectory);
                if (!(yield this.checkIfCacheExists(hash))) {
                    this.logger.debug(`Storage Cache: Cache miss ${hash}`);
                    return false;
                }
                yield this.downloadFile(hash, tgzFilePath);
                yield this.extractTgzFile(tgzFilePath, cacheDirectory);
                yield this.createCommitFile(hash, cacheDirectory);
                this.logger.debug(`Storage Cache: Cache hit ${hash}`);
                return true;
            }
            catch (err) {
                this.messages.error = err;
                this.logger.debug(`Storage Cache: Cache error ${hash}`);
                return false;
            }
        });
    }
    store(hash, cacheDirectory) {
        if (this.messages.error) {
            return Promise.resolve(false);
        }
        const resultPromise = this.createAndUploadFile(hash, cacheDirectory);
        this.uploadQueue.push(resultPromise);
        return resultPromise;
    }
    waitForStoreRequestsToComplete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield Promise.all(this.uploadQueue);
        });
    }
    createAndUploadFile(hash, cacheDirectory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const tgzFilePath = this.getTgzFilePath(hash, cacheDirectory);
                yield this.createTgzFile(tgzFilePath, hash, cacheDirectory);
                yield this.uploadFile(hash, tgzFilePath);
                return true;
            }
            catch (err) {
                this.messages.error = err;
                return false;
            }
        });
    }
    createTgzFile(tgzFilePath, hash, cacheDirectory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield tar_1.create({
                    gzip: true,
                    file: tgzFilePath,
                    cwd: cacheDirectory,
                }, [hash]);
            }
            catch (err) {
                throw new Error(`Error creating tar.gz file - ${err}`);
            }
        });
    }
    extractTgzFile(tgzFilePath, cacheDirectory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                yield tar_1.extract({
                    file: tgzFilePath,
                    cwd: cacheDirectory,
                });
            }
            catch (err) {
                throw new Error(`Error extracting tar.gz file - ${err}`);
            }
        });
    }
    uploadFile(hash, tgzFilePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tgzFileName = this.getTgzFileName(hash);
            const params = new clientS3.PutObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
                Body: fs_1.createReadStream(tgzFilePath),
            });
            try {
                this.logger.debug(`Storage Cache: Uploading ${hash}`);
                yield this.s3.send(params);
                this.logger.debug(`Storage Cache: Stored ${hash}`);
            }
            catch (err) {
                throw new Error(`Storage Cache: Upload error - ${err}`);
            }
        });
    }
    downloadFile(hash, tgzFilePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const pipelinePromise = util_1.promisify(stream_1.pipeline), tgzFileName = this.getTgzFileName(hash), writeFileToLocalDir = fs_1.createWriteStream(tgzFilePath), params = new clientS3.GetObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
            });
            try {
                const commandOutput = yield this.s3.send(params);
                const fileStream = commandOutput.Body;
                yield pipelinePromise(fileStream, writeFileToLocalDir);
            }
            catch (err) {
                throw new Error(`Storage Cache: Download error - ${err}`);
            }
        });
    }
    checkIfCacheExists(hash) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tgzFileName = this.getTgzFileName(hash), params = new clientS3.HeadObjectCommand({
                Bucket: this.bucket,
                Key: tgzFileName,
            });
            try {
                yield this.s3.send(params);
                return true;
            }
            catch (err) {
                if (err.name === 'NotFound') {
                    return false;
                }
                else if (err instanceof property_provider_1.CredentialsProviderError) {
                    return false;
                }
                throw new Error(`Error checking cache file existence - ${err}`);
            }
        });
    }
    createCommitFile(hash, cacheDirectory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const writeFileAsync = util_1.promisify(fs_1.writeFile);
            yield writeFileAsync(path_1.join(cacheDirectory, this.getCommitFileName(hash)), 'true');
        });
    }
    getTgzFileName(hash) {
        return `${hash}.tar.gz`;
    }
    getTgzFilePath(hash, cacheDirectory) {
        return path_1.join(cacheDirectory, this.getTgzFileName(hash));
    }
    getCommitFileName(hash) {
        return `${hash}.commit`;
    }
}
exports.AwsCache = AwsCache;
//# sourceMappingURL=aws-cache.js.map