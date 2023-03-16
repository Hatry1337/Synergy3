import { ModuleDataContainer } from "../ModuleDataManager";
import Synergy from "../Synergy";
import { GlobalLogger } from "../GlobalLogger";
import BaseConfigEntry, { RawBaseConfigEntry } from "./ConfigEntries/BaseConfigEntry";
import { ConfigCommonDataType } from "./ConfigDataTypes";
import { EphemeralConfigEntry } from "./ConfigEntries/EphemeralConfigEntry";

const CURRENT_CONFIG_VERSION = 20;
const MIN_COMPATIBLE_VERSION = 20;
const MAX_COMPATIBLE_VERSION = 21;

interface DataContainerRootStructure {
    magickString: "syn3conf2770";
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
    data: RawBaseConfigEntry<any>;
}

export interface ConfigEntryMapStructure {
    createdBy: string;
    entry: BaseConfigEntry<ConfigCommonDataType>;
}

export default class ConfigManager{
    private dataContainer!: ModuleDataContainer;
    private namespaces: Map<string, ConfigEntryMapStructure[]> = new Map();
    private readonly timer: NodeJS.Timeout;
    private initialized: boolean = false;

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

    public async Init() {
        let container = await this.bot.modules.data.getContainer("global-config");

        await this.verifyContainer(container);

        //If all checks passed - just load the container
        this.dataContainer = container;

        //Create default moderator_role config entry
        try {
            this.addConfigEntry("guild", "Synergy3",
                new EphemeralConfigEntry(
                    "moderator_role",
                    "Role for Guild moderators used by moderation commands.",
                    "role",
                    false
                )
            );
        } catch (e) {}

        this.loadEntriesFromContainer();

        this.initialized = true;
    }

    /*
        Use this only inside your module's class constructor.
        -
        Declares new config entry if it doesn't exist. Otherwise, returns existing one.
     */
    public defaultConfigEntry(namespace: string, createdBy: string, entry: BaseConfigEntry<any>, suppressInitWarn: boolean = false) {
        let cEntry = this.getConfigEntry(namespace, entry.name);
        if(cEntry) {
            return cEntry;
        }
        return this.addConfigEntry(namespace, createdBy, entry, suppressInitWarn);
    }

    /*
        Use this only inside your module's class constructor.
        -
        Declares new config entry.
     */
    public addConfigEntry(namespace: string, createdBy: string, entry: BaseConfigEntry<any>, suppressInitWarn: boolean = false) {
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

        if(this.initialized) {
            this.reloadConfigEntry(namespace, entry.name);

            if(!suppressInitWarn) {
                GlobalLogger.root.warn(
                    "[ConfigManager]",
                    `Seems like module "${createdBy}" tries to create config entry "${entry.name}" after ConfigManager initialization.`
                );
            }
        }
        return entry;
    }

    /*
        Reloads specified config entry from config container
     */
    public reloadConfigEntry(namespace: string, entryName: string) {
        let nsEntries = this.namespaces.get(namespace);
        if(!nsEntries) {
            return;
        }

        let entry = nsEntries.find(e => e.entry.name === entryName);
        if(!entry) {
            return;
        }

        let root = this.dataContainer.get("root") as DataContainerRootStructure;
        let containerEntry = root.data.namespaces[namespace].find(ent => ent.data.name === entryName);
        if(containerEntry) {
            entry.entry.loadData(containerEntry.data);
        }
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
            magickString: "syn3conf2770",
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

    private loadEntriesFromContainer() {
        let root = this.dataContainer.get("root") as DataContainerRootStructure;
        for(let ns of this.namespaces.entries()) {
            for(let e of ns[1]) {
                let containerEntry = root.data.namespaces[ns[0]].find(ent => ent.data.name === e.entry.name);
                if(containerEntry) {
                    e.entry.loadData(containerEntry.data);
                }
            }
        }
    }

    private async verifyContainer(container: ModuleDataContainer) {
        //Check if container is empty
        if(container.isEmpty()) {
            this.createDefaultStructure(container);

            GlobalLogger.root.warn(
                "[ConfigManager]",
                "There's empty global-config container, creating new structure. If this is the first launch then everything is fine."
            );
            return;
        }

        let root = container.dump()?.root as DataContainerRootStructure | undefined;

        //Check container structure
        if(!root || !("magickString" in root) || root.magickString !== "syn3conf2770") {
            let ts = new Date().getTime();

            //Backup existing data into new container
            let backup = await this.bot.modules.data.getContainer(`global-config-bkp${ts}`);
            backup.restore(container.dump());

            //Cleanup existing container and create default structure
            container.wipe();
            this.createDefaultStructure(container);

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
        if(root.version.created < MIN_COMPATIBLE_VERSION || root.version.created > MAX_COMPATIBLE_VERSION) {
            //Backup existing data into new container
            let backup = await this.bot.modules.data.getContainer(`global-config-v${root.version.created}`);
            backup.restore(container.dump());

            //Cleanup existing container and create default structure
            container.wipe();
            this.createDefaultStructure(container);

            GlobalLogger.root.warn(
                "@".repeat(80) +
                "\n" +
                "@".repeat(80) +
                "\n" +

                `EXISTING CONFIG VERSION IS NOT COMPATIBLE WITH THIS SYNERGY VERSION ` +
                `(min: ${MIN_COMPATIBLE_VERSION}, max: ${MAX_COMPATIBLE_VERSION}, existing: ${root.version.created})\n` +

                `EXISTING CONFIG BACKED UP AS "global-config-v${root.version.created}" CONTAINER\n` +
                "CREATED NEW BLANK CONFIG CONTAINER\n" +
                "@".repeat(80) +
                "\n" +
                "@".repeat(80)
            );
            return;
        }
    }
}