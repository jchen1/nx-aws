import defaultTaskRunner from '@nrwl/workspace/tasks-runners/default';
import { AffectedEvent, TaskStatus } from '@nrwl/workspace/src/tasks-runner/tasks-runner';
import { Subject } from 'rxjs';
import { AwsNxCacheOptions } from './models/aws-nx-cache-options.model';
export declare const tasksRunner: (tasks: Parameters<typeof defaultTaskRunner>[0], options: Parameters<typeof defaultTaskRunner>[1] & AwsNxCacheOptions, context: Parameters<typeof defaultTaskRunner>[2]) => import("rxjs").Observable<AffectedEvent> | Subject<AffectedEvent | {
    [id: string]: TaskStatus;
}> | Promise<AffectedEvent | {
    [id: string]: TaskStatus;
}>;
export default tasksRunner;
