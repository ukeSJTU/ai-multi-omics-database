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
const proteinInfoFile = path.join(
  process.cwd(),
  "data",
  "9606.protein.info.v12.0.txt"
);

const numCPUs = os.cpus().length;
const MAX_RETRIES = 3;
const NAVIGATION_TIMEOUT = 10000;

async function readProteinIds() {
  const data = await fs.readFile(proteinInfoFile, "utf8");
  return data
    .split("\n")
    .filter((line) => !line.startsWith("#") && line.trim())
    .map((line) => line.split("\t")[0]);
}

async function getAlias(id) {
  try {
    const response = await fetch(`${apiUrl}?id=${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.alias;
  } catch (error) {
    console.error(`Failed to get alias for ${id}: ${error.message}`);
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

async function processProtein(id) {
  let browser;
  console.log(`[${id}] Starting processing`);
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const alias = await getAlias(id);
    if (!alias) {
      console.log(`[${id}] Skipped: No alias found`);
      return { id, status: "skipped", reason: "No alias found" };
    }

    const nameFolderPath = path.join(baseImagePath, "name");
    const aliasFolderPath = path.join(baseImagePath, "alias");
    const idPath = path.join(nameFolderPath, `${id}.png`);
    const aliasPath = path.join(aliasFolderPath, `${alias}.png`);

    // Create 'name' and 'alias' folders if they don't exist
    await fs.mkdir(nameFolderPath, { recursive: true });
    await fs.mkdir(aliasFolderPath, { recursive: true });

    if ((await imageExists(idPath)) && (await imageExists(aliasPath))) {
      console.log(`[${id}] Skipped: Images already exist`);
      return { id, status: "skipped", reason: "Images already exist" };
    }

    const url = baseUrl + id;

    let retries = MAX_RETRIES;
    while (retries > 0) {
      try {
        console.log(
          `[${id}] Navigating to URL (attempt ${MAX_RETRIES - retries + 1})`
        );
        await page.goto(url, {
          waitUntil: "networkidle0",
          timeout: NAVIGATION_TIMEOUT,
        });
        break;
      } catch (error) {
        if (retries === 1) throw error;
        console.log(
          `[${id}] Navigation failed, retrying... (${
            retries - 1
          } attempts left)`
        );
        retries--;
      }
    }

    // Wait for either the error message or the canvas to appear
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
      console.log(`[${id}] Skipped: Error or missing PDB structure`);
      return {
        id,
        status: "skipped",
        reason: "Error or missing PDB structure",
      };
    }

    console.log(`[${id}] Taking screenshot`);
    const canvas = await page.$("#viewer canvas");
    const imageBuffer = await canvas.screenshot({
      type: "png",
      omitBackground: true,
    });

    console.log(`[${id}] Saving images`);
    await fs.writeFile(idPath, imageBuffer);
    await fs.writeFile(aliasPath, imageBuffer);

    console.log(`[${id}] Success: Images saved`);
    return { id, status: "success", alias };
  } catch (error) {
    console.error(`[${id}] Error: ${error.message}`);
    return { id, status: "error", error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

if (isMainThread) {
  async function main() {
    console.log("Starting main process");
    const proteinIds = await readProteinIds();
    console.log(`Total proteins to process: ${proteinIds.length}`);
    const chunkSize = Math.ceil(proteinIds.length / numCPUs);
    const chunks = [];

    for (let i = 0; i < proteinIds.length; i += chunkSize) {
      chunks.push(proteinIds.slice(i, i + chunkSize));
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
      errors.forEach((e) => console.log(`${e.id}: ${e.error}`));
    }
  }

  main().catch(console.error);
} else {
  (async () => {
    console.log(`Worker started with ${workerData.length} proteins`);
    const results = [];
    for (const id of workerData) {
      results.push(await processProtein(id));
    }
    parentPort.postMessage(results);
    console.log(`Worker finished processing ${workerData.length} proteins`);
  })();
}
