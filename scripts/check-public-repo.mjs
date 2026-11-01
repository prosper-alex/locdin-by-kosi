import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const findings = [];
const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "GitHub token",
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  ],
  [
    "provider secret",
    /\b(?:sk_(?:live|test)_|sb_secret_)[A-Za-z0-9_\-]{16,}\b/,
  ],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  [
    "JWT credential",
    /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,
  ],
];
for (const file of files) {
  if (/(^|\/)\.env(?:\..*)?$/.test(file) && file !== ".env.example") {
    findings.push({ file, issue: "environment file is tracked" });
  }
  if (
    !/\.(?:[cm]?[jt]sx?|json|md|sql|toml|ya?ml|example|gitignore|nvmrc|css)$/.test(
      file,
    )
  )
    continue;
  const content = readFileSync(file, "utf8");
  for (const [issue, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push({ file, issue });
  }
}
if (findings.length) {
  console.error(
    JSON.stringify({ checkedFiles: files.length, findings }, null, 2),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${files.length} tracked files: no credential patterns or private environment files found.`,
  );
}
