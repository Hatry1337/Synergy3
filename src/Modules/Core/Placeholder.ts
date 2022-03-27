import { RainbowBOT } from "../..";

import Module from "../Module";

export default class Placeholder extends Module{
    public Name:        string = "Placeholder";
    public Usage:       string = "U can't use this command, lol";
    public Description: string = "This is test command for debugging. #";
    public Category:    string = "Dev";
    public Author:      string = "Thomasss#9258";

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        var index = this.bot.modules.CountLoadedModules();
        this.Name += index.toString();
        this.Description += index.toString();
    }
}
