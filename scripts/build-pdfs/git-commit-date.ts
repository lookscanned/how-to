import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// -----------------------------
// Git commit time helpers
// -----------------------------
export async function getGitCommitDateUTC(): Promise<Date> {
  const { stdout } = await execAsync("git log -1 --format=%at");
  const commitTimestamp = Number.parseInt(stdout.trim(), 10);
  return new Date(commitTimestamp * 1000);
}

// PDF Info dates are typically "D:YYYYMMDDHHmmSS+00'00'"
export function toPdfDateStringUTC(date: Date): string {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const HH = pad2(date.getUTCHours());
  const MM = pad2(date.getUTCMinutes());
  const SS = pad2(date.getUTCSeconds());
  return `D:${yyyy}${mm}${dd}${HH}${MM}${SS}+00'00'`;
}
