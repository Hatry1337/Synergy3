import { EphemeralArrayConfigEntry } from "../../src/ConfigManager/ConfigEntries/EphemeralArrayConfigEntry";

test("ConfigManager - EphemeralArrayConfigEntry", () => {
    let entryName = "test_entry";
    let ephemeralTarget = "SomeUser1";
    let entryValue = "Hello World!";

    let entry = new  EphemeralArrayConfigEntry(entryName, "string", true);

    expect(entry.name).toBe(entryName);
    expect(entry.isString()).toBeTruthy();
    expect(entry.isArray()).toBeTruthy();
    expect(entry.isEphemeral()).toBeTruthy();

    expect(entry.getValue(ephemeralTarget, 0)).toBeUndefined();
    entry.addValue(ephemeralTarget, entryValue);
    expect(entry.getValue(ephemeralTarget, 0)).toBe(entryValue);
});