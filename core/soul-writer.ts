import fs from "fs/promises";
import path from "path";

export function renderSoul({
  systemName,
  whatIAm,
  purpose,
  canDo,
  whoIServe,
  mustNeverDo,
  platform,
  personality
}) {
  return `# Soul — ${systemName}

## What I am
${whatIAm}

## My purpose
${purpose}

## What I can do
${canDo}

## Who I serve
${whoIServe}

## What I must never do
${mustNeverDo}

## My platform
${platform}

## My personality
${personality}
`;
}

export async function writeSoulFile(cwd, soulContent) {
  const filePath = path.join(cwd, "soul.md");
  await fs.writeFile(filePath, soulContent, "utf8");
  return filePath;
}
