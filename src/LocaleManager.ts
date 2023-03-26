import log4js from "log4js";
import crypto from "crypto";
import util from "util";
import IModule from "./Modules/IModule";

interface Locale {
    name: string;

}

export class LocaleManager {
    private static logsDir = "./logs";
    public static setLogsDir(dir: string) {
        this.logsDir = dir;
    }

    static {
        log4js.configure({
            appenders: {
                console:  { type: 'console' },
                file:     { type: 'file', filename: this.logsDir + '/botlog.log' },
                database: { type: 'file', filename: this.logsDir + '/sql.log' },
                userlog:  { type: 'file', filename: this.logsDir + '/userlog.log' },
                trace:    { type: 'file', filename: this.logsDir + '/trace.log' }
            },
            categories: {
                default:  { appenders: ['console', 'file'], level: 'info' },
                root:     { appenders: ['console', 'file'], level: 'info' },
                command:  { appenders: ['console', 'file'], level: 'info' },
                economy:  { appenders: ['console', 'file'], level: 'info' },
                database: { appenders: ['database'],        level: 'info' },
                userlog:  { appenders: ['userlog'],         level: 'info' },
                trace:    { appenders: ['trace'],           level: 'info' }
            }
        });
    }
    public static root     = log4js.getLogger("root");
    public static command  = log4js.getLogger("command");
    public static economy  = log4js.getLogger("economy");
    public static database = log4js.getLogger("database");
    public static userlog  = log4js.getLogger("userlog");
    private static trace   = log4js.getLogger("trace");

    public static Trace(...args: any[]): string{
        let traceid = `${new Date().getTime()}-${crypto.randomBytes(32).toString('hex')}`;
        let trace_obj: Trace = {
            TraceID: traceid,
            Objects: []
        }
        for(let a of args){
            trace_obj.Objects.push({
                Type: a?.constructor?.name || "Object",
                Object: a
            });
        }
        this.trace.info(`TraceID: ${traceid}\n${util.inspect(trace_obj, false, 6)}`);
        return traceid;
    }
}

export class ModuleLogger extends GlobalLogger{
    private Module: IModule;
    constructor(module: IModule){
        super();
        this.Module = module;
    }

    Info(message: any, ...args: any[]){
        GlobalLogger.command.info(`[${this.Module.Name}]`, message, ...args);
    }

    Warn(message: any, ...args: any[]){
        GlobalLogger.command.warn(`[${this.Module.Name}]`, message, ...args);
    }

    Error(message: any, ...args: any[]){
        GlobalLogger.command.error(`[${this.Module.Name}]`, message, ...args);
    }

    Debug(message: any, ...args: any[]){
        GlobalLogger.command.debug(`[${this.Module.Name}]`, message, ...args);
    }

    Fatal(message: any, ...args: any[]){
        GlobalLogger.command.fatal(`[${this.Module.Name}]`, message, ...args);
    }
}