import chalk from "chalk";
import { getEmbedURL, getEmbedInfo, getJuiceData, decryptStreamURL } from ".";

const logger = {
    info: (str: string) => {
        console.log(chalk.grey.bold(str));
    },
    success: (str: string) => {
        console.log(chalk.green.bold(str))
    },
};

const flags = {
    saveToFile: false,
    targetURL: ""
};

function parseArgv(argv: string[]) {
    let urlFound = false;
    argv.forEach((val) => {
        if (URL.canParse(val) && !urlFound) {
            flags.targetURL = val;
            urlFound = true;
        }
    });

    if (argv.includes("--save")) {
        flags.saveToFile = true;
    }

    if (!urlFound) {
        console.log(chalk.red.bold("Please provide a Catflix URL!"));
        process.exit(1);
    }
}

parseArgv(process.argv);

logger.info("Fetching Catflix URL...");
const embed_url = await getEmbedURL(flags.targetURL);
if (!embed_url) throw new Error("Failed to get Embed URL!");

logger.info("Fetching Embed URL...");
const embedInfo = await getEmbedInfo(embed_url);

logger.info("Fetching Juice Data...");
const juice_info = await getJuiceData(embedInfo.apkey, embedInfo.xxid);
if (!juice_info) throw new Error("Failed to get juice_info!");

const m3u8_url = await decryptStreamURL(juice_info);

console.log(chalk.green.bold("Decrypted Stream URL!"))
console.log(chalk.green("Stream with MPV:"), `${chalk.green.bold(`mpv --http-header-fields="Referer: https://turbovid.eu/" ${m3u8_url}`)}`);