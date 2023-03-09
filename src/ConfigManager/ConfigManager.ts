import { ModuleDataContainer } from "../ModuleDataManager";
import Synergy from "../Synergy";
import { GlobalLogger } from "../GlobalLogger";
import BaseConfigEntry from "./ConfigEntries/BaseConfigEntry";
import { ConfigCommonDataType } from "./ConfigDataTypes";

const CURRENT_CONFIG_VERSION = 8;
const MIN_COMPATIBLE_VERSION = 8;
const MAX_COMPATIBLE_VERSION = 16;

interface DataContainerRootStructure {
    version: {
        created: number;
        compatible: {
            min: number;
            max: number;
        }
    },
    data: {
        namespaces: {
            [key: string]: ConfigEntryStructure[]
        }
    }
}

interface ConfigEntryStructure {
    createdBy: string;
    data: any;
}

export interface ConfigEntryMapStructure {
    createdBy: string;
    entry: BaseConfigEntry<ConfigCommonDataType>;
}

export default class ConfigManager{
    private dataContainer!: ModuleDataContainer;
    private namespaces: Map<string, ConfigEntryMapStructure[]> = new Map();
    private timer: NodeJS.Timeout;

    constructor(public bot: Synergy){
        this.namespaces.set("bot", []);
        this.namespaces.set("user", []);
        this.namespaces.set("guild", []);

        //#TODO replace with instant updates without interval
        this.timer = setInterval(
            async () => { this.updateContainer(); },
            (this.bot.options.dataSyncDelay || 60) * 1000
        );
        this.bot.events.once("Stop", () => { clearInterval(this.timer); });
    }

    private updateContainer() {
        let root = this.dataContainer.get("root") as DataContainerRootStructure;

        let nm: typeof root.data.namespaces = {};

        for(let e of this.namespaces.entries()) {
            nm[e[0]] = e[1].map(entry => ({
                createdBy: entry.createdBy,
                data: entry.entry.serialize()
            }));
        }
        root.data.namespaces = nm;
    }

    private createDefaultStructure(container: ModuleDataContainer) {
        container.set("root", {
            version: {
                created: CURRENT_CONFIG_VERSION,
                compatible: {
                    min: MIN_COMPATIBLE_VERSION,
                    max: MAX_COMPATIBLE_VERSION
                }
            },
            data: {
                namespaces: {
                    bot: [],
                    user: [],
                    guild: []
                }
            }
        } as DataContainerRootStructure);
    }

    public async Init() {
        let container = await this.bot.modules.data.getContainer("global-config");

        //Check if container is empty
        if(!container.isEmpty()) {
            this.createDefaultStructure(container);
            this.dataContainer = container;

            GlobalLogger.root.warn(
                "[ConfigManager]",
                "There's empty global-config container, creating new structure. If this is the first launch then everything is fine."
            );
            return;
        }

        let data = container.dump();

        //Check container structure
        if(!data || !("root" in data && "version" in data.root)) {
            let ts = new Date().getTime();

            //Backup existing data into new container
            let backup = await this.bot.modules.data.getContainer(`global-config-bkp${ts}`);
            backup.restore(container.dump());

            //Cleanup existing container and create default structure
            container.wipe();
            this.createDefaultStructure(container);
            this.dataContainer = container;

            GlobalLogger.root.warn(
                "@".repeat(80) +
                "\n" +
                "@".repeat(80) +
                "\n" +
                `EXISTING CONFIG HAS INVALID STRUCTURE\n` +
                `EXISTING CONFIG BACKED UP AS "global-config-bkp${ts}" CONTAINER\n` +
                "CREATED NEW BLANK CONFIG CONTAINER\n" +
                "@".repeat(80) +
                "\n" +
                "@".repeat(80)
            );
            return;
        }

        //Check container version compatibility
        if(data.version.created < MIN_COMPATIBLE_VERSION || data.version.created > MAX_COMPATIBLE_VERSION) {
            //Backup existing data into new container
            let backup = await this.bot.modules.data.getContainer(`global-config-v${data.version.created}`);
            backup.restore(container.dump());

            //Cleanup existing container and create default structure
            container.wipe();
            this.createDefaultStructure(container);
            this.dataContainer = container;

            GlobalLogger.root.warn(
                "@".repeat(80) +
                "\n" +
                "@".repeat(80) +
                "\n" +

                `EXISTING CONFIG VERSION IS NOT COMPATIBLE WITH THIS SYNERGY VERSION ` +
                `(min: ${MIN_COMPATIBLE_VERSION}, max: ${MAX_COMPATIBLE_VERSION}, existing: ${data.version.created})\n` +

                `EXISTING CONFIG BACKED UP AS "global-config-v${data.version.created}" CONTAINER\n` +
                "CREATED NEW BLANK CONFIG CONTAINER\n" +
                "@".repeat(80) +
                "\n" +
                "@".repeat(80)
            );
            return;
        }

        //If all checks passed - just load the container
        this.dataContainer = container;
    }

    public addConfigEntry(namespace: string, createdBy: string, entry: BaseConfigEntry<any>) {
        let nsEntries = this.namespaces.get(namespace);
        if(!nsEntries) {
            nsEntries = [];
            this.namespaces.set(namespace, nsEntries);
        }

        //Check for name duplicates in specific namespace
        let nameDuplicate = nsEntries.find(e => e.entry.name === entry.name);
        if(nameDuplicate) {
            throw new Error("ConfigEntry with this name already exist on specified namespace.");
        }

        nsEntries.push({
            createdBy,
            entry
        });
        return;
    }

    public getConfigEntries(namespace: string) {
        return this.namespaces.get(namespace);
    }

    public getConfigEntriesNames(namespace: string) {
        return this.namespaces.get(namespace)?.map(e => e.entry.name) ?? [];
    }

    public getConfigEntry(namespace: string, entryName: string) {
        let nsEntries = this.namespaces.get(namespace);
        if(!nsEntries) {
            return undefined;
        }

        let entry = nsEntries.find(e => e.entry.name === entryName);
        if(!entry) {
            return undefined;
        }

        return entry;
    }

    public removeConfigEntry(namespace: string, entryName: string) {
        let nsEntries = this.namespaces.get(namespace);
        if(!nsEntries) {
            return;
        }

        let entryIndex = nsEntries.findIndex(e => e.entry.name === entryName);

        if(entryIndex === -1) {
            return;
        }

        nsEntries.splice(entryIndex, 1);
        return;
    }
}