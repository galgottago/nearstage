import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-heading text-4xl">That page is not on the map.</h1>
      <Link href="/" className={buttonVariants({ className: "mt-4" })}>
        Back to events
      </Link>
    </div>
  );
}
