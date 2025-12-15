import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

/**
 * Prompt the user with a question and optionally validate against allowed answers.
 * @param {string} question - The question to display
 * @param {string[] | ((answer: string) => boolean)} [acceptables=null] - Optional array of allowed answers or a validation function
 * @returns {Promise<string>} The user's answer
 */
type Acceptable = 
  | string[]
  | ((answer: string) => boolean);

export async function getAnswer(question: string, acceptables?: Acceptable) {
  const rl = readline.createInterface({ input, output });
  let answer = await rl.question(question);

  while (
    (Array.isArray(acceptables) && !acceptables.includes(answer)) ||
    (typeof acceptables === "function" && !acceptables(answer))
  ) {
    if (Array.isArray(acceptables)) {
      console.log(`acceptable answer: [${acceptables.join(", ")}]`);
    } else {
      console.log("answer did not pass validation, try again");
    }
    answer = await rl.question("try again: ");
  }

  rl.close();
  return answer;
}
