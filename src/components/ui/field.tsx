import { ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      )}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
