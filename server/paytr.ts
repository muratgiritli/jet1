import crypto from "crypto";

const PAYTR_API = "https://www.paytr.com/odeme/api/get-token";

export interface PaytrInitParams {
  merchantOid: string;
  email: string;
  paymentAmount: number;
  userName: string;
  userAddress: string;
  userPhone: string;
  userBasket: Array<[string, string, number]>;
  userIp: string;
  okUrl: string;
  failUrl: string;
  testMode?: 0 | 1;
  noInstallment?: 0 | 1;
  maxInstallment?: number;
  currency?: "TL" | "EUR" | "USD" | "GBP" | "RUB";
}

export interface PaytrInitResult {
  status: "success" | "failed";
  token?: string;
  reason?: string;
}

export function getPaytrCredentials() {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error("PayTR kimlik bilgileri eksik. Lütfen sistem yöneticinize bildirin.");
  }
  return { merchantId, merchantKey, merchantSalt };
}

export async function createPaytrToken(params: PaytrInitParams): Promise<PaytrInitResult> {
  const { merchantId, merchantKey, merchantSalt } = getPaytrCredentials();
  const payment_amount = Math.round(params.paymentAmount * 100);
  const user_basket = Buffer.from(JSON.stringify(params.userBasket)).toString("base64");
  const test_mode = String(params.testMode ?? 0);
  const no_installment = String(params.noInstallment ?? 0);
  const max_installment = String(params.maxInstallment ?? 0);
  const currency = params.currency ?? "TL";

  const hashStr =
    merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    String(payment_amount) +
    user_basket +
    no_installment +
    max_installment +
    currency +
    test_mode;
  const paytr_token = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: String(payment_amount),
    paytr_token,
    user_basket,
    debug_on: "1",
    no_installment,
    max_installment,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: params.okUrl,
    merchant_fail_url: params.failUrl,
    timeout_limit: "30",
    currency,
    test_mode,
    lang: "tr",
  });

  const res = await fetch(PAYTR_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await res.json();
  if (data.status === "success") {
    return { status: "success", token: data.token };
  }
  return { status: "failed", reason: data.reason || "Bilinmeyen hata" };
}

export function verifyPaytrCallbackHash(body: any): boolean {
  try {
    const { merchantKey, merchantSalt } = getPaytrCredentials();
    const { merchant_oid, status, total_amount, hash } = body;
    if (!merchant_oid || !status || !total_amount || !hash) return false;
    const expected = crypto
      .createHmac("sha256", merchantKey)
      .update(merchant_oid + merchantSalt + status + total_amount)
      .digest("base64");
    return expected === hash;
  } catch {
    return false;
  }
}

export function generateMerchantOid(orderId: number): string {
  const ts = Date.now().toString(36);
  return `JG${orderId}${ts}`.replace(/[^A-Za-z0-9]/g, "").substring(0, 64);
}
