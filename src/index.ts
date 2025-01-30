import * as cheerio from "cheerio";
import { decryptHexWithKey } from "./decrypt.js";
import { fetchTurbovid } from "./util.js";

async function cheerio_setup(url: string) {
    if (!URL.canParse(url)) return null;
    const html = await fetch(url);

    return cheerio.load(await html.text());
}

export async function getEmbedURL(targetURL: string) {
    const $ = await cheerio_setup(targetURL);
    if (!$) throw new Error(`Failed to setup cheerio for ${targetURL}!`);
    const catflix_data = $("script").last().html()!;
    const match = catflix_data.match(/main_origin\s*=\s*"(.*?)"/)!
    if (!match) {
        console.log("Catflix Data:\n" + catflix_data);
        throw new Error("Failed to find main_origin data, something has gone wrong!")
    }

    return atob(match[1]);
}

export async function getEmbedInfo(embed_url: string) {
    const $ = await cheerio_setup(embed_url);
    if (!$) throw new Error(`Failed to setup cheerio for ${embed_url}!`);
    const embed_data = $("body > script").html();
    if (!embed_data) throw new Error("Failed to find embed_data!");

    return {
        apkey: embed_data.match(/const\s+apkey\s*=\s*"(.*?)";/)![1],
        xxid: embed_data.match(/const\s+xxid\s*=\s*"(.*?)";/)![1],
    }
}

export async function getJuiceData(apkey: string, xxid: string): Promise<JuiceData | null> {
    const res = await Promise.all([
        fetchTurbovid("https://turbovid.eu/api/cucked/juice_key", true),
        fetchTurbovid(`https://turbovid.eu/api/cucked/the_juice/?${apkey}=${xxid}`, true)
    ])
    
    if (!res[0] || !res[1]) {
        console.error("Failed to fetch either juice_key or the_juice! Check the console for more information...");
        return null;
    }

    return {
        juice_key: res[0].juice,
        the_juice: res[1].data
    }
}

export async function decryptStreamURL(juice_info: JuiceData) {
    return decryptHexWithKey(juice_info.the_juice, juice_info.juice_key);
}