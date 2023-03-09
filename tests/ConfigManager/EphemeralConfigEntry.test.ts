import { EphemeralConfigEntry } from "../../src/ConfigManager/ConfigEntries/EphemeralConfigEntry";

test("ConfigManager - EphemeralConfigEntry", () => {
    let entryName = "test_entry";
    let ephemeralTarget = "SomeUser1";
    let entryValue = "Hello World!";

    let entry = new  EphemeralConfigEntry(entryName, "string", true);

    expect(entry.name).toBe(entryName);
    expect(entry.isString()).toBeTruthy();
    expect(entry.isArray()).toBeFalsy();
    expect(entry.isEphemeral()).toBeTruthy();

    expect(entry.getValue(ephemeralTarget)).toBeUndefined();
    entry.setValue(ephemeralTarget, entryValue);
    expect(entry.getValue(ephemeralTarget)).toBe(entryValue);
});