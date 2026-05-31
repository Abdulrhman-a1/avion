export const seedArticles = [
  {
    id: 'seed-1',
    title: 'Building a RACI Matrix for STEM Racing Teams',
    author: 'AVION PM Team',
    category: 'Team Management',
    content:
      'A RACI matrix clarifies who is Responsible, Accountable, Consulted, and Informed for each deliverable.\n\nStart by listing your major work packages: engineering design, enterprise portfolio, pit display, and competition logistics. Assign one accountable owner per task and avoid giving the same person accountable for more than a few critical items.\n\nReview the matrix weekly during sprint planning so role confusion does not slow execution.',
    status: 'approved',
    submittedAt: '2026-01-15T10:00:00.000Z',
    publishedAt: '2026-01-16T09:00:00.000Z',
    summary:
      'How to define clear roles and responsibilities across engineering, enterprise, and competition deliverables.',
  },
  {
    id: 'seed-2',
    title: 'Risk Logs That Actually Get Used',
    author: 'Majd Aljiawy',
    category: 'Risk Management',
    content:
      'Most teams create a risk log once and never update it. Make yours actionable by scoring impact and probability, assigning an owner, and defining a trigger event.\n\nExample: "Manufacturing delay" becomes "If CNC slot is not booked by March 1, switch to 3D-printed backup parts."\n\nReview top risks in every weekly meeting and celebrate when a mitigated risk can be closed.',
    status: 'approved',
    submittedAt: '2026-02-01T14:00:00.000Z',
    publishedAt: '2026-02-02T08:00:00.000Z',
    summary:
      'Turn passive risk lists into living documents with owners, triggers, and weekly reviews.',
  },
  {
    id: 'seed-3',
    title: 'Stakeholder Updates That Sponsors Read',
    author: 'AVION PM Team',
    category: 'Communication',
    content:
      'Sponsors care about outcomes, not task lists. Structure updates in three blocks: progress since last update, upcoming milestones, and decisions needed.\n\nUse visuals — photos from activations, budget burn charts, and a single slide summary. Keep written updates under one page.\n\nSend on a fixed schedule so stakeholders know when to expect news from your team.',
    status: 'approved',
    submittedAt: '2026-02-10T11:00:00.000Z',
    publishedAt: '2026-02-11T10:00:00.000Z',
    summary:
      'Write concise sponsor updates focused on milestones, visuals, and clear decisions.',
  },
];

export const seedCourses = [
  {
    id: 'course-1',
    title: 'Project Planning Fundamentals',
    category: 'Project Planning',
    order: 1,
    summary: 'Define scope, milestones, and a realistic timeline for your STEM Racing season.',
    content:
      '## Step 1: Define your scope statement\nList every deliverable the judges will evaluate: car, portfolios, pit display, presentation, and branding.\n\n## Step 2: Break work into phases\nUse initiating, planning, executing, monitoring, and closing. Map each deliverable to a phase owner.\n\n## Step 3: Build milestones backward\nStart from competition date and work backward. Include buffer weeks before manufacturing deadlines.\n\n## Step 4: Validate with the team\nWalk the schedule with engineering and enterprise leads. Adjust before you commit sponsors to dates.',
  },
  {
    id: 'course-2',
    title: 'Reading and Building Gantt Charts',
    category: 'Gantt Charts',
    order: 2,
    summary: 'Visualize dependencies and critical path tasks for competition readiness.',
    content:
      '## What a Gantt chart shows\nTasks on the vertical axis, time on the horizontal axis, and bars showing duration.\n\n## Dependencies matter\nIf portfolio design depends on final car photos, link those tasks. Critical path tasks have zero slack — delay them and the project slips.\n\n## Tools\nGoogle Sheets, Notion timelines, or Microsoft Project all work. Pick one the whole team will update weekly.\n\n## Weekly ritual\nColor-code: on track, at risk, blocked. Discuss only blocked and at-risk items in stand-ups.',
  },
  {
    id: 'course-3',
    title: 'Risk Management for Competition Teams',
    category: 'Risk Management',
    order: 3,
    summary: 'Identify, score, and mitigate risks before they become crises.',
    content:
      '## Identify risks early\nBrainstorm across budget, manufacturing, personnel, and competition logistics.\n\n## Score consistently\nUse a simple 1–5 scale for impact and probability. Multiply for priority.\n\n## Plan responses\nFor each high-priority risk, define mitigation (reduce chance) and contingency (reduce impact).\n\n## Review weekly\nClose mitigated risks and escalate new ones to the project manager.',
  },
  {
    id: 'course-4',
    title: 'Deliverables and Acceptance Criteria',
    category: 'Deliverables',
    order: 4,
    summary: 'Write clear definitions of done for every judged output.',
    content:
      '## Define "done"\nEach deliverable needs measurable acceptance criteria. "Portfolio complete" is vague; "All six sections proofread, printed, and bound" is actionable.\n\n## Align with rubrics\nMap criteria directly to competition judging categories so nothing is missed.\n\n## Sign-off process\nDepartment leads sign off before the PM marks a deliverable complete in the tracker.',
  },
];
