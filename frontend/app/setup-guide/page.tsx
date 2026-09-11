import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

const CONFIG_EXAMPLE = `{
  "USER_EMAIL": "you@company.com",
  "DB_URL": "jdbc:mysql://localhost:3306/monitor_claude_usage",
  "DB_USERNAME": "root",
  "DB_PASSWORD": "your-mysql-password",
  "APP_ENCRYPTION_SECRET": "base64-32-byte-secret"
}`;

export default function SetupGuidePage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Setup guide</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        There&apos;s no login - this dashboard is a single instance for you (or your team) to
        run yourselves. Everything here is one-time setup.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <Step number={1} title="Get an Anthropic Admin API key">
          <p>
            You need an <strong>Admin API key</strong> (starts with{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
              sk-ant-admin...
            </code>
            ), which requires the organization admin role - a regular API key won&apos;t work for
            pulling usage/cost data. Create one at{" "}
            <a
              href="https://console.anthropic.com/settings/admin-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-900 underline dark:text-zinc-50"
            >
              console.anthropic.com → Settings → Admin Keys
            </a>
            .
          </p>
        </Step>

        <Step number={2} title="Create the database">
          <p>The backend stores synced usage/cost data in MySQL.</p>
          <CodeBlock code="CREATE DATABASE monitor_claude_usage;" />
        </Step>

        <Step number={3} title="Configure the backend">
          <p>
            Set these as environment variables wherever you start the backend (your shell,
            IDE run config, systemd unit, Docker Compose, etc.) - shown here as one block
            just to make copying easier:
          </p>
          <CodeBlock code={CONFIG_EXAMPLE} language="json" />
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <code className="font-mono text-xs">USER_EMAIL</code> is optional and purely
              cosmetic - it just labels the sidebar, since there&apos;s no login to derive a
              name from.
            </li>
            <li>
              <code className="font-mono text-xs">APP_ENCRYPTION_SECRET</code> encrypts your
              Anthropic key at rest. Generate one with{" "}
              <code className="font-mono text-xs">openssl rand -base64 32</code>.
            </li>
            <li>Leave any of these unset to fall back to the local-dev defaults in <code className="font-mono text-xs">application.yaml</code>.</li>
          </ul>
        </Step>

        <Step number={4} title="Run the backend">
          <CodeBlock code={"cd backend\n./mvnw spring-boot:run"} />
        </Step>

        <Step number={5} title="Run the frontend">
          <p>
            In <code className="font-mono text-xs">frontend/.env.local</code>, point{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_API_BASE_URL</code> at the backend
            (default <code className="font-mono text-xs">http://localhost:8080</code>), then:
          </p>
          <CodeBlock code={"cd frontend\nnpm install\nnpm run dev"} />
        </Step>

        <Step number={6} title="Add your API key" last>
          <p>
            Open{" "}
            <Link href="/configuration" className="font-medium text-zinc-900 underline dark:text-zinc-50">
              Configuration
            </Link>{" "}
            and paste in the Admin API key from step 1. The first sync happens right away;
            after that it runs hourly, and you can always trigger one manually from that page.
          </p>
        </Step>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
  last = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
          {number}
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-800" />}
      </div>
      <div className="flex-1 pb-2">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
        <div className="mt-2 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string; language?: string }) {
  return (
    <div className="relative mt-2 overflow-x-auto rounded-md bg-zinc-900 dark:bg-black">
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
      <pre className="px-4 py-3 pr-16 text-xs leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
