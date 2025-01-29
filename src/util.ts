import chalk from "chalk";

const TURBOVID_REFERER = "https://turbovid.eu";

export async function saveToFile(m3u8_url: string, base_m3u8: string) {
    let m3u8_data = await (await fetch(m3u8_url, {
        headers: {
            referer: "https://turbovid.eu/"
        }
    })).text();
    
    m3u8_data = m3u8_data.replace(/page-/gm, base_m3u8 + "page-");
    m3u8_data = m3u8_data.replace(/img-/gm, base_m3u8 + "img-");
    m3u8_data = m3u8_data.replace(/style-/gm, base_m3u8 + "style-");

    return m3u8_data;
}

export async function fetchTurbovid(url: string, json: boolean = false): Promise<turbovidResponse | null> {
    const res = await (await fetch(url, {
        headers: {
            referer: TURBOVID_REFERER
        }
    })).text();

    try {
        return JSON.parse(res);
    } catch (err) {
        console.error(chalk.red.bold(`Failed to parse as JSON! This is a fatal error..`));
        console.log("Attempted to parse:\n", res)
        console.log(err);
        return null;
    }
};