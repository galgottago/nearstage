import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PostsScreen } from "@/components/posts/posts-screen";

export const metadata: Metadata = { title: "Videos" };

export default function PostsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading videos…</p>}>
      <PostsRoute />
    </Suspense>
  );
}

async function PostsRoute() {
  await connection();
  return <PostsScreen nowIso={new Date().toISOString()} />;
}
