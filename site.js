import { createLeadRecord, submitLead, validateWaitlist } from "./app.js";

document.documentElement.classList.add("js");

function valuesFromForm(form) {
  const formData = new FormData(form);
  return Object.freeze({
    name: formData.get("name"),
    email: formData.get("email"),
    timeSink: formData.get("timeSink"),
    willingnessToPay: formData.get("willingnessToPay"),
  });
}

function chooseSubmissionMode(form) {
  if (form.dataset.submission) return form.dataset.submission;
  const protocol = globalThis.location?.protocol ?? "";
  const host = globalThis.location?.hostname ?? "";
  if (protocol === "file:") return "local";
  if (host === "localhost" || host === "127.0.0.1") return "api";
  if (host.endsWith(".netlify.app")) return "netlify";
  return "formsubmit";
}

function submissionOptions(form) {
  const mode = chooseSubmissionMode(form);
  if (mode === "formsubmit") {
    const endpoint = form.dataset.emailEndpoint ?? "https://formsubmit.co/ajax/5314e64e01876e4fc50536f4b2f70e33";
    return Object.freeze({
      endpoint,
      format: "email",
    });
  }
  if (mode === "netlify") {
    return Object.freeze({
      endpoint: "/",
      format: "form",
      formName: form.getAttribute("name") ?? "early-access",
    });
  }
  if (mode === "local") return Object.freeze({ endpoint: "" });
  return Object.freeze({ endpoint: "/api/waitlist" });
}

function clearErrors(form) {
  form.querySelectorAll("[data-error-for]").forEach((element) => {
    element.textContent = "";
  });
  form.querySelectorAll("[aria-invalid='true']").forEach((element) => {
    element.removeAttribute("aria-invalid");
  });
}

function showErrors(form, errors) {
  Object.entries(errors).forEach(([field, message]) => {
    const error = form.querySelector(`[data-error-for="${field}"]`);
    if (error) error.textContent = message;
    const control = form.elements.namedItem(field);
    if (control instanceof RadioNodeList) {
      [...control].forEach((radio) => radio.setAttribute("aria-invalid", "true"));
    } else {
      control?.setAttribute("aria-invalid", "true");
    }
  });
  form.querySelector("[aria-invalid='true']")?.focus();
}

function successCopy(status) {
  if (status === "already-joined") return "You’re already on the list. We’ll be in touch with pilot details.";
  if (status === "emailed") return "Your request was sent by email. We’ll be in touch with the next steps and concierge pilot details.";
  if (status === "saved-locally") return "Saved in this browser for local testing. Use the public website to send the request by email.";
  return "You’re on the list. We’ll be in touch with the next steps and concierge pilot details.";
}

function setStatus(region, modifier, title, message) {
  const heading = document.createElement("strong");
  const detail = document.createElement("span");
  heading.textContent = title;
  detail.textContent = message;
  region.className = `form-status form-status--${modifier}`;
  region.replaceChildren(heading, detail);
  region.hidden = false;
  region.focus();
}

function setupForm() {
  const form = document.querySelector("#waitlist-form");
  const statusRegion = document.querySelector("#form-status");
  if (!form || !statusRegion) return;

  const referralField = form.elements.namedItem("referral");
  const params = new URLSearchParams(globalThis.location?.search ?? "");
  const referral = params.get("ref") ?? "";
  if (referralField instanceof HTMLInputElement) referralField.value = referral;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(form);
    const values = valuesFromForm(form);
    const errors = validateWaitlist(values);
    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      return;
    }

    const button = form.querySelector("button[type='submit']");
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Saving…";
    statusRegion.hidden = true;

    const record = createLeadRecord(values, { referral: params.get("ref") ?? "" });

    try {
      const result = await submitLead(record, {
        ...submissionOptions(form),
        storage: globalThis.localStorage,
      });
      const title = result.status === "saved-locally" ? "Almost there." : "Thanks — you’re on the list.";
      setStatus(statusRegion, "success", title, successCopy(result.status));
      form.reset();
      if (referralField instanceof HTMLInputElement) referralField.value = referral;
    } catch (error) {
      setStatus(statusRegion, "error", "That didn’t save.", error.message);
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

function setupReveals() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in globalThis)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 },
  );
  items.forEach((item) => observer.observe(item));
}

function setupPage() {
  setupForm();
  setupReveals();
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

setupPage();
