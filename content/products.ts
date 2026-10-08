// Product lines. Copy is written to be accurate for a general IT hardware reseller.
// TODO(client): confirm the ranges you actually stock, brands you can name, warranty terms and bulk-order policy.
// No prices are shown on purpose - every item is "price on request".

export type Beat = { eyebrow?: string; title: string; body: string };
export type Highlight = { icon: string; title: string; body: string };
export type Config = { name: string; tag: string; blurb: string; specs: string[] };

export type ProductLine = {
  slug: "gaming" | "business" | "infrastructure" | "peripherals";
  name: string;
  short: string;
  tagline: string;
  /** folder under /media/sequences */
  sequence: "gpu" | "laptop" | "servers" | "keyboard";
  headline: string;
  summary: string;
  beats: Beat[];
  highlights: Highlight[];
  configsTitle: string;
  configs: Config[];
  why: { title: string; body: string }[];
  quoteInterest: string;
  metaDescription: string;
};

export const products: ProductLine[] = [
  {
    slug: "gaming",
    name: "Gaming PCs & Components",
    short: "Gaming",
    tagline: "Rigs built around the games you play.",
    sequence: "gpu",
    headline: "Built to win.",
    summary:
      "Custom gaming PCs and the parts inside them. Tell us the games, the screen and the budget; we configure, build and tune the machine, then stand behind it.",
    beats: [
      { eyebrow: "Inside the machine", title: "Every part, chosen for how you play.", body: "Graphics, processor, memory and cooling matched so nothing holds the rest back." },
      { eyebrow: "Layer by layer", title: "Cooling you can see working.", body: "Fan curves, airflow paths and heat-pipe design decide how long a card holds its boost." },
      { eyebrow: "Tuned, not just installed", title: "Ready to run on day one.", body: "Drivers, fan profiles and lighting are set up before it leaves the bench." },
      { eyebrow: "Ready when you are", title: "Plug in. Power up. Play.", body: "Delivered and supported by the team that built it." },
    ],
    highlights: [
      { icon: "cpu", title: "Custom builds", body: "Entry to extreme rigs configured to your games, screen and budget." },
      { icon: "gpu", title: "Graphics cards", body: "Current-generation GPUs in single-, dual- and triple-fan designs." },
      { icon: "chip", title: "Processors & boards", body: "Matched CPUs and motherboards with room to upgrade later." },
      { icon: "memory", title: "Memory & storage", body: "Fast DDR memory and NVMe SSDs so games and projects load quickly." },
      { icon: "fan", title: "Cooling & cases", body: "Air and liquid cooling in airflow-first cases, with optional RGB." },
      { icon: "plug", title: "Power supplies", body: "Efficient, protected PSUs sized with headroom for upgrades." },
    ],
    configsTitle: "Pick your starting point",
    configs: [
      { name: "Entry", tag: "1080p", blurb: "Smooth esports and mainstream titles at 1080p.", specs: ["6-core class processor", "Mid-range graphics card", "16 GB memory", "512 GB - 1 TB NVMe SSD"] },
      { name: "Pro", tag: "1440p", blurb: "High-refresh 1440p gaming with room for streaming.", specs: ["8-core class processor", "High-end graphics card", "32 GB memory", "1 TB+ NVMe SSD"] },
      { name: "Extreme", tag: "4K", blurb: "4K, ray tracing and creator workloads without compromise.", specs: ["Top-tier processor", "Flagship graphics card", "32 - 64 GB memory", "2 TB+ NVMe SSD, liquid cooling"] },
    ],
    why: [
      { title: "Honest recommendations", body: "If a cheaper part does the job, we'll say so." },
      { title: "Clean, airflow-tuned builds", body: "Tidy cable routing and tested thermals, not just parts in a box." },
      { title: "Support after the sale", body: "One team for questions, upgrades and repairs." },
      { title: "Cafés & bulk orders", body: "Matching rigs for gaming cafés, labs and offices." },
    ],
    quoteInterest: "Gaming PCs & components",
    metaDescription: "Custom gaming PCs, graphics cards, processors, memory, storage and cooling from Squinix Solutions, Noida. Request a quote.",
  },
  {
    slug: "business",
    name: "Business Laptops & Desktops",
    short: "Business",
    tagline: "Dependable machines for working teams.",
    sequence: "laptop",
    headline: "Work, without the wait.",
    summary:
      "Laptops, desktops and workstations for offices of every size. We help you choose, set up and roll out, whether it's one machine or a hundred.",
    beats: [
      { eyebrow: "Open. Ready.", title: "Slim, light and ready for the day.", body: "Business-class laptops that survive the commute and the all-day meeting." },
      { eyebrow: "Everything you run", title: "Fast where it counts.", body: "Processor, memory and storage sized to your actual workload, not the brochure." },
      { eyebrow: "Secure by default", title: "Set up the way IT likes it.", body: "Operating system, software and security configured before delivery." },
      { eyebrow: "Fleets, deployed", title: "One machine or a hundred.", body: "Identical configurations, delivered together and supported together." },
    ],
    highlights: [
      { icon: "laptop", title: "Business laptops", body: "Thin-and-light to performance models for field and office teams." },
      { icon: "desktop", title: "Desktops & mini PCs", body: "Reliable towers and compact units for reception, accounts and labs." },
      { icon: "workstation", title: "Workstations", body: "Power for design, engineering, video and data work." },
      { icon: "monitor", title: "Monitors & docks", body: "Displays, docks and accessories to complete each desk." },
      { icon: "wrench", title: "Imaging & setup", body: "OS, software and policies preloaded so machines arrive ready." },
      { icon: "boxes", title: "Bulk procurement", body: "Quantity quotes, staged delivery and a single point of contact." },
    ],
    configsTitle: "Sized to the job",
    configs: [
      { name: "Everyday", tag: "Office", blurb: "Email, documents, browser and video calls.", specs: ["Efficient mainstream processor", "8 - 16 GB memory", "256 - 512 GB SSD", "Business-grade keyboard and display"] },
      { name: "Power user", tag: "Pro", blurb: "Spreadsheets, multitasking and light creative work.", specs: ["High-performance processor", "16 - 32 GB memory", "512 GB - 1 TB SSD", "Dock-ready connectivity"] },
      { name: "Workstation", tag: "Studio", blurb: "CAD, rendering, editing and data workloads.", specs: ["Workstation-class processor", "Pro graphics", "32 - 128 GB memory", "Multi-drive storage"] },
    ],
    why: [
      { title: "Right-sized, not oversold", body: "We match the machine to the work, and the budget." },
      { title: "Ready on arrival", body: "Imaged, updated and labelled for each user." },
      { title: "Warranty & service", body: "Clear coverage and a quick route to a fix." },
      { title: "Scales with you", body: "Add seats later with the same configuration." },
    ],
    quoteInterest: "Business laptops & desktops",
    metaDescription: "Business laptops, desktops, workstations and bulk procurement with setup and support from Squinix Solutions, Noida.",
  },
  {
    slug: "infrastructure",
    name: "Servers, Storage & Networking",
    short: "Infrastructure",
    tagline: "The backbone your business runs on.",
    sequence: "servers",
    headline: "Infrastructure that stays up.",
    summary:
      "Servers, storage, switches, firewalls and Wi-Fi, planned as one system. We size it, supply it, install it and keep it healthy.",
    beats: [
      { eyebrow: "Down the aisle", title: "Compute that scales with you.", body: "Rack and tower servers from a single file server to a full virtual cluster." },
      { eyebrow: "Always on", title: "Storage you can trust.", body: "NAS and arrays with redundancy and backup built into the design." },
      { eyebrow: "Connected", title: "A network that never blinks.", body: "Switching, routing and Wi-Fi planned for coverage and capacity." },
      { eyebrow: "Protected", title: "Secure from the edge in.", body: "Firewalls, power protection and monitoring that catch trouble early." },
    ],
    highlights: [
      { icon: "server", title: "Rack & tower servers", body: "Right-sized compute for applications, files and virtualisation." },
      { icon: "database", title: "Storage & NAS", body: "Shared storage with RAID, snapshots and offsite backup options." },
      { icon: "network", title: "Switches & routers", body: "Managed switching and routing for offices and campuses." },
      { icon: "shield", title: "Firewalls & security", body: "Perimeter protection, VPN and access control." },
      { icon: "wifi", title: "Wi-Fi", body: "Access points planned for coverage, not guesswork." },
      { icon: "battery", title: "Power & racks", body: "UPS, racks, cabling and cooling to keep it all running." },
    ],
    configsTitle: "From closet to data room",
    configs: [
      { name: "Small office", tag: "5 - 25 users", blurb: "File sharing, backup and secure Wi-Fi.", specs: ["Tower server or NAS", "Managed switch", "Firewall with VPN", "UPS and backup"] },
      { name: "Growing business", tag: "25 - 100 users", blurb: "Line-of-business apps and virtualisation.", specs: ["Rack server pair", "Shared storage", "Redundant switching", "Monitoring"] },
      { name: "Server room", tag: "Enterprise", blurb: "Dedicated racks with resilience and growth room.", specs: ["Rack servers and storage array", "Core and access switching", "Structured cabling", "Precision power and cooling"] },
    ],
    why: [
      { title: "Designed as a system", body: "Compute, storage and network sized together." },
      { title: "Installed properly", body: "Racked, cabled, labelled and documented." },
      { title: "Planned for failure", body: "Redundancy and backup, so one fault isn't an outage." },
      { title: "Support that answers", body: "A named team that knows your setup." },
    ],
    quoteInterest: "Servers, storage & networking",
    metaDescription: "Servers, storage, switches, firewalls and Wi-Fi supplied and installed by Squinix Solutions, Noida West.",
  },
  {
    slug: "peripherals",
    name: "Peripherals & Accessories",
    short: "Peripherals",
    tagline: "The things you touch every day.",
    sequence: "keyboard",
    headline: "Every detail, in your hands.",
    summary:
      "Keyboards, mice, headsets, monitors, printers, cameras and the cables that tie them together, for the desk, the studio and the shop floor.",
    beats: [
      { eyebrow: "Every key, considered", title: "Typing that feels right.", body: "Mechanical, low-profile and quiet boards for work and play." },
      { eyebrow: "Layer by layer", title: "Quality you can't see from outside.", body: "Plates, switches and PCBs decide the sound, feel and lifespan." },
      { eyebrow: "Light that moves", title: "Personalised, per key.", body: "Programmable lighting and layouts, if you want them." },
      { eyebrow: "Back together", title: "Complete the setup.", body: "Mice, headsets, monitors and everything else on the same order." },
    ],
    highlights: [
      { icon: "keyboard", title: "Keyboards", body: "Mechanical, wireless and office-quiet options." },
      { icon: "mouse", title: "Mice", body: "Precision gaming mice and comfortable all-day designs." },
      { icon: "headset", title: "Headsets & audio", body: "Calls, music and competitive sound." },
      { icon: "monitor", title: "Monitors", body: "Office, colour-accurate and high-refresh displays." },
      { icon: "printer", title: "Printers & scanners", body: "For the office, the counter and the lab." },
      { icon: "camera", title: "Cameras & security", body: "Webcams, CCTV and cabling." },
    ],
    configsTitle: "Choose your level",
    configs: [
      { name: "Everyday", tag: "Home & office", blurb: "Dependable essentials that just work.", specs: ["Full-size or compact keyboard", "Ergonomic mouse", "Headset with mic", "Cables and adapters"] },
      { name: "Pro", tag: "Creators", blurb: "Better feel, better accuracy, better sound.", specs: ["Mechanical keyboard", "Precision mouse", "Studio-grade audio", "Colour-accurate monitor"] },
      { name: "Competitive", tag: "Gaming", blurb: "Low latency, tuned for fast reactions.", specs: ["Wired or low-latency wireless", "Lightweight gaming mouse", "High-refresh monitor", "Surround headset"] },
    ],
    why: [
      { title: "Try before you choose", body: "Hands-on advice, not a catalogue." },
      { title: "Genuine products", body: "Sourced for warranty and peace of mind." },
      { title: "Bundles", body: "Complete desk setups in one order." },
      { title: "Bulk supply", body: "Matching accessories for teams and cafés." },
    ],
    quoteInterest: "Peripherals & accessories",
    metaDescription: "Keyboards, mice, headsets, monitors, printers and security cameras from Squinix Solutions, Noida West.",
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
