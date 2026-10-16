import { timingSafeEqual } from "node:crypto";

/**
 * Guards the analytics endpoints. The PIN lives only in the server environment
 * (ANALYTICS_PIN); the client sends what the user typed in `x-analytics-pin`.
 * Files starting with "_" are not deployed as routes by Vercel.
 */
export function authorized(req, res) {
  const pin = process.env.ANALYTICS_PIN;
  if (!pin) {
    res.status(503).json({ error: "ANALYTICS_PIN is not configured on the server" });
    return false;
  }
  const given = req.headers["x-analytics-pin"];
  const ok =
    typeof given === "string" &&
    given.length === pin.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(pin));
  if (!ok) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
