import { Webhook } from "@portone/server-sdk";
import { verifyAndMarkPaid } from "@/lib/payment-server";

export async function POST(request: Request) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret is not configured", { status: 500 });

  // the raw text is needed to check the signature
  const body = await request.text();

  let webhook;
  try {
    webhook = await Webhook.verify(secret, body, Object.fromEntries(request.headers));
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (Webhook.isUnrecognizedWebhook(webhook)) return new Response("ok");

  if (webhook.type === "Transaction.Paid") {
    const paymentId = webhook.data.paymentId;
    const orderNo = paymentId.split("_")[0];
    const result = await verifyAndMarkPaid(orderNo, paymentId);
    if (!result.ok) {
      console.error("Webhook could not mark the order paid", orderNo, result.error);
      // a non-2xx answer makes PortOne retry, so only do that for temporary problems
      if (result.retryable) return new Response("Please retry", { status: 500 });
    }
  }

  return new Response("ok");
}