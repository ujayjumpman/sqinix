import {
  ArrowRight, ArrowUpRight, BatteryCharging, Boxes, Camera, Check, ChevronDown, CircuitBoard, Code, Compass, Cpu, Database,
  Fan, Gauge, HardDrive, Headset, Keyboard, Laptop, Mail, MapPin, MemoryStick, MessageCircle, Microchip, Monitor, Mouse,
  Network, Pause, PcCase, Phone, Play, Plug, Printer, Router, Server, Shield, ShieldCheck, Sparkles, Wifi, Workflow, Wrench, X, Menu,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const map: Record<string, ComponentType<LucideProps>> = {
  cpu: Cpu, gpu: CircuitBoard, chip: Microchip, memory: MemoryStick, fan: Fan, plug: Plug,
  laptop: Laptop, desktop: PcCase, workstation: HardDrive, monitor: Monitor, wrench: Wrench, boxes: Boxes,
  server: Server, database: Database, network: Network, shield: ShieldCheck, wifi: Wifi, battery: BatteryCharging,
  keyboard: Keyboard, mouse: Mouse, headset: Headset, printer: Printer, camera: Camera,
  compass: Compass, code: Code, workflow: Workflow, gauge: Gauge, router: Router, sparkles: Sparkles,
  arrow: ArrowRight, "arrow-up-right": ArrowUpRight, phone: Phone, mail: Mail, pin: MapPin, whatsapp: MessageCircle,
  check: Check, down: ChevronDown, play: Play, pause: Pause, close: X, menu: Menu, secure: Shield,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = map[name] ?? Sparkles;
  return <C aria-hidden strokeWidth={1.6} {...props} />;
}

/** Minimal monochrome brand glyphs built from primitives (lucide dropped brand icons). */
export function SocialIcon({ name, className }: { name: "instagram" | "facebook" | "linkedin" | "x"; className?: string }) {
  const p = { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  switch (name) {
    case "instagram":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...p}>
          <path d="M14 21v-8h2.6l.4-3H14V8.2c0-.9.3-1.5 1.600-1.500H17V4.100C16.700 4.100 15.800 4 14.800 4 12.600 4 11 5.300 11 7.800V10H8.500v3H11v8" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...p}>
          <path d="M6 10v8M6 6.200v.1M10.500 18v-8m0 3.500c0-2 1.200-3.500 3.200-3.500s2.800 1.300 2.800 3.500V18" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
  }
}
