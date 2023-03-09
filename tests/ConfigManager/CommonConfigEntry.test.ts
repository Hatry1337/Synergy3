import CommonConfigEntry from "../../src/ConfigManager/ConfigEntries/CommonConfigEntry";

test("ConfigManager - CommonConfigEntry", () => {
    let entryName = "test_entry";
    let entryValue = "Hello World!";

    let entry = new  CommonConfigEntry(entryName, "string", false);

    expect(entry.name).toBe(entryName);
    expect(entry.isString()).toBeTruthy();
    expect(entry.isArray()).toBeFalsy();
    expect(entry.isCommon()).toBeTruthy();

    expect(entry.getValue()).toBeUndefined();
    entry.setValue(entryValue);
    expect(entry.getValue()).toBe(entryValue);
});