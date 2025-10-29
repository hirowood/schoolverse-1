import { Page, expect } from "@playwright/test";

type Creds = { email: string; password: string };

export async function signInViaUI(page: Page, { email, password }: Creds) {
  await page.goto("/login");
  await page.getByLabel(/メールアドレス|email/i).fill(email);
  await page.getByLabel(/パスワード|password/i).fill(password);
  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.getByRole("button", { name: /ログイン|sign in/i }).click(),
  ]);

  // Mint socket token cookie for RT server auth
  const resp = await page.request.get("/api/auth/socket-token");
  expect(resp.ok()).toBeTruthy();

  // Verify session cookie exists
  const cookies = await page.context().cookies();
  const hasSession = cookies.some((c) => c.name.includes("next-auth.session-token"));
  expect(hasSession).toBeTruthy();
}

