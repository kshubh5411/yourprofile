import { Biodata } from "../types";

interface TranslateEnhancePayload {
  data: Biodata;
  targetLanguage: string;
}

export async function translateAndEnhance(
  data: Biodata,
  targetLanguage: string
): Promise<Biodata> {
  const response = await fetch("/api/translate-enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, targetLanguage } satisfies TranslateEnhancePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to translate and enhance biodata");
  }

  return (await response.json()) as Biodata;
}

export async function generateSummary(data: Biodata): Promise<string> {
  const response = await fetch("/api/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to generate summary");
  }

  const payload = (await response.json()) as { summary?: string };
  return payload.summary || "";
}

export async function generatePartnerPreferences(data: Biodata): Promise<string> {
  const response = await fetch("/api/generate-partner-preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to generate partner preferences");
  }

  const payload = (await response.json()) as { summary?: string };
  return payload.summary || "";
}
