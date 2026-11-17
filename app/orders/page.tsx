import type { Metadata } from "next";
import { OrdersScreen } from "@/components/tickets/orders-screen";

export const metadata: Metadata = { title: "Demo tickets" };

export default function OrdersPage() {
  return <OrdersScreen />;
}
