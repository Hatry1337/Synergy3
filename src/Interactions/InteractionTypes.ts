import Discord from "discord.js";
import User from "../Structures/User";

export type InteractiveComponentTargets = Discord.ButtonBuilder       | Discord.SelectMenuBuilder;
export type InteractiveCommandTargets   = Discord.SlashCommandBuilder | Discord.ContextMenuCommandBuilder;
export type InteractiveTargets          = InteractiveCommandTargets   | InteractiveComponentTargets;

export type InteractionTypeOf<T extends InteractiveTargets> =
    T extends Discord.SlashCommandBuilder       ? Discord.ChatInputCommandInteraction     : never |
    T extends Discord.ContextMenuCommandBuilder ? Discord.ContextMenuCommandInteraction   : never |
    T extends Discord.ButtonBuilder             ? Discord.ButtonInteraction               : never |
    T extends Discord.SelectMenuBuilder         ? Discord.SelectMenuInteraction           : never ;

export type InteractiveComponentInteractions = Discord.ButtonInteraction           | Discord.SelectMenuInteraction;
export type InteractiveCommandInteractions   = Discord.ChatInputCommandInteraction | Discord.ContextMenuCommandInteraction;
export type InteractiveInteractions          = InteractiveComponentInteractions    | InteractiveCommandInteractions;

export type TargetTypeOf<T extends InteractiveInteractions> =
    T extends InteractiveComponentInteractions ? InteractiveComponentTargets : never |
    T extends InteractiveCommandInteractions   ? InteractiveCommandTargets   : never ;

export type CallbackTypeOf<T extends InteractiveTargets> = (interaction: InteractionTypeOf<T>, user: User) => Promise<void>;