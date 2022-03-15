import { Colors, Emojis, Utils } from "../src/Utils";

test("Utils - ErrMsg", () => {
    let embd = Utils.ErrMsg("test error message qwer123");
    expect(embd.title).toBe(`${Emojis.RedErrorCross} test error message qwer123`);
    expect(embd.color).toBe(Colors.Error);
});

test("Utils - getRandomInt x1000", () => {
    for(let i = 0; i < 1000; i++){
        let random = Utils.getRandomInt(-100, 100);
        expect(random).toBeGreaterThanOrEqual(-100);
        expect(random).toBeLessThanOrEqual(100);
    }
});

test("Utils - arrayRandElement x1000", () => {
    let array = [ "qwe", "1", "test", "sus", "429", "hi" ];
    for(let i = 0; i < 1000; i++){
        expect(array).toContain(Utils.arrayRandElement(array));
    }
});

test("Utils - padz", () => {
    expect(Utils.padz(5, 1)).toBe("00001");
    expect(Utils.padz(1, 1)).toBe("1");
    expect(Utils.padz(-5, 1)).toBe("1");
    expect(Utils.padz(5, -1)).toBe("-00001");
});

test("Utils - ts", () => {
    expect(Utils.ts(new Date(2022, 2, 16, 1, 3, 40))).toBe("2022-03-16 01:03:40.000");
    expect(Utils.ts(new Date(2022, 2, 16, 1, 3, 40, 16))).toBe("2022-03-16 01:03:40.016");
    expect(Utils.ts(new Date(2022, 2, 16))).toBe("2022-03-16 00:00:00.000");
    expect(Utils.ts(new Date(2022, 2))).toBe("2022-03-01 00:00:00.000");
});

test("Utils - parseID", () => {
    expect(Utils.parseID("<@!508637328349331462>")).toBe("508637328349331462");
    expect(Utils.parseID("<@&508637328349331462>")).toBe("508637328349331462");
    expect(Utils.parseID("<@508637328349331462>")).toBe("508637328349331462");
    expect(Utils.parseID("<#508637328349331462>")).toBe("508637328349331462");
    expect(Utils.parseID("508637328349331462")).toBe("508637328349331462");
    expect(Utils.parseID("123qwertyuiop")).toBe("123qwertyuiop");
    expect(Utils.parseID("<@!>")).toBe("");
    expect(Utils.parseID("<@&>")).toBe("");
    expect(Utils.parseID("<@>")).toBe("");
    expect(Utils.parseID("<#>")).toBe("");
});

test("Utils - valID", () => {
    expect(Utils.valID("<@!508637328349331462>")).toBeFalsy();
    expect(Utils.valID("508637328349331462")).toBeTruthy();
});


test("Utils - valNum", () => {
    expect(Utils.valNum(23, 0, 100)).toBeTruthy();
    expect(Utils.valNum(0, 0, 100)).toBeTruthy();
    expect(Utils.valNum(0, -100, 100)).toBeTruthy();
    expect(Utils.valNum(-65, -100, 100)).toBeTruthy();
    expect(Utils.valNum(-65, 0, 100)).toBeFalsy();
    expect(Utils.valNum(0, 0, 0)).toBeTruthy();
    expect(Utils.valNum(-653, -100, 100)).toBeFalsy();
    expect(Utils.valNum(653, -100, 100)).toBeFalsy();
});

test("Utils - extractDashParam", () => {
    expect(Utils.extractDashParam("help --command mute --full", "command")).toBe("mute");
    expect(Utils.extractDashParam("help --command mute --full", "full")).toBe("");
    expect(Utils.extractDashParam("help --command mute --full", "page")).toBeUndefined();
    expect(Utils.extractDashParam("bake --product bananas --as Okabe Rintarou", "as")).toBe("Okabe Rintarou");
});

test("Utils - formatTime", () => {
    expect(Utils.formatTime(43)).toBe("43 secs");
    expect(Utils.formatTime(65)).toBe("1 mins, 5 secs");
    expect(Utils.formatTime(3677)).toBe("1 hours, 1 mins, 17 secs");
    expect(Utils.formatTime(86494)).toBe("1 days, 0 hours, 1 mins, 34 secs");
});


test("Utils - div", () => {
    expect(Utils.div(100, 2)).toBe(50);
    expect(Utils.div(100, 3)).toBe(33);
});

test("Utils - parseShortTime", () => {
    expect(Utils.parseShortTime("50s")).toBe(50);
    expect(Utils.parseShortTime("1m50s")).toBe(110);
    expect(Utils.parseShortTime("3h1m50s")).toBe(10910);
    expect(Utils.parseShortTime("7d3h1m50s")).toBe(615710);
});

test("Utils - secondsToDhms", () => {
    expect(Utils.secondsToDhms(50)).toBe("0:0:0:50");
    expect(Utils.secondsToDhms(110)).toBe("0:0:1:50");
    expect(Utils.secondsToDhms(10910)).toBe("0:3:1:50");
    expect(Utils.secondsToDhms(615710)).toBe("7:3:1:50");
});

test("Utils - OsuRankEmoji", () => {
    expect(Utils.OsuRankEmoji("A")).toBe(Emojis.OsuRankA);
    expect(Utils.OsuRankEmoji("B")).toBe(Emojis.OsuRankB);
    expect(Utils.OsuRankEmoji("C")).toBe(Emojis.OsuRankC);
    expect(Utils.OsuRankEmoji("D")).toBe(Emojis.OsuRankD);
    expect(Utils.OsuRankEmoji("S")).toBe(Emojis.OsuRankS);
    expect(Utils.OsuRankEmoji("SH")).toBe(Emojis.OsuRankSH);
    expect(Utils.OsuRankEmoji("SS")).toBe(Emojis.OsuRankSS);
    expect(Utils.OsuRankEmoji("SSH")).toBe(Emojis.OsuRankSSH);

    expect(Utils.OsuRankEmoji("ssdfs")).toBe(Emojis.OsuRankD);
});

test("Utils - OsuModeEmoji", () => {
    expect(Utils.OsuModeEmoji("osu")).toBe(Emojis.OsuModeOsu);
    expect(Utils.OsuModeEmoji("mania")).toBe(Emojis.OsuModeMania);
    expect(Utils.OsuModeEmoji("catch")).toBe(Emojis.OsuModeCatch);
    expect(Utils.OsuModeEmoji("taiko")).toBe(Emojis.OsuModeTaiko);

    expect(Utils.OsuModeEmoji(0)).toBe(Emojis.OsuModeOsu);
    expect(Utils.OsuModeEmoji(3)).toBe(Emojis.OsuModeMania);
    expect(Utils.OsuModeEmoji(2)).toBe(Emojis.OsuModeCatch);
    expect(Utils.OsuModeEmoji(1)).toBe(Emojis.OsuModeTaiko);

    expect(Utils.OsuModeEmoji("")).toBe(Emojis.OsuModeOsu);
    expect(Utils.OsuModeEmoji(-43)).toBe(Emojis.OsuModeOsu);
});