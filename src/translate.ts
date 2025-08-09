import yargs from "yargs";
import fs from "fs";
import { hideBin } from "yargs/helpers";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import { YukigoParser } from "yukigo-core";
import { Translator } from "yukigo";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: yukigo analyse <filepath> [options]")
  .demandCommand(1, "You must provide a file to analyse")
  .help()
  .parseSync();

const filePath = argv._[0] as string;
const code = fs.readFileSync(filePath, "utf-8");

const parser: YukigoParser = new YukigoHaskellParser();
const ast = parser.parse(code);
fs.writeFileSync("./ast.json", JSON.stringify(ast, null, 2));
const translator = new Translator(ast);
const tsCode = translator.translate();
console.log(tsCode);
