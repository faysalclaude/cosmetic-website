"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { selectSubtotal, useCartStore } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { useAuthUser } from "@/lib/use-auth-user";
import { siteConfig } from "@/lib/site";
import { formatKRW, loc, shippingFor } from "@/lib/utils";
import { placeOrderAction } from "@/lib/actions/orders";
import ProductVisual from "@/components/product/ProductVisual";

type DaumResult = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumResult) => void }) => { open: () => void };
    };
  }
}

const POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadPostcodeScript(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${POSTCODE_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("postcode")));
      return;
    }
    const script = document.createElement("script");
    script.src = POSTCODE_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("postcode"));
    document.head.appendChild(script);
  });
}

const METHODS = [
  { id: "bank_transfer", key: "bankTransfer", enabled: true },
  { id: "toss", key: "toss", enabled: false },
  { id: "kakao", key: "kakao", enabled: false },
  { id: "naver", key: "naver", enabled: false },
  { id: "card", key: "card", enabled: false },
] as const;

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand read-only:bg-cream";

export default function CheckoutForm() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const mounted = useMounted();
  const { user, loading } = useAuthUser();

  const { items, clear } = useCartStore();
  const storedSubtotal = useCartStore(selectSubtotal);

  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [memo, setMemo] = useState("");
  const [depositor, setDepositor] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<{ code: string; detail?: string } | null>(null);

  // load the address-search script early so the popup opens right when the button is clicked
  useEffect(() => {
    loadPostcodeScript().catch(() => {});
  }, []);

  const list = mounted ? items : [];
  const subtotal = mounted ? storedSubtotal : 0;
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  function searchAddress() {
    if (!window.daum?.Postcode) {
      setError({ code: "postcodeUnavailable" });
      loadPostcodeScript().catch(() => {});
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setPostcode(data.zonecode);
        setAddress1(data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress);
        setError(null);
      },
    }).open();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result = await placeOrderAction({
      items: list.map((i) => ({ productId: i.product.id, qty: i.qty })),
      method: "bank_transfer",
      recipient,
      phone,
      postcode,
      address1,
      address2,
      memo,
      depositor,
      agree,
    });

    if (!result.ok) {
      setBusy(false);
      setError({ code: result.error, detail: result.detail });
      return;
    }

    setPlaced(true);
    clear();
    router.push(`/orders/${result.orderNo}?placed=1`);
  }

  function errorText() {
    if (!error) return null;
    const key = `errors.${error.code}`;
    const name = error.detail
      ? (error.detail.split("|")[locale === "en" ? 1 : 0] ?? error.detail)
      : "";
    return t.has(key) ? t(key, { name }) : t("errors.generic");
  }

  if (placed) {
    return <div className="container-page py-24 text-center text-muted">{t("placing")}</div>;
  }

  if (!loading && !user) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("loginRequired")}</p>
        <Link
          href="/login?next=/checkout"
          className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("login")}
        </Link>
      </div>
    );
  }

  if (mounted && list.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("emptyCart")}</p>
        <Link
          href="/product-list"
          className="mt-6 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {t("continue")}
        </Link>
      </div>
    );
  }

  const message = errorText();

  return (
    <form onSubmit={onSubmit} className="container-page py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t("title")}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-line bg-white p-6 md:p-8">
            <h2 className="mb-6 text-lg font-semibold">{t("shippingInfo")}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium">
                {t("recipient")}
                <input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  autoComplete="name"
                  className={inputClass}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                {t("phone")}
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  className={inputClass}
                  required
                />
              </label>

              <div className="md:col-span-2">
                <span className="block text-sm font-medium">{t("postcode")}</span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    value={postcode}
                    readOnly
                    placeholder="00000"
                    className={`${inputClass} !mt-0 max-w-40`}
                    required
                  />
                  <button
                    type="button"
                    onClick={searchAddress}
                    className="rounded-xl border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-white"
                  >
                    {t("searchAddress")}
                  </button>
                </div>
              </div>

              <label className="block text-sm font-medium md:col-span-2">
                {t("address1")}
                <input value={address1} readOnly className={inputClass} required />
              </label>
              <label className="block text-sm font-medium md:col-span-2">
                {t("address2")}
                <input
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-medium md:col-span-2">
                {t("memo")}
                <input
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  list="memo-presets"
                  placeholder={t("memoPlaceholder")}
                  className={inputClass}
                />
                <datalist id="memo-presets">
                  <option value={t("memo1")} />
                  <option value={t("memo2")} />
                  <option value={t("memo3")} />
                </datalist>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white p-6 md:p-8">
            <h2 className="mb-6 text-lg font-semibold">{t("payment")}</h2>
            <div className="space-y-3">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-sm ${
                    m.enabled ? "border-brand bg-brand-soft/40" : "border-line opacity-50"
                  }`}
                >
                  <span className="flex items-center gap-3 font-medium">
                    <input
                      type="radio"
                      name="method"
                      checked={m.enabled}
                      disabled={!m.enabled}
                      readOnly
                      className="accent-[var(--color-brand)]"
                    />
                    {t(m.key)}
                  </span>
                  {!m.enabled && <span className="text-xs">{t("soon")}</span>}
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-5 text-sm">
              <p className="text-muted">{t("bankGuide")}</p>
              <label className="mt-4 block font-medium">
                {t("depositor")}
                <input
                  value={depositor}
                  onChange={(e) => setDepositor(e.target.value)}
                  className={inputClass}
                />
                <span className="mt-1 block text-xs font-normal text-muted">{t("depositorHint")}</span>
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-semibold">{t("summary")}</h2>

          <ul className="mb-5 divide-y divide-line">
            {list.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-3 py-3">
                <ProductVisual
                  tint={product.tint}
                  accent={product.accent}
                  label={loc(product.name, locale)}
                  src={product.images[0]}
                  className="h-16 w-16 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-2 font-medium">{loc(product.name, locale)}</p>
                  <p className="mt-1 text-muted">
                    {formatKRW(product.price, locale)} × {qty}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatKRW(product.price * qty, locale)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t("subtotal")}</dt>
              <dd>{formatKRW(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd>{shipping === 0 ? t("free") : formatKRW(shipping, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-bold">
              <dt>{t("total")}</dt>
              <dd className="text-brand">{formatKRW(total, locale)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">
            {t("freeFrom", { amount: formatKRW(siteConfig.shipping.freeOver, locale) })}
          </p>

          <label className="mt-6 flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 accent-[var(--color-brand)]"
            />
            <span>{t("agree")}</span>
          </label>

          {message && (
            <p role="alert" className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-dark">
              {message}
            </p>
          )}

          <button
            disabled={busy}
            className="mt-5 w-full rounded-full bg-brand py-3.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? t("placing") : t("placeOrder")}
          </button>
        </aside>
      </div>
    </form>
  );
}