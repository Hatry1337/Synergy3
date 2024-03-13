import { Synergy } from "../..";

import Module from "../Module";

export default class Placeholder extends Module{
    public Name:        string = "Placeholder";
    public Description: string = "This is test command for debugging. #";
    public Category:    string = "Dev";
    public Author:      string = "Thomasss#9258";

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        var index = this.bot.modules.CountLoadedModules();
        this.Name += index.toString();
        this.Description += index.toString();
    }
}
