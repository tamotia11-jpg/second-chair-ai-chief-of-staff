import { useEffect, useRef, useState } from "react";

import { createLeadRecord, submitLead, validateWaitlist } from "../../app.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialValues = Object.freeze({
  workflowArea: "",
  frequency: "",
  timeSink: "",
  willingnessToPay: "",
  name: "",
  email: "",
});

const steps = [
  {
    field: "workflowArea",
    question: "Where could AI create the most useful first win?",
    help: "Choose the closest area. This is a starting point, not the limit of a deployment.",
    choices: [
      ["lead-research", "Lead generation & research"],
      ["sales", "Sales pipeline & proposals"],
      ["marketing", "Marketing & launch operations"],
      ["admin", "Executive, inbox & admin"],
      ["finance-people-docs", "Finance, people & documents"],
      ["reporting", "Reporting & operating cadence"],
    ],
  },
  {
    field: "frequency",
    question: "How often does this work pull your team back in?",
    help: "Think about the recurring pattern rather than a one-off fire.",
    choices: [["daily", "Every day"], ["weekly", "Every week"], ["monthly", "Every month"], ["quarterly", "Every quarter"]],
  },
  {
    field: "timeSink",
    question: "What makes this work difficult today?",
    help: "A concrete example is more useful than a polished answer.",
    type: "textarea",
  },
  {
    field: "willingnessToPay",
    question: "Would you consider a focused paid pilot for this problem?",
    help: "This helps us understand whether the opportunity is worth discussing now.",
    choices: [["yes", "Yes — it is costing us now"], ["maybe", "Maybe — show me the approach"], ["not-yet", "Not yet"]],
  },
  {
    field: "name",
    question: "What should we call you?",
    help: "Just your name—nothing else yet.",
    type: "text",
  },
  {
    field: "email",
    question: "Where should we continue the conversation?",
    help: "Use the work email you want us to reply to.",
    type: "email",
  },
];

function FieldError({ message }) {
  return message ? <p className="field-error" role="alert">{message}</p> : null;
}

export function PilotConversation() {
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const formRef = useRef(null);
  const step = steps[activeStep];
  const [referral, setReferral] = useState("");
  useEffect(() => {
    setReferral(new URLSearchParams(globalThis.location?.search ?? "").get("ref") ?? "");
  }, []);

  useEffect(() => {
    const control = formRef.current?.querySelector("input, textarea, button");
    if (activeStep > 0) control?.focus();
  }, [activeStep]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function currentError() {
    return validateWaitlist(values)[step.field] ?? "";
  }

  function next() {
    const message = currentError();
    if (message) return setError(message);
    setActiveStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  async function submit(event) {
    event.preventDefault();
    const errors = validateWaitlist(values);
    if (Object.keys(errors).length > 0) {
      const firstInvalid = steps.findIndex(({ field }) => errors[field]);
      setActiveStep(firstInvalid);
      setError(errors[steps[firstInvalid].field]);
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const record = createLeadRecord(values, { referral });
      await submitLead(record);
      setStatus("sent");
      setValues(initialValues);
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError.message);
    }
  }

  if (status === "sent") {
    return <Card className="conversation-card conversation-card--success"><CardContent><h3>Thanks. We have enough for a useful first discussion.</h3><p>We’ll reply about the opportunity you described and whether a focused Second Chair pilot makes sense.</p><Button variant="outline" onClick={() => { setStatus("idle"); setActiveStep(0); }}>Send another note</Button></CardContent></Card>;
  }

  return <Card className="conversation-card">
    <CardHeader className="conversation-header">
      <div><CardTitle>Tell us where the work gets stuck.</CardTitle><p>Six short questions to understand the opportunity.</p></div>
      <span className="question-count">Question {activeStep + 1} of {steps.length}</span>
    </CardHeader>
    <div className="conversation-progress" aria-hidden="true"><span className={`progress-step-${activeStep + 1}`} /></div>
    <CardContent>
      <form ref={formRef} onSubmit={submit} noValidate>
        <input type="hidden" name="_subject" value="New Second Chair pilot conversation" />
        <input type="hidden" name="referral" value={referral} />
        <div className="conversation-step" key={step.field}>
          <h3>{step.question}</h3>
          <p className="step-help">{step.help}</p>

          {step.choices ? <div className="choice-list" role="radiogroup" aria-label={step.question}>
            {step.choices.map(([value, label]) => <Label className="choice-option" key={value} htmlFor={`${step.field}-${value}`}><input className="choice-radio" type="radio" id={`${step.field}-${value}`} name={step.field} value={value} checked={values[step.field] === value} onChange={() => update(step.field, value)} /><span>{label}</span></Label>)}
          </div> : null}

          {step.type === "textarea" ? <Textarea aria-invalid={Boolean(error)} maxLength={500} name="timeSink" onChange={(event) => update("timeSink", event.target.value)} placeholder="For example: our team keeps gathering the same context across three systems before anyone can reply…" rows={6} value={values.timeSink} /> : null}
          {step.type === "text" ? <Input aria-invalid={Boolean(error)} autoComplete="name" maxLength={80} name="name" onChange={(event) => update("name", event.target.value)} placeholder="Your full name" value={values.name} /> : null}
          {step.type === "email" ? <Input aria-invalid={Boolean(error)} autoComplete="email" maxLength={254} name="email" onChange={(event) => update("email", event.target.value)} placeholder="you@company.com" type="email" value={values.email} /> : null}

          <FieldError message={error} />
          <div className="conversation-actions">
            {activeStep > 0 ? <Button onClick={back} type="button" variant="ghost">Back</Button> : <span />}
            {activeStep < steps.length - 1 ? <Button className="primary-cta" onClick={next} type="button">Continue</Button> : <Button className="primary-cta" disabled={status === "sending"} type="submit">{status === "sending" ? "Sending" : "Start the conversation"}</Button>}
          </div>
          {activeStep === steps.length - 1 ? <p className="form-privacy">Used only to evaluate pilot fit and reply. <a href="/privacy">Website privacy notice</a>.</p> : null}
        </div>
      </form>
    </CardContent>
  </Card>;
}
