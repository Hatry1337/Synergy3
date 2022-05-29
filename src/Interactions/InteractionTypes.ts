import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import User from "../Structures/User";

export type InteractiveComponentTargets = Discord.MessageButton | Discord.MessageSelectMenu;
export type InteractiveCommandTargets =  SlashCommandBuilder | ContextMenuCommandBuilder;
export type InteractiveTargets = InteractiveCommandTargets | InteractiveComponentTargets;
export type InteractionTypeOf<T extends InteractiveTargets> = T extends SlashCommandBuilder       ? Discord.CommandInteraction     : never |
                                                              T extends ContextMenuCommandBuilder ? Discord.ContextMenuInteraction : never |
                                                              T extends Discord.MessageButton     ? Discord.ButtonInteraction      : never |
                                                              T extends Discord.MessageSelectMenu ? Discord.SelectMenuInteraction  : never;

export type InteractiveComponentInteractions = Discord.ButtonInteraction | Discord.SelectMenuInteraction;
export type InteractiveCommandInteractions = Discord.CommandInteraction | Discord.ContextMenuInteraction;
export type InteractiveInteractions = InteractiveComponentInteractions | InteractiveCommandInteractions;
export type TargetTypeOf<T extends InteractiveInteractions> = T extends InteractiveComponentInteractions ? InteractiveComponentTargets : never |
                                                              T extends InteractiveCommandInteractions ? InteractiveCommandTargets : never;

export type CallbackTypeOf<T extends InteractiveTargets> = (interaction: InteractionTypeOf<T>, user: User) => Promise<void>;
