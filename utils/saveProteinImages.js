const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

const baseUrl = "http://localhost:3000/test/";
const apiUrl = "http://localhost:3000/api/protein-info";
const baseImagePath = "/Users/uke/Documents/mo-db/public/img";
const pdbFolderPath = "/Users/uke/Documents/mo-db/public/pdb";

const numCPUs = os.cpus().length;
const MAX_RETRIES = 3;
const NAVIGATION_TIMEOUT = 10000;

async function readPdbFiles() {
  const files = await fs.readdir(pdbFolderPath);
  return files
    .filter((file) => file.endsWith(".pdb"))
    .map((file) => path.parse(file).name);
}

async function getProteinId(alias) {
  try {
    const response = await fetch(`${apiUrl}?alias=${alias}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error(
      `Failed to get protein ID for alias ${alias}: ${error.message}`
    );
    return null;
  }
}

async function imageExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processProtein(alias) {
  let browser;
  console.log(`[${alias}] Starting processing`);
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const id = await getProteinId(alias);
    if (!id) {
      console.log(`[${alias}] Skipped: No protein ID found`);
      return { alias, status: "skipped", reason: "No protein ID found" };
    }

    const nameFolderPath = path.join(baseImagePath, "name");
    const aliasFolderPath = path.join(baseImagePath, "alias");
    const idPath = path.join(nameFolderPath, `${id}.png`);
    const aliasPath = path.join(aliasFolderPath, `${alias}.png`);

    await fs.mkdir(nameFolderPath, { recursive: true });
    await fs.mkdir(aliasFolderPath, { recursive: true });

    if ((await imageExists(idPath)) && (await imageExists(aliasPath))) {
      console.log(`[${alias}] Skipped: Images already exist`);
      return { alias, status: "skipped", reason: "Images already exist" };
    }

    const url = baseUrl + id;

    let retries = MAX_RETRIES;
    while (retries > 0) {
      try {
        console.log(
          `[${alias}] Navigating to URL ${url} (attempt ${
            MAX_RETRIES - retries + 1
          })`
        );
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: NAVIGATION_TIMEOUT,
        });
        break;
      } catch (error) {
        if (retries === 1) throw error;
        console.log(
          `[${alias}] Navigation failed, retrying... (${
            retries - 1
          } attempts left)`
        );
        retries--;
      }
    }

    await page.waitForFunction(
      () => {
        const errorElement = document.querySelector(".text-red-500");
        const canvas = document.querySelector("#viewer canvas");
        return (
          errorElement !== null ||
          (canvas !== null && canvas.width > 0 && canvas.height > 0)
        );
      },
      { timeout: 10000 }
    );

    const hasError = await page.evaluate(() => {
      const errorElement = document.querySelector(".text-red-500");
      const selectElement = document.querySelector("select:disabled");
      const canvas = document.querySelector("#viewer canvas");
      return (
        errorElement !== null ||
        selectElement !== null ||
        !canvas ||
        canvas.width === 0 ||
        canvas.height === 0
      );
    });

    if (hasError) {
      console.log(`[${alias}] Skipped: Error or missing PDB structure`);
      return {
        alias,
        status: "skipped",
        reason: "Error or missing PDB structure",
      };
    }

    console.log(`[${alias}] Taking screenshot`);
    const canvas = await page.$("#viewer canvas");
    const imageBuffer = await canvas.screenshot({
      type: "png",
      omitBackground: true,
    });

    console.log(`[${alias}] Saving images`);
    await fs.writeFile(idPath, imageBuffer);
    await fs.writeFile(aliasPath, imageBuffer);

    console.log(`[${alias}] Success: Images saved`);
    return { alias, status: "success", id };
  } catch (error) {
    console.error(`[${alias}] Error: ${error.message}`);
    return { alias, status: "error", error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

if (isMainThread) {
  async function main() {
    console.log("Starting main process");
    const aliases = await readPdbFiles();
    console.log(`Total proteins to process: ${aliases.length}`);
    const chunkSize = Math.ceil(aliases.length / numCPUs);
    const chunks = [];

    for (let i = 0; i < aliases.length; i += chunkSize) {
      chunks.push(aliases.slice(i, i + chunkSize));
    }

    console.log(`Spawning ${chunks.length} workers`);
    const results = await Promise.all(
      chunks.map((chunk, index) => {
        return new Promise((resolve, reject) => {
          const worker = new Worker(__filename, { workerData: chunk });
          console.log(
            `Worker ${index + 1} started with ${chunk.length} proteins`
          );
          worker.on("message", resolve);
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0)
              reject(
                new Error(`Worker ${index + 1} stopped with exit code ${code}`)
              );
            else console.log(`Worker ${index + 1} finished`);
          });
        });
      })
    );

    const flatResults = results.flat();

    console.log("\nSummary:");
    console.log(`Total proteins processed: ${flatResults.length}`);
    console.log(
      `Successfully saved: ${
        flatResults.filter((r) => r.status === "success").length
      }`
    );
    console.log(
      `Skipped: ${flatResults.filter((r) => r.status === "skipped").length}`
    );
    console.log(
      `Errors: ${flatResults.filter((r) => r.status === "error").length}`
    );

    const errors = flatResults.filter((r) => r.status === "error");
    if (errors.length > 0) {
      console.log("\nDetailed Errors:");
      errors.forEach((e) => console.log(`${e.alias}: ${e.error}`));
    }
  }

  main().catch(console.error);
} else {
  (async () => {
    console.log(`Worker started with ${workerData.length} proteins`);
    const results = [];
    for (const alias of workerData) {
      results.push(await processProtein(alias));
    }
    parentPort.postMessage(results);
    console.log(`Worker finished processing ${workerData.length} proteins`);
  })();
}
