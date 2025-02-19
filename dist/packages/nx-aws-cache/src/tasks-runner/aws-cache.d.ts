import { RemoteCache } from '@nrwl/workspace/src/tasks-runner/default-tasks-runner';
import { AwsNxCacheOptions } from './models/aws-nx-cache-options.model';
import { MessageReporter } from './message-reporter';
export declare class AwsCache implements RemoteCache {
    private messages;
    private readonly bucket;
    private readonly s3;
    private readonly logger;
    private uploadQueue;
    constructor(options: AwsNxCacheOptions, messages: MessageReporter);
    checkConfig(options: AwsNxCacheOptions): void;
    retrieve(hash: string, cacheDirectory: string): Promise<boolean>;
    store(hash: string, cacheDirectory: string): Promise<boolean>;
    waitForStoreRequestsToComplete(): Promise<void>;
    private createAndUploadFile;
    private createTgzFile;
    private extractTgzFile;
    private uploadFile;
    private downloadFile;
    private checkIfCacheExists;
    private createCommitFile;
    private getTgzFileName;
    private getTgzFilePath;
    private getCommitFileName;
}
