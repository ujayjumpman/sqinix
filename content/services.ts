// Consulting services. Names are the four already published on squinix.com; the copy is new.
// TODO(client): confirm scope, delivery model and any certifications before launch.

export type Service = {
  id: string;
  n: string;
  title: string;
  lead: string;
  body: string;
  bullets: string[];
  icon: string;
};

export const services: Service[] = [
  {
    id: "strategy",
    n: "01",
    title: "IT Strategy Consulting",
    lead: "Technology that backs the business plan.",
    body: "We line your technology up with where the business is heading: what to keep, what to replace, what to buy next and what it should cost.",
    bullets: ["IT roadmap and budgeting", "Infrastructure and vendor review", "Security and risk posture", "Cloud versus on-premises decisions"],
    icon: "compass",
  },
  {
    id: "apps",
    n: "02",
    title: "Custom Application Development",
    lead: "Software shaped around how you work.",
    body: "Internal tools, dashboards and integrations built to fit your process, instead of forcing your process to fit someone else's product.",
    bullets: ["Web and internal business tools", "Dashboards and reporting", "System integrations and automation", "Maintenance and support"],
    icon: "code",
  },
  {
    id: "transformation",
    n: "03",
    title: "Digital Transformation",
    lead: "From paper and patchwork to one connected system.",
    body: "We move manual and scattered operations onto systems that talk to each other, and help your people make the switch.",
    bullets: ["Process digitisation", "Cloud migration", "Data consolidation and analytics", "Training and change support"],
    icon: "workflow",
  },
  {
    id: "process",
    n: "04",
    title: "Business Process Consulting",
    lead: "Find the friction. Remove it.",
    body: "We map how work really flows, find the bottlenecks and redesign the steps so teams spend time on the work, not the workaround.",
    bullets: ["Workflow mapping", "Bottleneck and cost analysis", "SOP and policy design", "KPIs and measurement"],
    icon: "gauge",
  },
];

export const process = [
  { n: "01", title: "Consult", body: "We listen first: your workload, your budget, your constraints." },
  { n: "02", title: "Configure", body: "A clear recommendation, in plain language, with options and costs." },
  { n: "03", title: "Deploy", body: "Supplied, built, installed and tested so it works on day one." },
  { n: "04", title: "Support", body: "A real team to call when you need help, upgrades or repairs." },
];
