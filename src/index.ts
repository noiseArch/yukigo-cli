import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { YukigoParser } from "yukigo-core";
import { YukigoHaskellParser } from "yukigo-haskell-parser";
import {
  ASTAnalyzer,
  InspectionRule,
  translateMulangToInspectionRules,
} from "yukigo";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: yukigo analyse <filepath> [options]")
  .option("e", {
    alias: "expectations",
    describe: "Path to expectations file",
    type: "string",
    demandOption: true,
  })
  .option("l", {
    alias: "language",
    describe: "Language to parse",
    type: "string",
    demandOption: true,
  })
  .option("o", {
    alias: "output",
    describe: "Path to output JSON file",
    type: "string",
  })
  .option("m", {
    alias: "mulang",
    describe: "Use mulang-format expectations",
    type: "boolean",
    default: false,
  })
  .option("p", {
    alias: "pretty",
    describe: "Pretty format the output",
    type: "boolean",
    default: false,
  })
  .demandCommand(1, "You must provide a file to analyse")
  .help()
  .parseSync();

const filePath = argv._[0] as string;
const code = fs.readFileSync(filePath, "utf-8");

const parsers: { [key: string]: YukigoParser } = {
  haskell: new YukigoHaskellParser(),
};
const parser: YukigoParser = parsers[argv.l];
const ast = parser.parse(code);

fs.writeFileSync("./ast.json", JSON.stringify(ast, null, 2));

console.log(parser.errors);

const analyzer = new ASTAnalyzer(ast);

let expectations: InspectionRule[];
if (argv.e) {
  const expectationsContent = fs.readFileSync(argv.e, "utf-8");
  expectations = argv.m
    ? translateMulangToInspectionRules(expectationsContent)
    : JSON.parse(expectationsContent);
} else {
  throw Error("You must provide an expectations file with -e");
}
fs.writeFileSync("./ast.json", JSON.stringify(ast, null, 2));

const analysisResults = analyzer.analyze(expectations);

if (argv.o) {
  fs.writeFileSync(argv.o, JSON.stringify(analysisResults, null, 2));
} else {
  if (argv.p) {
    analysisResults.forEach((result) => {
      console.log(
        `Rule: ${result.rule.inspection} (Target: ${
          result.rule.args ? result.rule.args.name : "N/A"
        })`
      );
      console.log(
        `  Expected: ${result.rule.expected}, Actual: ${result.actual}`
      );
      console.log(`  Passed: ${result.passed ? "✅" : "❌"}`);
      console.log("---");
    });
  } else {
    console.log(analysisResults);
  }
}
