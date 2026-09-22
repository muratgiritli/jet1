export async function socialGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return res.json();
}

export async function socialSend<T>(method: string, url: string, data?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || "";
  } catch {
    return "";
  }
}
