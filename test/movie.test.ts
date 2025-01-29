import { expect, test } from "vitest"
import { getEmbedURL, getEmbedInfo, getJuiceData, decryptStreamURL } from "../src";

const url = "https://catflix.su/movie/wallace-gromit-vengeance-most-fowl-929204";

test("Fetch M3U8 from film url.", async () => {
    const embed_url = await getEmbedURL(url)!;
    const embedInfo = await getEmbedInfo(embed_url);
    const juice_info = await getJuiceData(embedInfo.apkey, embedInfo.xxid);
    if (!juice_info) throw new Error("juice_info is null!");

    const streamURL = await decryptStreamURL(juice_info);

    const parseable = URL.canParse(streamURL);

    expect(parseable).toBe(true)
})