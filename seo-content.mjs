// Editorial examples describe possible scope, not delivered customer results.
export const searchMetadata = Object.freeze({
  'lead-research': ['AI Lead Research for Sales Teams | Second Chair', 'Explore a managed AI lead research pilot: approved sources, evidence-backed prospect briefs, human review, and clear success measures.'],
  'sales-follow-through': ['AI Sales Follow-Up Preparation | Second Chair', 'Plan an AI sales follow-up pilot with reviewed drafts, clear account ownership, agreed scope, and practical measures for your sales team.'],
  'marketing-launch-prep': ['AI Marketing Launch Preparation | Second Chair', 'Explore AI-assisted launch preparation: approved campaign inputs, draft copy, asset checklists, and human review before publication.'],
  'inbox-calendar-admin': ['AI Meeting Preparation and Admin | Second Chair', 'Scope a managed AI administration pilot for meeting briefs and scheduling preparation, with approved context and clear human control.'],
  'finance-people-documents': ['AI Document Operations for Business | Second Chair', 'Explore a controlled AI document-operations pilot with approved inputs, exception review, clear exclusions, and practical accuracy measures.'],
  'reporting-cadence': ['AI Business Reporting and Operating Briefs | Second Chair', 'Plan an AI reporting pilot with source-linked operating briefs, explicit data gaps, human review, and comparable measures of preparation time.'],
  'choose-one-workflow': ['How to Choose Your First AI Workflow | Second Chair', 'Choose a first AI workflow using clear scope, approved inputs, a named reviewer, and useful measures. Includes an illustrative lead research example.'],
  'human-approval-before-action': ['Human Approval in AI Workflows: A Guide | Second Chair', 'Design human approval around the exact AI-prepared action, its consequences, and its owner. Explore a practical sales follow-up example.'],
  'measure-coordination-drag': ['How to Measure an AI Workflow Pilot | Second Chair', 'Measure an AI workflow pilot using baseline handling time, review effort, corrections, and exceptions. Includes a reporting-workflow worksheet.'],
  'concierge-before-automation': ['Managed AI Operations: Why Ownership Matters | Second Chair', 'Understand why managed AI operations need discovery, exception ownership, monitoring, and explicit customer responsibilities before expansion.'],
  'what-counts-as-validation': ['AI Pilot Success Criteria: What to Measure | Second Chair', 'Define useful AI pilot success criteria with agreed scope, review effort, observable evidence, and an explicit decision to stop, continue, or expand.'],
});

export const workflowExamples = Object.freeze({
  'lead-research': {
    inputs: 'An agreed prospect list, your qualification criteria, and a list of permitted public or customer-approved sources. Define what makes a source current enough before research begins.',
    output: 'A research brief with company context, source links, the date checked, evidence for each qualification criterion, missing information, and a suggested next question. An unsupported claim is marked unknown, not filled in.',
    boundary: 'The example ends at a reviewed brief. Buying contact data, scraping restricted sources, sending outreach, and changing CRM records are outside this scope unless separately agreed and authorised.',
    evaluation: 'Compare comparable prospect batches before and during the pilot. Count accepted briefs, corrections, unknown fields, and total human review time as well as preparation time. Faster drafts alone do not demonstrate a better result.',
  },
  'sales-follow-through': {
    inputs: 'A defined set of open opportunities, approved conversation context, the account owner, and agreed follow-up timing. Exclude records whose ownership or permission is unclear.',
    output: 'A follow-up queue showing the opportunity, last agreed step, evidence for the proposed response, draft wording, and the person responsible for approval. Missing context becomes a question for the owner.',
    boundary: 'A prepared response is not a sent message. The reviewer checks recipient, claims, timing, and commitments before any approved execution. Pricing promises and contract decisions remain with the responsible person.',
    evaluation: 'Track overdue items, draft acceptance, substantive corrections, and time from review request to decision. Compare the same opportunity stage and include time spent resolving exceptions.',
  },
  'marketing-launch-prep': {
    inputs: 'An approved campaign brief, audience definition, message constraints, asset inventory, and named owners. Treat draft claims and unavailable assets as unresolved inputs.',
    output: 'A launch preparation pack containing an asset checklist, draft channel copy, source references for claims, owner assignments, and a list of decisions blocking release.',
    boundary: 'This example prepares the pack. It does not publish posts, buy advertising, or commit launch dates. The marketing owner approves factual claims, brand wording, and the final release plan.',
    evaluation: 'Record missing assets found before review, correction rounds, preparation time, and reviewer time. Use a comparable launch size when assessing whether the preparation is useful.',
  },
  'inbox-calendar-admin': {
    inputs: 'One agreed mailbox or meeting-preparation loop, approved calendar context, and rules for what the operator may read. Exclude unrelated personal and confidential material.',
    output: 'A meeting brief with agenda context, outstanding questions, relevant source links, and proposed scheduling options. Conflicting availability is surfaced explicitly.',
    boundary: 'The example does not send invitations, cancel meetings, or reply to messages. Any such action needs the agreed authority and a review of the exact recipients, time, and content.',
    evaluation: 'Measure total preparation and review time, missing context, calendar conflicts caught, and owner corrections. Include exception handling rather than counting only straightforward meetings.',
  },
  'finance-people-documents': {
    inputs: 'An approved, access-limited document set, a clear classification scheme, and the responsible finance or people-operations owner. Agree sensitive-data exclusions first.',
    output: 'A document checklist with source references, missing fields, possible duplicates, and an exception queue for the owner. Uncertain matches remain unresolved for human review.',
    boundary: 'The example does not move money, make employment decisions, file taxes, or provide professional advice. Changes to authoritative records require separately agreed controls.',
    evaluation: 'Compare review time, correctly identified exceptions, false matches, and rework against the existing process. A lower handling time is not sufficient if record accuracy declines.',
  },
  'reporting-cadence': {
    inputs: 'A defined reporting period, approved source records, metric definitions, and an owner for each input. Agree how late or missing data will be labelled.',
    output: 'An operating brief that separates reported facts, source dates, variances, unresolved questions, and proposed decisions. Every material figure points back to its source.',
    boundary: 'The brief does not silently reconcile conflicting numbers or distribute itself to external recipients. The reporting owner resolves discrepancies and approves the audience.',
    evaluation: 'Measure preparation time, late inputs, reconciliation corrections, and on-time review. Keep metric definitions and reporting scope consistent between baseline and pilot.',
  },
});

