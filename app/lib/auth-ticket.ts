import crypto from "crypto";

/**
 * Short-lived signed HMAC ticket untuk mencegah double-bcrypt hash verification
 * pada alur login multi-langkah (verifyCredentials -> signIn).
 * TTL: 60 detik.
 */
export function createAuthTicket(userId: string, email: string): string {
  const secret = process.env.AUTH_SECRET || "default_auth_secret";
  const expiresAt = Date.now() + 60 * 1000;
  const payload = `${userId}:${email}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

export function verifyAuthTicket(ticket: string, email: string): boolean {
  try {
    const secret = process.env.AUTH_SECRET || "default_auth_secret";
    const parts = ticket.split(":");
    if (parts.length !== 4) return false;
    const [userId, ticketEmail, expiresAtStr, sig] = parts;
    if (ticketEmail.toLowerCase() !== email.toLowerCase()) return false;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${userId}:${ticketEmail}:${expiresAt}`)
      .digest("hex");
    if (sig.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

