import * as fs from "node:fs";
import * as cheerio from "cheerio";
import { decryptHexWithKey } from "./decrypt.js";
import chalk from 'chalk';
import { fetchTurbovid, saveToFile } from "./util.js";

const logger = {
    success: (str: string) => {
        console.log(chalk.green.bold(str))
    },
};

async function cheerio_setup(url: string) {
    if (!URL.canParse(url)) return null;
    const html = await (await fetch(url)).text();

    return cheerio.load(html);
}

export async function getEmbedURL(targetURL: string) {
    const catflix$ = await cheerio_setup(targetURL);
    if (!catflix$) throw new Error(`Failed to setup cheerio for ${targetURL}!`);
    const catflix_data = catflix$("script").last().html()!;
    const match = catflix_data.match(/main_origin\s*=\s*"(.*?)"/)!
    if (!match) {
        console.log("Catflix Data:\n" + catflix_data);
        throw new Error("Failed to find main_origin data, something has gone wrong!")
    }
    return atob(match[1]);
}

export async function getEmbedInfo(embed_url: string) {
    const embed$ = await cheerio_setup(embed_url);
    if (!embed$) throw new Error(`Failed to setup cheerio for ${embed_url}!`);
    const embed_data = embed$("body > script").html()!;

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
        console.error(chalk.red.bold("Failed to fetch either juice_key or the_juice! Check the console for more information..."));
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

export async function saveM3U8ToFile(m3u8_url: string) {
    const base_m3u8 = m3u8_url.split("uwu.m3u8")[0];
    const m3u8_data = await saveToFile(m3u8_url, base_m3u8);
    
    fs.writeFileSync("data.m3u8", m3u8_data);
    logger.success("Successfully wrote stream data to file! Enjoy :)");
}