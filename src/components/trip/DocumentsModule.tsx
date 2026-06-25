import { Text, View } from "react-native";

import { Card } from "@/components/ui";
import { CheckRow } from "./CheckRow";
import { ProgressBar } from "./ProgressBar";
import { useTripStore } from "@/store/useTripStore";
import { docProgress } from "@/utils/tripStats";

export function DocumentsModule({ tripId }: { tripId: string }) {
  const trip = useTripStore((s) => s.trips.find((t) => t.id === tripId));
  const toggleDoc = useTripStore((s) => s.toggleDoc);
  if (!trip) return null;
  const docs = trip.documents ?? [];
  const core = docs.filter((d) => d.folder === "core");
  const backup = docs.filter((d) => d.folder === "backup");
  const p = docProgress(docs);

  return (
    <View>
      <Card className="mb-3 p-4">
        <ProgressBar pct={p.pct} label={`Folder ready · ${p.done}/${p.total}`} />
      </Card>
      <Folder title="Core visa folder" tripId={tripId} items={core} toggle={toggleDoc} />
      <Folder title="Backup folder" tripId={tripId} items={backup} toggle={toggleDoc} />
    </View>
  );
}

function Folder({
  title,
  tripId,
  items,
  toggle,
}: {
  title: string;
  tripId: string;
  items: { id: string; label: string; checked: boolean }[];
  toggle: (tripId: string, docId: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <Card className="mb-3 px-4 py-2">
      <Text className="py-2 text-[12px] font-bold uppercase text-ink-400">{title}</Text>
      {items.map((d) => (
        <CheckRow
          key={d.id}
          label={d.label}
          checked={d.checked}
          onToggle={() => toggle(tripId, d.id)}
        />
      ))}
    </Card>
  );
}
