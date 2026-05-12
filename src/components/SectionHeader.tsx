import type { ReactNode } from "react";

export type SectionHeaderProps = {
  title: string;
  /** Sets `id` on the title element for `aria-labelledby`. */
  titleId?: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({
  title,
  titleId,
  subtitle,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0 border-l-2 border-violet-500/45 pl-3.5 sm:pl-4">
        <h3
          {...(titleId ? { id: titleId } : {})}
          className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-[1.65rem]"
        >
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="shrink-0 self-start pt-0.5 sm:self-auto sm:pt-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