export const editorialExamples = Object.freeze({
  'choose-one-workflow': [
    ['Worked example: prospect research', 'Suppose a sales owner repeatedly opens several sources to decide whether an account fits the team’s criteria. Bound the pilot at a research brief for an agreed batch. Name the approved sources, required fields, reviewer, and definition of an accepted brief. Sending outreach is a separate decision. This is an illustrative scope, not a customer case study.'],
    ['A selection checklist', 'Compare candidate workflows on repetition, input availability, clarity of ownership, reversibility, and ability to measure the outcome. Prefer work with an observable review point. Defer a workflow if permission to use its inputs is unclear or nobody can decide whether the output is correct.'],
    ['Write the acceptance rule first', 'Agree how many missing or unsupported fields make a brief unusable, what evidence each claim needs, and how review time will be recorded. A pilot that produces more drafts while increasing total review time has not yet earned expansion.'],
  ],
  'human-approval-before-action': [
    ['Worked example: a sales follow-up', 'A draft can contain the right words and still have the wrong recipient or an outdated commitment. Present the recipient, source context, complete proposed message, and intended action together. The reviewer should approve that specific proposal, not a broad request to handle sales.'],
    ['When the proposal changes', 'If a recipient, amount, attachment, or material claim changes after review, treat the change as a new decision. An expired or ambiguous approval should stop the action. Record the outcome so an operator can distinguish prepared, approved, executed, and failed work.'],
    ['Define exception ownership', 'Name the person who handles missing context, failed delivery, and conflicting instructions before the pilot begins. Repeated execution attempts should not produce duplicate external actions. Ask how this behaviour will be demonstrated in the agreed deployment.'],
  ],
  'measure-coordination-drag': [
    ['Worked example: a weekly operating brief', 'Record time spent collecting inputs, resolving discrepancies, preparing the brief, and reviewing it. During the pilot, record those same stages. Compare equivalent reporting periods and note unusual workload changes rather than attributing every difference to AI.'],
    ['A measurement worksheet', 'For each run, capture workflow volume, input completeness, preparation minutes, review minutes, corrections, unresolved exceptions, and whether the owner accepted the output. Keep sensitive source content in its approved system; the worksheet needs measurements, not copies of customer records.'],
    ['Interpret the trade-off', 'Less preparation time can be offset by more checking. Review total human time alongside accuracy and completion. Describe small or inconsistent samples as preliminary evidence and decide what further observation would justify continuing.'],
  ],
  'concierge-before-automation': [
    ['Worked example: an exception-heavy reporting loop', 'Two teams may use the same reporting template but have different definitions and approval paths. Observe the real handoff, identify who resolves conflicting inputs, and agree what happens when a source is late before turning the process into a repeatable deployment.'],
    ['What a managed engagement should clarify', 'Ask who monitors the workflow, handles a broken integration, reviews changes, and communicates incidents. Document the boundary between the customer’s decisions and the operator’s responsibilities. Ongoing ownership should be explicit in the agreed scope.'],
    ['Expand from evidence', 'Reuse a proven component only after checking the new team’s permissions, inputs, and exception rules. Similar-looking work is not automatically the same workflow. Expansion should retain a named owner and its own acceptance criteria.'],
  ],
  'what-counts-as-validation': [
    ['Worked example: a follow-up preparation pilot', 'Agree a bounded opportunity queue and the owner who will review proposed next steps. Record whether drafts are accepted, substantially rewritten, or rejected, plus the time spent reviewing them. The pilot must be useful in the real queue, not just in a demonstration.'],
    ['Decide before expanding', 'Continue when the agreed evidence supports the value and the owner can operate the review process. Revise the scope when useful outputs still require excessive intervention. Stop when permissions, accuracy, or operational value do not meet the agreed standard.'],
    ['Keep the result inspectable', 'A useful close-out states the scope, observation period, volume, measurement method, exceptions, limitations, and next decision. Separate observed outcomes from projections. Do not present an illustrative example or a forecast as a customer result.'],
  ],
});

export const relatedReading = Object.freeze({
  'choose-one-workflow': ['/workflows/lead-research', 'Explore a lead research pilot'],
  'human-approval-before-action': ['/control', 'Review human control in managed AI operations'],
  'measure-coordination-drag': ['/workflows/reporting-cadence', 'Explore an operating-reporting pilot'],
  'concierge-before-automation': ['/what-we-do', 'Understand the managed AI service'],
  'what-counts-as-validation': ['/how-it-works', 'See how a focused pilot works'],
});
