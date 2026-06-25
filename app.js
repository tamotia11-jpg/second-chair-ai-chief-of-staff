const STORAGE_KEY = "second-chair-waitlist";
const PAYMENT_CHOICES = new Set(["yes", "maybe", "not-yet"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateWaitlist(input) {
  const name = clean(input.name);
  const email = clean(input.email);
  const timeSink = clean(input.timeSink);
  const errors = {};

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > 80) errors.name = "Keep your name under 80 characters.";

  if (!email || !EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid work email.";
  else if (email.length > 254) errors.email = "Keep your email under 254 characters.";

  if (!timeSink) errors.timeSink = "Tell us what takes the most time.";
  else if (timeSink.length > 500) errors.timeSink = "Keep your answer under 500 characters.";

  if (!PAYMENT_CHOICES.has(input.willingnessToPay)) {
    errors.willingnessToPay = "Choose the answer that is closest for you.";
  }
  return errors;
}

export function normalizeReferral(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 50);
}

export function createLeadRecord(input, options = {}) {
  const errors = validateWaitlist(input);
  if (Object.keys(errors).length > 0) {
    throw new Error("Cannot create an invalid waitlist record.");
  }

  const generatedId = globalThis.crypto?.randomUUID?.() ?? `lead_${Date.now()}`;
  return Object.freeze({
    id: options.id ?? generatedId,
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    timeSink: clean(input.timeSink),
    willingnessToPay: input.willingnessToPay,
    referral: normalizeReferral(options.referral ?? ""),
    createdAt: options.now ?? new Date().toISOString(),
  });
}

function readLeadRecords(storage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLeadRecord(storage, record) {
  const nextRecords = [...readLeadRecords(storage), record];
  storage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords.length;
}

export function getLeadCount(storage) {
  return readLeadRecords(storage).length;
}

function encodeFormBody(record, formName) {
  return new URLSearchParams({
    "form-name": formName,
    id: record.id,
    name: record.name,
    email: record.email,
    timeSink: record.timeSink,
    willingnessToPay: record.willingnessToPay,
    referral: record.referral,
    createdAt: record.createdAt,
  }).toString();
}

export async function submitLead(record, options = {}) {
  const endpoint = options.endpoint ?? "/api/waitlist";
  if (!endpoint) {
    const count = saveLeadRecord(options.storage ?? globalThis.localStorage, record);
    return Object.freeze({ success: true, status: "saved-locally", count });
  }

  const fetcher = options.fetcher ?? globalThis.fetch;
  const formName = options.formName ?? "early-access";
  const usesEncodedForm = options.format === "form";
  const response = await fetcher(endpoint, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": usesEncodedForm ? "application/x-www-form-urlencoded" : "application/json",
    },
    body: usesEncodedForm ? encodeFormBody(record, formName) : JSON.stringify(record),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "We could not save that yet. Please try again.");
  }
  return Object.freeze(
    Object.keys(result).length > 0 ? result : { success: true, status: "created" },
  );
}
