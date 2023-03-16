import CommonArrayConfigEntry from "../../src/ConfigManager/ConfigEntries/CommonArrayConfigEntry";

test("ConfigManager - CommonArrayConfigEntry", () => {
    let entryName = "test_entry";
    let entryDescription = "Very useful config entry.";
    let entryValue = "Hello World!";

    let entry = new  CommonArrayConfigEntry(entryName, entryDescription, "string", false);

    expect(entry.name).toBe(entryName);
    expect(entry.isString()).toBeTruthy();
    expect(entry.isArray()).toBeTruthy();
    expect(entry.isCommon()).toBeTruthy();

    expect(entry.getValue(0)).toBeUndefined();
    entry.addValue(entryValue);
    expect(entry.getValue(0)).toBe(entryValue);
});