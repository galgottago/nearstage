import { Suspense } from "react";
import { connection } from "next/server";
import { MapExplorer } from "@/components/map/map-explorer";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
          Opening the Nearstage map…
        </div>
      }
    >
      <HomeRoute />
    </Suspense>
  );
}

async function HomeRoute() {
  await connection();
  return <MapExplorer nowIso={new Date().toISOString()} />;
}
