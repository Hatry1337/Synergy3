import User from "../Entity/User";
import { CommandSynergent, MessageSynergent, SynergentListener } from "../struct/Synergent";
import { SynergyPlatformAdapter } from "../struct/SynergyPlatformAdapter";
import { Platform } from "../Platform";
import Discord from "discord.js";
import { SynergeticCommand } from "../struct/SynergeticCommand";
import { UnifiedId } from "../UnifiedId";
import { PlatformUser } from "../struct/PlatformUser";

export class DiscordAdapter implements SynergyPlatformAdapter {
    private messageEventListeners: SynergentListener<MessageSynergent>[] = [];
    private commandEventListeners: SynergentListener<CommandSynergent>[] = [];
    private discordClient: Discord.Client;

    public constructor(client: Discord.Client) {
        this.discordClient = client;
        this.discordClient.on("interactionCreate", this.handleInteraction);
    }

    public init() {
        console.log("Discord adapter initialized.")
    }

    private async handleInteraction(interaction: Discord.Interaction) {
        if(interaction.isChatInputCommand()) {
            this.commandEventListeners.forEach(e => {
                try {
                    e({
                        adapter: this,
                        user: new User({
                            unifiedId: UnifiedId.generate().toString(16),
                            name: interaction.user.tag,
                            platforms: [{
                                id: Platform.DISCORD,
                                userOriginId: interaction.user.id,
                                userOriginName: interaction.user.tag
                            }]
                        }),
                        command: new SynergeticCommand(
                            Math.floor(Math.random() * 100000),
                            interaction.commandName,
                            []
                        ),
                    });
                } catch (e) {
                    console.log("Failed to proxy discord event:", e);
                }
            })
        }
    }

    public getPlatformId(): number {
        return Platform.DISCORD;
    }
    public getPlatformName(): string {
        return "Discord"
    }

    public getPlatformUser(id: string): PlatformUser | undefined {
        let user = this.discordClient.users.cache.get(id);
        if(user) {
            return {
                originId: user.id,
                originName: user.tag,
                originPlatformId: Platform.DISCORD
            }
        }
        return;
    }

    public addMessageEventListener(event: SynergentListener<MessageSynergent>): void {
        this.messageEventListeners.push(event);
    }

    public addCommandEventListener(event: SynergentListener<CommandSynergent>): void {
        this.commandEventListeners.push(event);
    }
}