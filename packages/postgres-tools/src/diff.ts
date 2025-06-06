import path from 'node:path';

import chalk from 'chalk';
import { structuredPatch } from 'diff';
import fs from 'fs-extra';
import _ from 'lodash';

import { describeDatabase, formatDatabaseDescription } from './describe.js';

interface DatabaseInfo {
  type: 'database';
  name: string;
}

interface DirectoryInfo {
  type: 'directory';
  path: string;
}

type DiffTarget = DatabaseInfo | DirectoryInfo;

interface DiffOptions {
  coloredOutput?: boolean;
}

interface Description {
  tables: Record<string, string>;
  enums: Record<string, string>;
}

async function diff(db1: DiffTarget, db2: DiffTarget, options: DiffOptions): Promise<string> {
  function formatText(text: string, formatter?: ((s: string) => string) | null): string {
    if (options.coloredOutput && formatter) {
      return formatter(text);
    }
    return text;
  }

  const db2Name = db2.type === 'database' ? db2.name : db2.path;
  const db2NameBold = formatText(db2Name, chalk.bold);

  let result = '';

  const description1 = await loadDescription(db1);
  const description2 = await loadDescription(db2);

  // Determine if both databases have the same tables
  const tablesMissingFrom1 = _.difference(
    Object.keys(description2.tables),
    Object.keys(description1.tables),
  );
  const tablesMissingFrom2 = _.difference(
    Object.keys(description1.tables),
    Object.keys(description2.tables),
  );

  if (tablesMissingFrom1.length > 0) {
    result += formatText(`Tables added to ${db2NameBold} (${db2.type})\n`, chalk.underline);
    result += formatText(
      tablesMissingFrom1.map((table) => `+ ${table}`).join('\n') + '\n\n',
      chalk.green,
    );
  }

  if (tablesMissingFrom2.length > 0) {
    result += formatText(`Tables missing from ${db2NameBold} (${db2.type})\n`, chalk.underline);
    result += formatText(
      tablesMissingFrom2.map((table) => `- ${table}`).join('\n') + '\n\n',
      chalk.red,
    );
  }

  // Determine if both databases have the same enums
  const enumsMissingFrom1 = _.difference(
    Object.keys(description2.enums),
    Object.keys(description1.enums),
  );
  const enumsMissingFrom2 = _.difference(
    Object.keys(description1.enums),
    Object.keys(description2.enums),
  );

  if (enumsMissingFrom1.length > 0) {
    result += formatText(`Enums added to ${db2NameBold} (${db1.type})\n`, chalk.underline);
    result += formatText(
      enumsMissingFrom1.map((enumName) => `+ ${enumName}`).join('\n') + '\n\n',
      chalk.green,
    );
  }

  if (enumsMissingFrom2.length > 0) {
    result += formatText(`Enums missing from ${db2NameBold} (${db2.type})\n`, chalk.underline);
    result += formatText(
      enumsMissingFrom2.map((enumName) => `- ${enumName}`).join('\n') + '\n\n',
      chalk.red,
    );
  }

  // Determine if the columns of any table differ
  const intersection = _.intersection(
    Object.keys(description1.tables),
    Object.keys(description2.tables),
  );
  for (const table of intersection) {
    const patch = structuredPatch(
      `tables/${table}`,
      `tables/${table}`,
      description1.tables[table],
      description2.tables[table],
    );

    if (patch.hunks.length === 0) continue;

    const boldTable = formatText(table, chalk.bold);
    result += formatText(`Differences in ${boldTable} table\n`, chalk.underline);

    patch.hunks.forEach((hunk, index) => {
      if (index !== 0) {
        result += formatText('...\n', chalk.gray);
      }
      hunk.lines.forEach((line) => {
        const color = line[0] === '+' ? chalk.green : line[0] === '-' ? chalk.red : null;
        result += formatText(line, color);
        result += '\n';
      });
    });

    result += '\n\n';
  }

  // Determine if the values of any enums differ
  const enumsIntersection = _.intersection(
    Object.keys(description1.enums),
    Object.keys(description2.enums),
  );
  for (const enumName of enumsIntersection) {
    // We don't need to do a particularly fancy diff here, since
    // enums are just represented here as strings
    if (description1.enums[enumName].trim() !== description2.enums[enumName].trim()) {
      const boldEnum = formatText(enumName, chalk.bold);
      result += formatText(`Differences in ${boldEnum} enum\n`);
      result += formatText(`- ${description1.enums[enumName].trim()}\n`, chalk.red);
      result += formatText(`+ ${description2.enums[enumName].trim()}\n`, chalk.green);
      result += '\n\n';
    }
  }

  return result;
}

async function loadDescriptionFromDisk(dirPath: string): Promise<Description> {
  const description: Description = {
    tables: {},
    enums: {},
  };

  const tables = await fs.readdir(path.join(dirPath, 'tables'));
  for (const table of tables) {
    const data = await fs.readFile(path.join(dirPath, 'tables', table), 'utf8');
    description.tables[table.replace('.pg', '')] = data;
  }

  const enums = await fs.readdir(path.join(dirPath, 'enums'));
  for (const enumName of enums) {
    const data = await fs.readFile(path.join(dirPath, 'enums', enumName), 'utf8');
    description.enums[enumName.replace('.pg', '')] = data;
  }

  return description;
}

async function loadDescriptionFromDatabase(name: string) {
  const description = await describeDatabase(name);
  return formatDatabaseDescription(description, { coloredOutput: false });
}

async function loadDescription(db: DiffTarget): Promise<Description> {
  if (db.type === 'database') {
    return loadDescriptionFromDatabase(db.name);
  } else if (db.type === 'directory') {
    return loadDescriptionFromDisk(db.path);
  } else {
    throw new Error('Invalid database type');
  }
}

export async function diffDatabases(database1: string, database2: string, options: DiffOptions) {
  return diff(
    {
      type: 'database',
      name: database1,
    },
    {
      type: 'database',
      name: database2,
    },
    options,
  );
}

export async function diffDatabaseAndDirectory(
  database: string,
  directory: string,
  options: DiffOptions,
) {
  return diff(
    {
      type: 'database',
      name: database,
    },
    {
      type: 'directory',
      path: directory,
    },
    options,
  );
}

export async function diffDirectoryAndDatabase(
  directory: string,
  database: string,
  options: DiffOptions,
) {
  return diff(
    {
      type: 'directory',
      path: directory,
    },
    {
      type: 'database',
      name: database,
    },
    options,
  );
}

export async function diffDirectories(
  directory1: string,
  directory2: string,
  options: DiffOptions,
) {
  return diff(
    {
      type: 'directory',
      path: directory1,
    },
    {
      type: 'directory',
      path: directory2,
    },
    options,
  );
}
