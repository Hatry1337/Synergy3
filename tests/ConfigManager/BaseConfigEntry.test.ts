import BaseConfigEntry from "../../src/ConfigManager/ConfigEntries/BaseConfigEntry";
import CommonArrayConfigEntry from "../../src/ConfigManager/ConfigEntries/CommonArrayConfigEntry";

test("ConfigManager - BaseConfigEntry", () => {
    let entryName = "test_entry";
    let entryDescription = "Very useful config entry.";

    let entry: BaseConfigEntry<any> = new  CommonArrayConfigEntry(entryName, entryDescription, "string", true);

    expect(entry.name).toBe(entryName);

    if(entry.isCommon() && entry.isArray() && entry.isString()) {
        expect(entry.isArray()).toBeTruthy();
        expect(entry.isString()).toBeTruthy();
        expect(entry.isEphemeral()).toBeFalsy();
    } else {
        fail("Type guards failed.");
    }
});