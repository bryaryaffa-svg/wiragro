export type CommercialEntryStatus = "active" | "inactive";

export type CommercialScheduleWindow = {
  startsAt?: string;
  endsAt?: string;
};

export type CommercialEntryOps = {
  status: CommercialEntryStatus;
  priority: number;
  schedule?: CommercialScheduleWindow;
};

export type CommercialPublicationState = {
  startsAt: Date | null;
  endsAt: Date | null;
  isEnabled: boolean;
  isScheduled: boolean;
  isExpired: boolean;
  isLive: boolean;
};

export type CommercialQueryOptions = {
  includeInactive?: boolean;
  now?: Date;
};

function parseScheduleDate(value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp);
}

export function resolveCommercialPublicationState(
  ops: CommercialEntryOps,
  now = new Date(),
): CommercialPublicationState {
  const startsAt = parseScheduleDate(ops.schedule?.startsAt);
  const endsAt = parseScheduleDate(ops.schedule?.endsAt);
  const nowTimestamp = now.getTime();
  const hasStarted = !startsAt || startsAt.getTime() <= nowTimestamp;
  const hasEnded = Boolean(endsAt && endsAt.getTime() < nowTimestamp);
  const isEnabled = ops.status === "active";

  return {
    startsAt,
    endsAt,
    isEnabled,
    isScheduled: Boolean(isEnabled && startsAt && startsAt.getTime() > nowTimestamp),
    isExpired: Boolean(isEnabled && hasEnded),
    isLive: isEnabled && hasStarted && !hasEnded,
  };
}

export function sortCommercialEntriesByPriority<T extends { title: string; ops: CommercialEntryOps }>(
  entries: readonly T[],
) {
  return [...entries].sort((left, right) => {
    const priorityDelta = right.ops.priority - left.ops.priority;
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return left.title.localeCompare(right.title, "id-ID");
  });
}

export function filterCommercialEntries<T extends {
  title: string;
  ops: CommercialEntryOps;
  publicationState: CommercialPublicationState;
}>(
  entries: readonly T[],
  options: CommercialQueryOptions = {},
) {
  const sorted = sortCommercialEntriesByPriority(entries);

  if (options.includeInactive) {
    return sorted;
  }

  return sorted.filter((entry) => entry.publicationState.isLive);
}

