"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const workspace_1 = require("@nrwl/workspace");
const chalk = require("chalk");
class Logger {
    debug(message) {
        if (!process.env.NX_VERBOSE_LOGGING) {
            return;
        }
        workspace_1.output.addNewline();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspace_1.output.writeOutputTitle({
            label: chalk.reset.inverse.bold.keyword('grey')(' AWS-CLOUD '),
            title: chalk.keyword('grey')(message),
        });
        workspace_1.output.addNewline();
    }
    error(message) {
        workspace_1.output.addNewline();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspace_1.output.writeOutputTitle({
            label: chalk.reset.inverse.bold.red(' AWS-CLOUD '),
            title: chalk.bold.red(message),
        });
        workspace_1.output.addNewline();
    }
    warn(message) {
        workspace_1.output.addNewline();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspace_1.output.writeOutputTitle({
            label: chalk.reset.inverse.bold.yellow(' AWS-CLOUD '),
            title: chalk.bold.yellow(message),
        });
        workspace_1.output.addNewline();
    }
    success(message) {
        workspace_1.output.addNewline();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspace_1.output.writeOutputTitle({
            label: chalk.reset.inverse.bold.green(' AWS-CLOUD '),
            title: chalk.bold.green(message),
        });
        workspace_1.output.addNewline();
    }
    note(message) {
        workspace_1.output.addNewline();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspace_1.output.writeOutputTitle({
            label: chalk.reset.inverse.bold.keyword('orange')(' AWS-CLOUD '),
            title: chalk.keyword('orange')(message),
        });
        workspace_1.output.addNewline();
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map