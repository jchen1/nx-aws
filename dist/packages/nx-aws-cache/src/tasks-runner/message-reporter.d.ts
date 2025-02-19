import { Logger } from './logger';
export declare class MessageReporter {
    error: Error | null;
    private logger;
    constructor(logger: Logger);
    printMessages(): void;
}
