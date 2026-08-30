import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { coreTranslations } from "src/locales/core"
import { recurringTranslations } from "src/locales/recurring"
import { movieTranslations } from "src/locales/movies"
import { businessTranslations } from "src/locales/business"

export const supportedLanguages = ["en", "de", "hu"] as const
export type AppLanguage = (typeof supportedLanguages)[number]

const LANGUAGE_STORAGE_KEY = "life-stack-language"

const baseResources = {
  en: {
    translation: {
      brand: { subtitle: "Personal operating system" },
      common: { close: "Close", sidebar: "Sidebar", mobileSidebar: "Displays the mobile sidebar.", toggleSidebar: "Toggle sidebar", breadcrumb: "Breadcrumb", more: "More" },
      nav: {
        groups: { home: "Home", life: "Life management", account: "Account" },
        dashboard: "Dashboard",
        tasks: "Tasks",
        allTasks: "All tasks",
        today: "Today",
        completed: "Completed",
        expenses: "Expenses",
        allExpenses: "All expenses",
        recurring: "Recurring",
        coveragePlan: "Coverage plan",
        spendingOverview: "Spending overview",
        movies: "Movies",
        discover: "Discover",
        wantToWatch: "Want to watch",
        watchedRated: "Watched & rated",
        aiSuggestions: "AI suggestions",
        business: "Business",
        overview: "Overview",
        clients: "Clients",
        invoices: "Invoices",
        profile: "Profile",
        settings: "Settings",
      },
      account: {
        myAccount: "My account",
        signedIn: "Signed in",
        profile: "Profile",
        settings: "Settings",
        logout: "Log out",
      },
      settings: {
        eyebrow: "My account",
        title: "Settings",
        description: "Customize how Life Stack works for you.",
        languageTitle: "Language",
        languageDescription: "Choose the language used throughout Life Stack.",
        languageHelp: "Your choice is saved to your account and follows you across devices.",
        saving: "Saving language…",
        saved: "Language preference saved.",
        saveError: "Could not save your language preference.",
        active: "Current language",
        languages: {
          en: { name: "English", description: "English (United Kingdom / United States)" },
          de: { name: "Deutsch", description: "German" },
          hu: { name: "Magyar", description: "Hungarian" },
        },
      },
      login: {
        welcome: "Welcome back",
        subtitle: "Sign in to your private Life Stack OS.",
        username: "Username",
        usernamePlaceholder: "Enter your username",
        password: "Password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        submit: "Login",
        submitting: "Logging in…",
        usernameRequired: "Enter your username.",
        passwordRequired: "Enter your password.",
        invalidCredentials: "The username or password you entered is incorrect.",
        rateLimited_one: "Too many login attempts. Try again in about {{count}} minute.",
        rateLimited_other: "Too many login attempts. Try again in about {{count}} minutes.",
        unavailable: "We couldn't log you in right now. Please try again.",
        sessionFailed: "Your session could not be started. Please try again.",
        connectionFailed: "We couldn't reach the server. Check your connection and try again.",
        imageAlt: "Life Stack workspace",
      },
    },
  },
  de: {
    translation: {
      brand: { subtitle: "Persönliches Betriebssystem" },
      common: { close: "Schließen", sidebar: "Seitenleiste", mobileSidebar: "Zeigt die mobile Seitenleiste an.", toggleSidebar: "Seitenleiste umschalten", breadcrumb: "Brotkrümelnavigation", more: "Mehr" },
      nav: {
        groups: { home: "Start", life: "Lebensverwaltung", account: "Konto" },
        dashboard: "Dashboard",
        tasks: "Aufgaben",
        allTasks: "Alle Aufgaben",
        today: "Heute",
        completed: "Erledigt",
        expenses: "Ausgaben",
        allExpenses: "Alle Ausgaben",
        recurring: "Wiederkehrend",
        coveragePlan: "Deckungsplan",
        spendingOverview: "Ausgabenübersicht",
        movies: "Filme",
        discover: "Entdecken",
        wantToWatch: "Möchte ich sehen",
        watchedRated: "Gesehen & bewertet",
        aiSuggestions: "KI-Empfehlungen",
        business: "Unternehmen",
        overview: "Übersicht",
        clients: "Kunden",
        invoices: "Rechnungen",
        profile: "Profil",
        settings: "Einstellungen",
      },
      account: {
        myAccount: "Mein Konto",
        signedIn: "Angemeldet",
        profile: "Profil",
        settings: "Einstellungen",
        logout: "Abmelden",
      },
      settings: {
        eyebrow: "Mein Konto",
        title: "Einstellungen",
        description: "Passe Life Stack an deine Bedürfnisse an.",
        languageTitle: "Sprache",
        languageDescription: "Wähle die Sprache für die gesamte Life-Stack-Oberfläche.",
        languageHelp: "Deine Auswahl wird im Konto gespeichert und auf allen Geräten übernommen.",
        saving: "Sprache wird gespeichert…",
        saved: "Spracheinstellung gespeichert.",
        saveError: "Die Spracheinstellung konnte nicht gespeichert werden.",
        active: "Aktuelle Sprache",
        languages: {
          en: { name: "English", description: "Englisch" },
          de: { name: "Deutsch", description: "Deutsch" },
          hu: { name: "Magyar", description: "Ungarisch" },
        },
      },
      login: {
        welcome: "Willkommen zurück",
        subtitle: "Melde dich bei deinem privaten Life Stack OS an.",
        username: "Benutzername",
        usernamePlaceholder: "Benutzernamen eingeben",
        password: "Passwort",
        showPassword: "Passwort anzeigen",
        hidePassword: "Passwort ausblenden",
        submit: "Anmelden",
        submitting: "Anmeldung läuft…",
        usernameRequired: "Gib deinen Benutzernamen ein.",
        passwordRequired: "Gib dein Passwort ein.",
        invalidCredentials: "Benutzername oder Passwort ist falsch.",
        rateLimited_one: "Zu viele Anmeldeversuche. Versuche es in etwa {{count}} Minute erneut.",
        rateLimited_other: "Zu viele Anmeldeversuche. Versuche es in etwa {{count}} Minuten erneut.",
        unavailable: "Die Anmeldung ist momentan nicht möglich. Versuche es erneut.",
        sessionFailed: "Deine Sitzung konnte nicht gestartet werden. Versuche es erneut.",
        connectionFailed: "Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.",
        imageAlt: "Life-Stack-Arbeitsbereich",
      },
    },
  },
  hu: {
    translation: {
      brand: { subtitle: "Személyes operációs rendszer" },
      common: { close: "Bezárás", sidebar: "Oldalsáv", mobileSidebar: "Megjeleníti a mobil oldalsávot.", toggleSidebar: "Oldalsáv váltása", breadcrumb: "Morzsanavigáció", more: "Továbbiak" },
      nav: {
        groups: { home: "Kezdőlap", life: "Életkezelés", account: "Fiók" },
        dashboard: "Irányítópult",
        tasks: "Feladatok",
        allTasks: "Összes feladat",
        today: "Ma",
        completed: "Befejezve",
        expenses: "Kiadások",
        allExpenses: "Összes kiadás",
        recurring: "Ismétlődő",
        coveragePlan: "Fedezeti terv",
        spendingOverview: "Kiadási áttekintés",
        movies: "Filmek",
        discover: "Felfedezés",
        wantToWatch: "Megnézendő",
        watchedRated: "Megnézett és értékelt",
        aiSuggestions: "MI-ajánlások",
        business: "Vállalkozások",
        overview: "Áttekintés",
        clients: "Ügyfelek",
        invoices: "Számlák",
        profile: "Profil",
        settings: "Beállítások",
      },
      account: {
        myAccount: "Saját fiók",
        signedIn: "Bejelentkezve",
        profile: "Profil",
        settings: "Beállítások",
        logout: "Kijelentkezés",
      },
      settings: {
        eyebrow: "Saját fiók",
        title: "Beállítások",
        description: "Szabd személyre a Life Stack működését.",
        languageTitle: "Nyelv",
        languageDescription: "Válaszd ki a Life Stack teljes felületének nyelvét.",
        languageHelp: "A választásodat a fiókodban tároljuk, így minden eszközödön érvényes lesz.",
        saving: "Nyelv mentése…",
        saved: "A nyelvi beállítás mentve.",
        saveError: "A nyelvi beállítást nem sikerült menteni.",
        active: "Jelenlegi nyelv",
        languages: {
          en: { name: "English", description: "Angol" },
          de: { name: "Deutsch", description: "Német" },
          hu: { name: "Magyar", description: "Magyar" },
        },
      },
      login: {
        welcome: "Üdv újra",
        subtitle: "Jelentkezz be a privát Life Stack OS-be.",
        username: "Felhasználónév",
        usernamePlaceholder: "Add meg a felhasználóneved",
        password: "Jelszó",
        showPassword: "Jelszó megjelenítése",
        hidePassword: "Jelszó elrejtése",
        submit: "Bejelentkezés",
        submitting: "Bejelentkezés…",
        usernameRequired: "Add meg a felhasználóneved.",
        passwordRequired: "Add meg a jelszavad.",
        invalidCredentials: "A megadott felhasználónév vagy jelszó helytelen.",
        rateLimited_one: "Túl sok bejelentkezési kísérlet. Próbáld újra körülbelül {{count}} perc múlva.",
        rateLimited_other: "Túl sok bejelentkezési kísérlet. Próbáld újra körülbelül {{count}} perc múlva.",
        unavailable: "Most nem sikerült bejelentkezni. Próbáld újra.",
        sessionFailed: "A munkamenetet nem sikerült elindítani. Próbáld újra.",
        connectionFailed: "A szerver nem érhető el. Ellenőrizd a kapcsolatot, majd próbáld újra.",
        imageAlt: "Life Stack munkaterület",
      },
    },
  },
} as const

const resources = {
  en: { translation: baseResources.en.translation, core: coreTranslations.en, recurring: recurringTranslations.en, movies: movieTranslations.en, business: businessTranslations.en },
  de: { translation: baseResources.de.translation, core: coreTranslations.de, recurring: recurringTranslations.de, movies: movieTranslations.de, business: businessTranslations.de },
  hu: { translation: baseResources.hu.translation, core: coreTranslations.hu, recurring: recurringTranslations.hu, movies: movieTranslations.hu, business: businessTranslations.hu },
} as const

export function normalizeAppLanguage(language?: string | null): AppLanguage {
  const baseLanguage = language?.toLowerCase().split("-")[0]
  return supportedLanguages.includes(baseLanguage as AppLanguage)
    ? (baseLanguage as AppLanguage)
    : "en"
}

const initialLanguage = normalizeAppLanguage(
  window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? window.navigator.language,
)

document.documentElement.lang = initialLanguage

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  ns: ["translation", "core", "recurring", "movies", "business"],
  defaultNS: "translation",
  load: "languageOnly",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = normalizeAppLanguage(language)
})

export async function changeAppLanguage(language: AppLanguage) {
  await i18n.changeLanguage(language)
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export default i18n
