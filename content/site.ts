// Single source of truth for company details.
// Anything marked TODO(client) must be confirmed - see CONTENT-CHECKLIST.md.

export const site = {
  name: "Squinix Solutions Private Limited",
  short: "Squinix",
  url: "https://squinix.com",
  tagline: "IT hardware, gaming hardware and consulting.",
  description:
    "Squinix Solutions supplies gaming PCs, business computers, servers, networking and peripherals, and provides IT consulting, from Noida West, India.",
  email: "info@squinix.com",
  phone: { display: "+91 83839 21743", tel: "+918383921743" },
  whatsapp: { display: "+91 88009 69632", number: "918800969632" },
  address: {
    street: "Noida West",
    region: "Uttar Pradesh",
    postalCode: "201306",
    country: "IN",
    line: "Noida West, Uttar Pradesh, India - 201306",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Noida+West%2C+Uttar+Pradesh+201306",
  },
  // TODO(client): add the real profile URLs. Icons only render for non-empty values.
  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    x: "",
  },
  // TODO(client): registered office + CIN, usually shown in the footer of an Indian private limited company.
  legal: {
    cin: "",
    registeredOffice: "",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products/gaming/", mega: true },
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
] as const;
