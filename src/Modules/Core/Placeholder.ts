import Discord from "discord.js";

import ModuleManager from "../../ModuleManager";
import Module from "../Module";

export default class Placeholder extends Module{
    public Name:        string = "Placeholder";
    public Usage:       string = "U can't use this command, lol";
    public Description: string = "This is test command for debugging. #";
    public Category:    string = "Dev";
    public Author:      string = "Thomasss#9258";

    constructor(controller: ModuleManager, uuid: string) {
        super(controller, uuid);
        var index = this.Controller.CountLoadedModules();
        this.Name += index.toString();
        this.Description += index.toString();
    }
    
    public Test(interaction: Discord.CommandInteraction){
        return false;
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            resolve(await interaction.reply("Wait, what.. How do you run this command?!!"));
        });
    }
}
