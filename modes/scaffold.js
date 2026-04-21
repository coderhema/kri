import readline from "readline";
import { renderSoul, writeSoulFile } from "../core/soul-writer.js";

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(q, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

export async function initScaffold({ cwd }) {
  const systemName = await ask("What is this system called? ");
  const purpose = await ask("What is this system for? ");
  const whoIServe = await ask("Who will use it? ");
  const platform = await ask("What platforms will it run on? ");
  const mustNeverDo = await ask("What should it never do? ");
  const personality = await ask("What personality/tone should it have? ");

  const soul = renderSoul({
    systemName,
    whatIAm: "I am a newly born agentic system.",
    purpose,
    canDo: "I can learn, plan, and act within my defined capabilities.",
    whoIServe,
    mustNeverDo,
    platform,
    personality
  });

  await writeSoulFile(cwd, soul);
  console.log("kri: soul.md generated (scaffold)");
}
