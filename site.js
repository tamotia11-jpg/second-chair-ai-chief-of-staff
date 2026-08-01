import { createLeadRecord, submitLead, validateWaitlist } from "./app.js";

document.documentElement.classList.add("js");

function valuesFromForm(form) {
  const formData = new FormData(form);
  return Object.freeze({
    workflowArea: formData.get("workflowArea"),
    frequency: formData.get("frequency"),
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

function showErrors(form, errors, shouldFocus = true) {
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
  if (shouldFocus) form.querySelector("[aria-invalid='true']")?.focus();
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
  const steps = [...form.querySelectorAll(".form-step")];
  const position = form.querySelector("#question-position");
  const progress = form.querySelector("#progress-value");
  const params = new URLSearchParams(globalThis.location?.search ?? "");
  const referral = params.get("ref") ?? "";
  let activeStep = 0;
  if (referralField instanceof HTMLInputElement) referralField.value = referral;

  function setStep(index, shouldFocus = true) {
    activeStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== activeStep;
    });
    if (position) position.textContent = `Question ${activeStep + 1} of ${steps.length}`;
    if (progress) progress.style.width = `${((activeStep + 1) / steps.length) * 100}%`;
    if (shouldFocus) {
      globalThis.requestAnimationFrame(() => {
        const selected = steps[activeStep].querySelector("input:checked");
        const firstControl = steps[activeStep].querySelector("input, textarea, button");
        (selected ?? firstControl)?.focus();
      });
    }
  }

  function errorsForStep(step) {
    const field = step.dataset.step;
    const errors = validateWaitlist(valuesFromForm(form));
    return field && errors[field] ? { [field]: errors[field] } : {};
  }

  function continueFromCurrentStep() {
    clearErrors(form);
    const errors = errorsForStep(steps[activeStep]);
    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      return;
    }
    setStep(activeStep + 1);
  }

  form.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", continueFromCurrentStep);
  });

  form.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      clearErrors(form);
      statusRegion.hidden = true;
      setStep(activeStep - 1);
    });
  });

  form.addEventListener("input", (event) => {
    const field = event.target?.name;
    if (!field) return;
    const error = form.querySelector(`[data-error-for="${field}"]`);
    if (error) error.textContent = "";
    const control = form.elements.namedItem(field);
    if (control instanceof RadioNodeList) {
      [...control].forEach((radio) => radio.removeAttribute("aria-invalid"));
    } else {
      control?.removeAttribute("aria-invalid");
    }
  });

  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (!(event.target instanceof HTMLInputElement)) return;
    if (event.target.type === "radio" || activeStep === steps.length - 1) return;
    event.preventDefault();
    continueFromCurrentStep();
  });

  setStep(0, false);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(form);
    const values = valuesFromForm(form);
    const errors = validateWaitlist(values);
    if (Object.keys(errors).length > 0) {
      const firstErrorStep = steps.findIndex((step) => errors[step.dataset.step]);
      if (firstErrorStep >= 0) setStep(firstErrorStep, false);
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
      form.hidden = true;
      setStatus(statusRegion, "success", title, successCopy(result.status));
      form.reset();
      if (referralField instanceof HTMLInputElement) referralField.value = referral;
      setStep(0, false);
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
