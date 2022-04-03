import Access from "../src/Structures/Access";

test("Access - ADMIN", () => {
    expect(Access.ADMIN()).toBe("admin");
});

test("Access - BANNED", () => {
    expect(Access.BANNED()).toBe("banned");
});

test("Access - GROUP", () => {
    expect(Access.GROUP("test")).toBe("group<test>");
});

test("Access - PLAYER", () => {
    expect(Access.PLAYER()).toBe("player");
});

test("Access - SERVER_ADMIN", () => {
    expect(Access.SERVER_ADMIN()).toBe("server_admin");
});

test("Access - SERVER_MOD", () => {
    expect(Access.SERVER_MOD()).toBe("server_mod");
});

test("Access - USER", () => {
    expect(Access.USER("508637328349331462")).toBe("user<508637328349331462>");
});