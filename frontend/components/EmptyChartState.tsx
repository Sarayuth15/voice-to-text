export function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
      {message}
    </div>
  );
}
