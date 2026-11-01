import "server-only";
import { createHash } from "node:crypto";
import { serviceClient } from "./supabase/server";
export async function findOwnedOrder(capability: string | undefined) {
  const parts = capability?.split(".");
  if (
    parts?.length !== 2 ||
    !/^[a-f0-9-]{36}$/.test(parts[0]) ||
    !/^[a-f0-9]{64}$/.test(parts[1])
  )
    return null;
  const { data } = await serviceClient()
    .from("orders")
    .select("payment_status,total_minor,created_at")
    .eq("id", parts[0])
    .eq("access_hash", createHash("sha256").update(parts[1]).digest("hex"))
    .maybeSingle();
  return data && Date.now() - new Date(data.created_at).getTime() < 86400000
    ? data
    : null;
}
