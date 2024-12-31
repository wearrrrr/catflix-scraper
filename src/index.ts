import * as fs from "node:fs";
import * as cheerio from "cheerio";
import { decryptHexWithKey } from "./decrypt.js";
import chalk from 'chalk';

let saveToFile = false;

let CATFLIX_URL = "";
let urlFound = false;

process.argv.forEach((val) => {
    if (URL.canParse(val) && !urlFound) {
        CATFLIX_URL = val;
        urlFound = true;
    }
});

if (process.argv.includes("--save")) {
    saveToFile = true;
}

if (!urlFound) {
    console.log(chalk.red.bold("Please provide a Catflix URL!"));
    process.exit(1);
}

console.log(chalk.grey.bold("Fetching Catflix URL..."))
const catflix_html = await (await fetch(CATFLIX_URL)).text();
const catflix$ = cheerio.load(catflix_html);
const catflix_data = catflix$("script").last().html()!;
const match = catflix_data.match(/main_origin\s*=\s*"(.*?)"/)!
if (!match) {
    console.log("Catflix Data:\n" + catflix_data);
    throw new Error("Failed to find main_origin data, something has gone wrong!")
}
const embed_url = atob(match[1]);

if (!embed_url) throw new Error("Failed to get Embed URL!");

console.log(chalk.grey.bold("Fetching Embed URL..."))
const embed_html = await (await fetch(embed_url)).text();
const embed$ = cheerio.load(embed_html);

const embed_data = embed$("body > script").html()!;
const apkey = embed_data.match(/const\s+apkey\s*=\s*"(.*?)";/)![1];
const xxid = embed_data.match(/const\s+xxid\s*=\s*"(.*?)";/)![1]

console.log(chalk.grey.bold("Fetching Juice Data..."))
const juice = await (await fetch("https://turbovid.eu/api/cucked/juice_key", {
    headers: {
        referer: "https://turbovid.eu/"
    }
})).json();

const the_juice = await (await fetch(`https://turbovid.eu/api/cucked/the_juice/?${apkey}=${xxid}`, {
    headers: {
        referer: embed_url
    }
})).json();

const m3u8_url = decryptHexWithKey(the_juice.data, juice.juice)
console.log(chalk.green.bold("Decrypted Stream URL!"))

const base_m3u8 = m3u8_url.split("uwu.m3u8")[0];

if (saveToFile) {
    let m3u8_data = await (await fetch(m3u8_url, {
        headers: {
            referer: "https://turbovid.eu/"
        }
    })).text();
    
    m3u8_data = m3u8_data.replace(/page-/gm, base_m3u8 + "page-");
    m3u8_data = m3u8_data.replace(/img-/gm, base_m3u8 + "img-");
    m3u8_data = m3u8_data.replace(/style-/gm, base_m3u8 + "style-");
    
    fs.writeFileSync("data.m3u8", m3u8_data);
    console.log(chalk.green.bold("Successfully wrote stream data to file! Enjoy :)"))
}


console.log(chalk.green("Stream with MPV:"), `${chalk.green.bold(`mpv --http-header-fields="Referer: https://turbovid.eu/" ${m3u8_url}`)}`);