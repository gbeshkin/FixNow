export const supportedLocales = ["en", "et", "ru"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

export const dictionary = {
  en: {
    appName: "HandyGo",
    slogan: "Reliable help near you.",
    findHandyman: "Find a handyman"
  }
} satisfies Record<string, Record<string, string>>;
