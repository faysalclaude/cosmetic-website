export type OnlineMethod = "toss" | "kakao" | "naver" | "card";

export const ONLINE_METHODS: OnlineMethod[] = ["toss", "kakao", "naver", "card"];

export const isOnlineMethod = (m: string): m is OnlineMethod =>
  (ONLINE_METHODS as string[]).includes(m);

const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

// Each variable is written out in full so Next.js can inline it into the browser bundle.
const CHANNEL_KEYS: Record<OnlineMethod, string | undefined> = {
  toss: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TOSS,
  kakao: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_KAKAO,
  naver: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_NAVER,
  card: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD,
};

export const isOnlineMethodEnabled = (m: OnlineMethod) =>
  Boolean(STORE_ID && CHANNEL_KEYS[m]);

const PROVIDERS = {
  toss: "EASY_PAY_PROVIDER_TOSSPAY",
  kakao: "EASY_PAY_PROVIDER_KAKAOPAY",
  naver: "EASY_PAY_PROVIDER_NAVERPAY",
} as const;

type PayArgs = {
  method: OnlineMethod;
  orderNo: string;
  total: number;
  orderName: string;
  recipient: string;
  phone: string;
  email?: string;
  locale: string;
};

export type PayResult = { ok: true; paymentId: string } | { ok: false; message: string };

export async function requestOnlinePayment(a: PayArgs): Promise<PayResult> {
  const channelKey = CHANNEL_KEYS[a.method];
  if (!STORE_ID || !channelKey) {
    return { ok: false, message: "This payment method is not available yet." };
  }

  // loaded only when needed (keeps the browser SDK out of server rendering)
  const { default: PortOne } = await import("@portone/browser-sdk/v2");

  // the order number is the prefix, so the server can always find the order
  const paymentId = `${a.orderNo}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  const prefix = a.locale === "en" ? "/en" : "";

  const common = {
    storeId: STORE_ID,
    channelKey,
    paymentId,
    orderName: a.orderName.slice(0, 100),
    totalAmount: a.total,
    currency: "CURRENCY_KRW" as const,
    redirectUrl: `${window.location.origin}${prefix}/payment/complete?orderNo=${a.orderNo}`,
    customer: {
      fullName: a.recipient,
      phoneNumber: a.phone,
      ...(a.email ? { email: a.email } : {}),
    },
  };

  try {
    const response =
      a.method === "card"
        ? await PortOne.requestPayment({ ...common, payMethod: "CARD" })
        : await PortOne.requestPayment({
            ...common,
            payMethod: "EASY_PAY",
            easyPay: { easyPayProvider: PROVIDERS[a.method] },
          });

    if (!response) return { ok: false, message: "The payment did not complete." };
    if (response.code !== undefined) {
      return { ok: false, message: response.message ?? "The payment was cancelled." };
    }
    return { ok: true, paymentId };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "The payment failed." };
  }
}