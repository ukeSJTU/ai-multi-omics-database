import { PrismaClient } from "@prisma/client";
import fs from "fs";
import readline from "readline";
import path from "path";

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, "..", "data");
const PROTEIN_INFO_FILENAME = "9606.protein.info.v12.0.txt";
const PROTEIN_ENRICHMENT_TERM_FILENAME =
  "9606.protein.enrichment.terms.v12.0.txt";
const FASTA_FILENAME = "9606.protein.sequences.v12.0.fa";
const PROTEIN_NETWORK_FILENAME = "9606.protein.links.full.v12.0.txt";
const PROTEIN_ALIAS_FILENAME = "9606.protein.aliases.v12.0.txt";

async function importProteinInfo() {
  console.log("Importing protein info...");
  // const filePath = path.join(DATA_DIR, PROTEIN_INFO_FILENAME);
  const proteinInfoPath = path.join(DATA_DIR, PROTEIN_INFO_FILENAME);
  const aliasPath = path.join(DATA_DIR, PROTEIN_ALIAS_FILENAME);
  const fastaPath = path.join(DATA_DIR, FASTA_FILENAME);

  // First, read aliases into a map
  const aliasMap = new Map();
  const aliasStream = fs.createReadStream(aliasPath);
  const aliasRl = readline.createInterface({
    input: aliasStream,
    crlfDelay: Infinity,
  });

  for await (const line of aliasRl) {
    if (line.startsWith("#")) continue;
    const [id, alias] = line.split("\t");
    if (!aliasMap.has(id)) {
      aliasMap.set(id, alias);
    }
  }

  // Now, import protein info
  const proteinInfoStream = fs.createReadStream(proteinInfoPath);
  const proteinInfoRl = readline.createInterface({
    input: proteinInfoStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  for await (const line of proteinInfoRl) {
    if (line.startsWith("#")) continue;
    const [id, preferredName, proteinSize, annotation] = line.split("\t");
    const alias = aliasMap.get(id) || preferredName; // Use preferred name as fallback if no alias found

    await prisma.protein.upsert({
      where: { id },
      update: {
        name: preferredName,
        alias: alias,
        size: proteinSize,
        annotation: annotation,
        fasta_sequence: null,
      },
      create: {
        id,
        name: preferredName,
        alias: alias,
        size: proteinSize,
        annotation: annotation,
        fasta_sequence: null,
      },
    });
    count++;
    if (count % 1000 === 0) console.log(`Imported ${count} proteins`);
  }
  console.log(`Finished importing ${count} proteins`);

  // Now, import FASTA sequences
  // ... (previous code remains the same)

  console.log("Importing FASTA sequences...");
  const fastaStream = fs.createReadStream(fastaPath);
  const fastaRl = readline.createInterface({
    input: fastaStream,
    crlfDelay: Infinity,
  });

  let currentId = "";
  let currentSequence = "";
  let fastaCount = 0;
  let mismatchCount = 0;

  for await (const line of fastaRl) {
    if (line.startsWith(">")) {
      // If we have a previous sequence, save it
      if (currentId && currentSequence) {
        try {
          await prisma.protein.upsert({
            where: { id: currentId },
            update: { fasta_sequence: currentSequence },
            create: {
              id: currentId,
              name: `Unknown protein ${currentId}`,
              alias: `Unknown protein ${currentId}`,
              fasta_sequence: currentSequence,
            },
          });
          fastaCount++;
        } catch (error) {
          console.error(`Error processing protein ${currentId}: ${error}`);
          mismatchCount++;
        }

        if (fastaCount % 1000 === 0)
          console.log(`Imported ${fastaCount} FASTA sequences`);
      }
      // Start a new sequence
      currentId = line.slice(1); // Extract ENSP00000000233 from >9606.ENSP00000000233
      currentSequence = "";
    } else {
      // Add to the current sequence
      currentSequence += line.trim();
    }
  }

  // Don't forget to save the last sequence
  if (currentId && currentSequence) {
    try {
      await prisma.protein.upsert({
        where: { id: currentId },
        update: { fasta_sequence: currentSequence },
        create: {
          id: currentId,
          name: `Unknown protein ${currentId}`,
          alias: `Unknown protein ${currentId}`,
          fasta_sequence: currentSequence,
        },
      });
      fastaCount++;
    } catch (error) {
      console.error(`Error processing last protein ${currentId}: ${error}`);
      mismatchCount++;
    }
  }

  console.log(`Finished importing ${fastaCount} FASTA sequences`);
  console.log(`Encountered ${mismatchCount} mismatches`);
}

async function importEnrichmentTerms() {
  console.log("Importing enrichment terms...");
  const filePath = path.join(DATA_DIR, PROTEIN_ENRICHMENT_TERM_FILENAME);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  for await (const line of rl) {
    if (line.startsWith("#")) continue;
    const [proteinId, category, term, description] = line.split("\t");
    await prisma.enrichmentTerm.create({
      data: { proteinId, category, term, description },
    });
    count++;
    if (count % 10000 === 0) console.log(`Imported ${count} enrichment terms`);
  }
  console.log(`Finished importing ${count} enrichment terms`);
}

async function importProteinLinks() {
  console.log("Importing protein links...");
  const filePath = path.join(DATA_DIR, PROTEIN_NETWORK_FILENAME);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;

  for await (const line of rl) {
    if (line.startsWith("protein1")) {
      continue;
    }

    const values = line.split(" ");
    const [protein1Id, protein2Id, ...features] = values;
    const combinedScore = parseInt(features[features.length - 1], 10);

    await prisma.proteinLink.createMany({
      data: [
        {
          proteinId: protein1Id,
          linkedProteinId: protein2Id,
          combined_score: combinedScore,
        },
        {
          proteinId: protein2Id,
          linkedProteinId: protein1Id,
          combined_score: combinedScore,
        },
      ],
      skipDuplicates: true,
    });
    count++;
    if (count % 10000 === 0) console.log(`Imported ${count} protein links`);
  }
  console.log(`Finished importing ${count} protein links`);
}

async function main() {
  try {
    console.log("Choose which data to import:");
    console.log("1. Protein Info");
    console.log("2. Enrichment Terms");
    console.log("3. Protein Links");
    console.log(
      "Enter the numbers of the data you want to import (comma-separated):"
    );

    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("", async (answer: string) => {
      readline.close();
      const choices = answer.split(",").map((s) => s.trim());

      try {
        if (choices.includes("1")) await importProteinInfo();
        if (choices.includes("2")) await importEnrichmentTerms();
        if (choices.includes("3")) await importProteinLinks();

        console.log("Data import completed successfully");
      } catch (error) {
        console.error("Error during import:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
  } catch (error) {
    console.error("Error in main function:", error);
    await prisma.$disconnect();
  }
}

main();
