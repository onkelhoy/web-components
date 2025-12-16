import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

export async function prompt(question: string) {

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();

  return answer;
}

/**
 * Prompt the user with a question and optionally validate against allowed answers.
 * @param {string} question - The question to display
 * @param {string[] | ((answer: string) => Promise<boolean>)} [acceptables=null] - Optional array of allowed answers or a validation function
 * @returns {Promise<string>} The user's answer
 */

export async function getAnswer(question: string, acceptables: string[]): Promise<string>;
export async function getAnswer(question: string, acceptables: ((answer: string) => Promise<boolean>)): Promise<string>;
export async function getAnswer(question: string, acceptables: string[] | ((answer: string) => Promise<boolean>)) {
  const rl = readline.createInterface({ input, output });
  let answer = await rl.question(question);

  while (
    (Array.isArray(acceptables) && !acceptables.includes(answer)) ||
    (typeof acceptables === "function" && !await acceptables(answer))
  )
  {
    if (Array.isArray(acceptables))
    {
      console.log(`acceptable answer: [${acceptables.join(", ")}]`);
    } else
    {
      console.log("answer did not pass validation, try again");
    }
    answer = await rl.question("try again: ");
  }

  rl.close();
  return answer;
}


export async function getBooleanAnswer(question: string, defaultValue = false) {
  let answer = defaultValue;
  await getAnswer(question, async ans => {
    if (ans == "") 
    {
      return true;
    }

    const lower = ans.toLowerCase();
    if (lower.startsWith("y") || lower === "1" || lower.startsWith("t")) 
    {
      answer = true;
    }
    else
    {
      answer = false;
    }
    return true;
  })

  return answer;
}