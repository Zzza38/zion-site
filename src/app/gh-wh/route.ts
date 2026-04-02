import { exec } from "node:child_process";
import { createHmac, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export const runtime = "nodejs";

const execAsync = promisify(exec);

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

function verifyGithubSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): boolean {
  if (!signatureHeader.startsWith("sha256=")) return false;
  const expected =
    "sha256=" +
    createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const got = Buffer.from(signatureHeader, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (got.length !== want.length) return false;
  try {
    return timingSafeEqual(got, want);
  } catch {
    return false;
  }
}

function isAuthorized(rawBody: string, request: Request, secret: string): boolean {
  const sig = request.headers.get("x-hub-signature-256");
  if (sig) {
    return verifyGithubSignature(rawBody, sig, secret);
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    return timingSafeEqualString(token, secret);
  }

  const headerSecret = request.headers.get("x-webhook-secret");
  if (headerSecret) {
    return timingSafeEqualString(headerSecret, secret);
  }

  return false;
}

export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const command = process.env.GITHUB_WEBHOOK_COMMAND;

  if (!secret || !command) {
    return Response.json(
      { error: "GITHUB_WEBHOOK_SECRET and GITHUB_WEBHOOK_COMMAND must be set" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();

  if (!isAuthorized(rawBody, request, secret)) {
    return new Response(null, { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    });
    return Response.json({ ok: true, stdout, stderr });
  } catch (err: unknown) {
    const e = err as {
      message?: string;
      stdout?: string;
      stderr?: string;
      code?: string | number | null;
    };
    return Response.json(
      {
        ok: false,
        error: e.message ?? "Command failed",
        code: e.code,
        stdout: e.stdout,
        stderr: e.stderr,
      },
      { status: 500 },
    );
  }
}
