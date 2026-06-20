// Passport options for onboarding. KE is fully seeded; others are placeholders
// that fall back to the same demo dataset until their rules are added.
export interface Passport {
  code: string;
  name: string;
  flag: string;
  seeded: boolean;
}

export const PASSPORTS: Passport[] = [
  { code: "KE", name: "Kenya", flag: "🇰🇪", seeded: true },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", seeded: false },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", seeded: false },
  { code: "GH", name: "Ghana", flag: "🇬🇭", seeded: false },
  { code: "UG", name: "Uganda", flag: "🇺🇬", seeded: false },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", seeded: false },
  { code: "IN", name: "India", flag: "🇮🇳", seeded: false },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", seeded: false },
  { code: "US", name: "United States", flag: "🇺🇸", seeded: false },
];

export const getPassport = (code: string) =>
  PASSPORTS.find((p) => p.code === code);
