import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import readline from 'readline';
import path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROTEIN_INFO_FILENAME = '9606.protein.info.v12.0.txt';
const PROTEIN_ENRICHMENT_TERM_FILENAME = '9606.protein.enrichment.terms.v12.0.txt';
const PROTEIN_NETWORK_FILENAME = '9606.protein.links.full.v12.0.txt';

async function importProteinInfo() {
  console.log('Importing protein info...');
  const filePath = path.join(DATA_DIR, PROTEIN_INFO_FILENAME);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    if (line.startsWith('#')) continue;
    const [id, name, proteinSize, annotation] = line.split('\t');
    await prisma.protein.upsert({
      where: { id },
      update: { name, alias: name, size: proteinSize, annotation: annotation, fast_sequence: null },
      create: { id, name, alias: name, size: proteinSize, annotation: annotation, fast_sequence: null }
    });
    count++;
    if (count % 1000 === 0) console.log(`Imported ${count} proteins`);
  }
  console.log(`Finished importing ${count} proteins`);
}

async function importEnrichmentTerms() {
  console.log('Importing enrichment terms...');
  const filePath = path.join(DATA_DIR, PROTEIN_ENRICHMENT_TERM_FILENAME);
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  for await (const line of rl) {
    if (line.startsWith('#')) continue;
    const [proteinId, category, term, description] = line.split('\t');
    await prisma.enrichmentTerm.create({
      data: { proteinId, category, term, description }
    });
    count++;
    if (count % 10000 === 0) console.log(`Imported ${count} enrichment terms`);
  }
  console.log(`Finished importing ${count} enrichment terms`);
}

async function importProteinLinks() {
  console.log('Importing protein links...');
  const filePath = path.join(DATA_DIR, '9606.protein.links.full.v12.0.txt');
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;

  for await (const line of rl) {
    if (line.startsWith('protein1')) {
      continue;
    }
    
    const values = line.split(' ');
    const [protein1Id, protein2Id] = values;

    await prisma.proteinLink.createMany({
      data: [
        { proteinId: protein1Id, linkedProteinId: protein2Id },
        { proteinId: protein2Id, linkedProteinId: protein1Id }
      ],
      skipDuplicates: true
    });
    count++;
    if (count % 10000 === 0) console.log(`Imported ${count} protein links`);
  }
  console.log(`Finished importing ${count} protein links`);
}

async function main() {
  try {
    console.log('Choose which data to import:');
    console.log('1. Protein Info');
    console.log('2. Enrichment Terms');
    console.log('3. Protein Links');
    console.log('Enter the numbers of the data you want to import (comma-separated):');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('', async (answer: string) => {
      readline.close();
      const choices = answer.split(',').map(s => s.trim());

      try {
        if (choices.includes('1')) await importProteinInfo();
        if (choices.includes('2')) await importEnrichmentTerms();
        if (choices.includes('3')) await importProteinLinks();

        console.log('Data import completed successfully');
      } catch (error) {
        console.error('Error during import:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
  } catch (error) {
    console.error('Error in main function:', error);
    await prisma.$disconnect();
  }
}

main();