import { TeamCard } from "@/components/team/team-card";
import type { TeamCardData } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

/**
 * Ekip sayısına göre dengeli ızgara: 3 kişi → 3 sütun, 4 kişi → 4 sütun, 5+ → 3/4 sütun.
 * Yeni avukat eklendiğinde kod değişikliği gerekmez, düzen bozulmaz.
 */
function columns(count: number): string {
  if (count <= 1) return "sm:grid-cols-1 sm:max-w-sm";
  if (count === 2) return "sm:grid-cols-2 lg:max-w-3xl";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

export function TeamGrid({
  members,
  className,
  priorityFirst = false,
  basePath = "/ekibimiz",
  locale = "tr",
}: {
  members: TeamCardData[];
  className?: string;
  priorityFirst?: boolean;
  basePath?: string;
  locale?: Locale;
}) {
  return (
    <ul className={cn("grid grid-cols-1 gap-x-8 gap-y-14", columns(members.length), className)}>
      {members.map((m, i) => (
        <li key={m.id} className="reveal">
          <TeamCard member={m} priority={priorityFirst && i < 2} basePath={basePath} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
