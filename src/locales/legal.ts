export type LegalSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export type LegalDocument = {
  title: string
  summary: string
  updated: string
  notice: string
  sections: LegalSection[]
}

export type LegalCopy = {
  brandSubtitle: string
  privacy: string
  terms: string
  signIn: string
  language: string
  controller: string
  contact: string
  contactFallback: string
  privacyDocument: LegalDocument
  termsDocument: LegalDocument
}

export const legalTranslations: Record<"en" | "de" | "hu", LegalCopy> = {
  en: {
    brandSubtitle: "Private personal operating system",
    privacy: "Privacy notice",
    terms: "Terms of use",
    signIn: "Sign in",
    language: "Language",
    controller: "Operator / controller",
    contact: "Data-protection contact",
    contactFallback: "Use the data-protection email displayed during the Enable Banking consent flow.",
    privacyDocument: {
      title: "Privacy notice",
      summary: "How LifeOS handles personal, financial, and technical data in this private application.",
      updated: "Effective 1 September 2026",
      notice: "This notice describes the current private, restricted deployment. It must be reviewed before LifeOS is offered publicly or commercially.",
      sections: [
        {
          heading: "1. Scope and controller",
          paragraphs: [
            "LifeOS is a privately operated application for invited household users. The operator determines why and how data is processed and is the controller where data-protection law applies.",
          ],
        },
        {
          heading: "2. Data processed",
          bullets: [
            "Account and profile data: username, email address, display name, biography, profile image, language, and security-session information.",
            "User content: tasks, expenses, recurring commitments, movie lists, ratings, critiques, business records, clients, invoices, and uploaded branding assets.",
            "Bank data: institution and account labels, country, account type, currency, balances, last four IBAN characters, and minimal transaction details such as status, direction, amount, date, merchant, description, and category suggestion.",
            "Security data: session identifiers, browser user agent, random device identifier hashes, and HMAC-protected login-throttling identifiers. Raw passwords, bank PINs, TANs, and full online-banking credentials are not collected.",
          ],
        },
        {
          heading: "3. Sources and purposes",
          paragraphs: [
            "Data comes from you, from features you use, and—only after your authorization—from Enable Banking and your selected bank. It is used to operate LifeOS, secure access, synchronize read-only bank information, prepare expense records, create invoices, and provide movie features you request.",
          ],
        },
        {
          heading: "4. Legal basis",
          paragraphs: [
            "Where the GDPR applies, processing necessary to provide requested application features relies on performance of the user arrangement or steps requested by you. Bank access is initiated only with your explicit authorization at the bank. Security logging and abuse prevention rely on the operator's legitimate interest in protecting the private service. Optional features are used only when you choose them.",
          ],
        },
        {
          heading: "5. External services and recipients",
          bullets: [
            "Enable Banking receives the selected institution, country, authorization state, and signed API requests, and returns authorized account and transaction data. The bank handles authentication and consent; LifeOS never receives your bank password, PIN, or TAN.",
            "OMDb receives movie search queries when movie discovery is used.",
            "OpenAI receives the limited movie-profile or critique text described in the relevant feature when AI recommendations or rewriting are requested. Requests are configured not to be stored by the API where supported.",
            "Infrastructure providers may process encrypted traffic, application logs, backups, and PostgreSQL data solely to host and secure the service.",
          ],
        },
        {
          heading: "6. Storage, retention, and deletion",
          paragraphs: [
            "Data is stored in the operator-controlled PostgreSQL database. Provider session identifiers are encrypted; only the last four IBAN characters are retained. Synced bank records remain until they are deleted from the database or the relevant LifeOS account is removed. Disconnecting a bank revokes future provider access but intentionally preserves previously imported expenses. Security records expire according to the configured session and rate-limit periods; backups follow the operator's backup-retention schedule.",
          ],
        },
        {
          heading: "7. Security",
          paragraphs: [
            "LifeOS uses HTTPS in public deployment, secure HttpOnly session cookies, short-lived access tokens, password hashing, persistent login throttling, per-user authorization checks, encrypted provider sessions, database access controls, and restricted registration. No system can guarantee absolute security.",
          ],
        },
        {
          heading: "8. Your choices and rights",
          paragraphs: [
            "You can disconnect a bank at any time and can request access, correction, export, restriction, or deletion of personal data. Where processing is based on consent, you may withdraw it without affecting earlier lawful processing. Where applicable, you may object and lodge a complaint with the competent data-protection authority.",
          ],
        },
        {
          heading: "9. International transfers and automated decisions",
          paragraphs: [
            "Some external providers may process data outside your country under their applicable safeguards. LifeOS category suggestions and movie recommendations do not make legal or similarly significant decisions about you.",
          ],
        },
        {
          heading: "10. Changes",
          paragraphs: [
            "This notice will be updated when the data flow, providers, deployment, or legal requirements materially change. The effective date above identifies the current version.",
          ],
        },
      ],
    },
    termsDocument: {
      title: "Terms of use",
      summary: "Rules for using the private LifeOS application and its read-only bank connection.",
      updated: "Effective 1 September 2026",
      notice: "These terms are written for private, restricted use by invited household users and require legal review before any public or commercial launch.",
      sections: [
        { heading: "1. Private service", paragraphs: ["LifeOS is provided as a private personal-management tool to users expressly invited by the operator. It is not offered to the general public."] },
        { heading: "2. Account responsibility", paragraphs: ["You must provide accurate information, protect your credentials and devices, and promptly revoke unfamiliar sessions. You may link only bank accounts that you own or are legally authorized to access."] },
        { heading: "3. Read-only bank connection", paragraphs: ["LifeOS retrieves balances and transactions only after bank authorization. It does not initiate payments, transfers, direct debits, trades, or changes to your bank account. Importing a transaction creates a LifeOS expense record only."] },
        { heading: "4. No professional advice", paragraphs: ["LifeOS provides organizational calculations and summaries, not financial, investment, tax, legal, accounting, or insurance advice. Verify important information against original bank, contract, invoice, and authority records."] },
        { heading: "5. Accuracy and availability", paragraphs: ["Bank and third-party data may be delayed, incomplete, duplicated, temporarily unavailable, or later corrected. Category suggestions and forecasts are estimates. You remain responsible for reviewing imported records and maintaining independent records where required."] },
        { heading: "6. Third-party services", paragraphs: ["Enable Banking, connected banks, OMDb, OpenAI, and hosting providers operate under their own terms and privacy notices. Their availability and decisions are outside the operator's control. Bank consent may expire and require reauthorization."] },
        { heading: "7. Acceptable use", paragraphs: ["Do not attempt unauthorized access, evade security controls, connect accounts without authority, upload unlawful content, interfere with the service, or use LifeOS for public or commercial account aggregation without the required agreements and regulatory review."] },
        { heading: "8. Your content", paragraphs: ["You retain responsibility for information you enter or upload. You grant the operator only the limited permission needed to store, process, back up, and display that content to provide the service."] },
        { heading: "9. Suspension and termination", paragraphs: ["Access may be suspended to protect users, data, or infrastructure. You may stop using LifeOS and disconnect bank access at any time. Disconnecting stops future synchronization but does not automatically remove previously imported expenses or retained database records."] },
        { heading: "10. Liability and changes", paragraphs: ["To the extent permitted by applicable law, the private service is provided without guarantees of uninterrupted availability or fitness for a specific purpose. Nothing excludes rights or liability that cannot legally be excluded. These terms may be updated when the service changes; material changes will be identified by a new effective date."] },
      ],
    },
  },
  de: {
    brandSubtitle: "Privates persönliches Betriebssystem",
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    signIn: "Anmelden",
    language: "Sprache",
    controller: "Betreiber / Verantwortlicher",
    contact: "Datenschutzkontakt",
    contactFallback: "Verwende die Datenschutz-E-Mail, die während der Enable-Banking-Einwilligung angezeigt wird.",
    privacyDocument: {
      title: "Datenschutzerklärung",
      summary: "Wie LifeOS persönliche, finanzielle und technische Daten in dieser privaten Anwendung verarbeitet.",
      updated: "Gültig ab 1. September 2026",
      notice: "Diese Erklärung beschreibt die aktuelle private, eingeschränkte Bereitstellung. Vor einer öffentlichen oder kommerziellen Nutzung muss sie rechtlich geprüft werden.",
      sections: [
        { heading: "1. Geltungsbereich und Verantwortlicher", paragraphs: ["LifeOS ist eine privat betriebene Anwendung für eingeladene Haushaltsmitglieder. Der Betreiber bestimmt Zweck und Mittel der Verarbeitung und ist, soweit Datenschutzrecht anwendbar ist, der Verantwortliche."] },
        { heading: "2. Verarbeitete Daten", bullets: [
          "Konto- und Profildaten: Benutzername, E-Mail-Adresse, Anzeigename, Biografie, Profilbild, Sprache und Informationen zu Sicherheitssitzungen.",
          "Nutzerinhalte: Aufgaben, Ausgaben, laufende Verpflichtungen, Filmlisten, Bewertungen, Kritiken, Unternehmensdaten, Kunden, Rechnungen und hochgeladene Branding-Dateien.",
          "Bankdaten: Institut und Kontobezeichnungen, Land, Kontotyp, Währung, Salden, die letzten vier IBAN-Zeichen sowie minimale Umsatzdaten wie Status, Richtung, Betrag, Datum, Händler, Beschreibung und Kategorieempfehlung.",
          "Sicherheitsdaten: Sitzungskennungen, Browser-User-Agent, Hashes zufälliger Gerätekennungen und HMAC-geschützte Kennungen zur Anmeldebegrenzung. Unverschlüsselte Passwörter, Bank-PINs, TANs und vollständige Online-Banking-Zugangsdaten werden nicht erhoben.",
        ] },
        { heading: "3. Quellen und Zwecke", paragraphs: ["Daten stammen von dir, aus den von dir genutzten Funktionen und – erst nach deiner Autorisierung – von Enable Banking und deiner ausgewählten Bank. Sie werden zum Betrieb und Schutz von LifeOS, zur schreibgeschützten Banksynchronisierung, zur Ausgabenerfassung, Rechnungserstellung und für angeforderte Filmfunktionen verarbeitet."] },
        { heading: "4. Rechtsgrundlage", paragraphs: ["Soweit die DSGVO gilt, beruht die für angeforderte Funktionen notwendige Verarbeitung auf der Erfüllung der Nutzungsvereinbarung oder auf vorvertraglichen Maßnahmen auf deine Anfrage. Bankzugriff beginnt nur mit deiner ausdrücklichen Autorisierung bei der Bank. Sicherheitsprotokollierung und Missbrauchsschutz beruhen auf dem berechtigten Interesse des Betreibers, den privaten Dienst zu schützen. Optionale Funktionen werden nur auf deine Auswahl hin genutzt."] },
        { heading: "5. Externe Dienste und Empfänger", bullets: [
          "Enable Banking erhält das ausgewählte Institut, Land, den Autorisierungsstatus und signierte API-Anfragen und liefert autorisierte Konto- und Umsatzdaten. Die Bank übernimmt Anmeldung und Einwilligung; LifeOS erhält niemals Bankpasswort, PIN oder TAN.",
          "OMDb erhält Suchbegriffe, wenn die Filmsuche verwendet wird.",
          "OpenAI erhält das begrenzte Filmprofil oder den Kritiktext der jeweiligen Funktion, wenn KI-Empfehlungen oder Überarbeitungen angefordert werden. API-Speicherung ist deaktiviert, soweit unterstützt.",
          "Infrastrukturanbieter können verschlüsselten Verkehr, Anwendungsprotokolle, Sicherungen und PostgreSQL-Daten ausschließlich zum Hosting und Schutz des Dienstes verarbeiten.",
        ] },
        { heading: "6. Speicherung, Aufbewahrung und Löschung", paragraphs: ["Daten werden in der vom Betreiber kontrollierten PostgreSQL-Datenbank gespeichert. Anbieter-Sitzungskennungen sind verschlüsselt; von der IBAN werden nur die letzten vier Zeichen gespeichert. Synchronisierte Bankdaten bleiben bis zur Datenbanklöschung oder Entfernung des LifeOS-Kontos erhalten. Das Trennen einer Bank widerruft zukünftigen Zugriff, bewahrt aber importierte Ausgaben. Sicherheitsdaten laufen gemäß den konfigurierten Sitzungs- und Ratenbegrenzungsfristen ab; Sicherungen folgen dem Aufbewahrungsplan des Betreibers."] },
        { heading: "7. Sicherheit", paragraphs: ["LifeOS verwendet bei öffentlicher Bereitstellung HTTPS, sichere HttpOnly-Sitzungscookies, kurzlebige Zugriffstoken, Passwort-Hashing, dauerhafte Anmeldebegrenzung, benutzerbezogene Berechtigungsprüfungen, verschlüsselte Anbieter-Sitzungen, Datenbankzugriffskontrollen und eingeschränkte Registrierung. Absolute Sicherheit kann kein System garantieren."] },
        { heading: "8. Wahlmöglichkeiten und Rechte", paragraphs: ["Du kannst eine Bank jederzeit trennen und Auskunft, Berichtigung, Export, Einschränkung oder Löschung personenbezogener Daten verlangen. Einwilligungen können mit Wirkung für die Zukunft widerrufen werden. Soweit anwendbar, kannst du widersprechen und dich bei der zuständigen Datenschutzaufsichtsbehörde beschweren."] },
        { heading: "9. Internationale Übermittlungen und automatisierte Entscheidungen", paragraphs: ["Externe Anbieter können Daten unter ihren jeweiligen Garantien außerhalb deines Landes verarbeiten. Kategorieempfehlungen und Filmvorschläge von LifeOS treffen keine rechtlichen oder ähnlich erheblichen Entscheidungen über dich."] },
        { heading: "10. Änderungen", paragraphs: ["Diese Erklärung wird angepasst, wenn sich Datenflüsse, Anbieter, Bereitstellung oder rechtliche Anforderungen wesentlich ändern. Das oben genannte Datum kennzeichnet die aktuelle Fassung."] },
      ],
    },
    termsDocument: {
      title: "Nutzungsbedingungen",
      summary: "Regeln für die private Nutzung von LifeOS und seiner schreibgeschützten Bankanbindung.",
      updated: "Gültig ab 1. September 2026",
      notice: "Diese Bedingungen sind für die private, eingeschränkte Nutzung durch eingeladene Haushaltsmitglieder bestimmt und müssen vor einem öffentlichen oder kommerziellen Start rechtlich geprüft werden.",
      sections: [
        { heading: "1. Privater Dienst", paragraphs: ["LifeOS wird als privates persönliches Verwaltungswerkzeug ausschließlich ausdrücklich eingeladenen Nutzern bereitgestellt und nicht der Allgemeinheit angeboten."] },
        { heading: "2. Kontoverantwortung", paragraphs: ["Du musst richtige Angaben machen, Zugangsdaten und Geräte schützen und unbekannte Sitzungen unverzüglich widerrufen. Du darfst nur Bankkonten verbinden, die dir gehören oder auf die du rechtmäßig zugreifen darfst."] },
        { heading: "3. Schreibgeschützte Bankanbindung", paragraphs: ["LifeOS ruft Salden und Umsätze erst nach Bankautorisierung ab. Es löst keine Zahlungen, Überweisungen, Lastschriften, Wertpapiergeschäfte oder Kontoänderungen aus. Der Import eines Umsatzes erstellt ausschließlich einen Ausgabeneintrag in LifeOS."] },
        { heading: "4. Keine professionelle Beratung", paragraphs: ["LifeOS liefert organisatorische Berechnungen und Übersichten, keine Finanz-, Anlage-, Steuer-, Rechts-, Buchhaltungs- oder Versicherungsberatung. Prüfe wichtige Angaben anhand der ursprünglichen Bank-, Vertrags-, Rechnungs- und Behördenunterlagen."] },
        { heading: "5. Richtigkeit und Verfügbarkeit", paragraphs: ["Bank- und Drittdaten können verzögert, unvollständig, doppelt, vorübergehend nicht verfügbar oder später berichtigt sein. Kategorien und Prognosen sind Schätzungen. Du bist für die Prüfung importierter Einträge und erforderliche unabhängige Aufzeichnungen verantwortlich."] },
        { heading: "6. Drittanbieter", paragraphs: ["Enable Banking, verbundene Banken, OMDb, OpenAI und Hostinganbieter handeln nach eigenen Bedingungen und Datenschutzhinweisen. Ihre Verfügbarkeit und Entscheidungen liegen außerhalb der Kontrolle des Betreibers. Bankeinwilligungen können ablaufen und eine erneute Autorisierung erfordern."] },
        { heading: "7. Zulässige Nutzung", paragraphs: ["Unzulässig sind unberechtigter Zugriff, Umgehung von Schutzmaßnahmen, Verbindung nicht autorisierter Konten, rechtswidrige Inhalte, Störung des Dienstes sowie öffentliche oder kommerzielle Kontenaggregation ohne erforderliche Verträge und regulatorische Prüfung."] },
        { heading: "8. Deine Inhalte", paragraphs: ["Du bleibst für eingegebene und hochgeladene Informationen verantwortlich. Du gestattest dem Betreiber nur die Speicherung, Verarbeitung, Sicherung und Anzeige, die zur Bereitstellung des Dienstes erforderlich ist."] },
        { heading: "9. Sperrung und Beendigung", paragraphs: ["Der Zugriff kann zum Schutz von Nutzern, Daten oder Infrastruktur ausgesetzt werden. Du kannst LifeOS jederzeit nicht mehr verwenden und den Bankzugriff trennen. Die Trennung beendet zukünftige Synchronisierung, löscht jedoch importierte Ausgaben oder gespeicherte Daten nicht automatisch."] },
        { heading: "10. Haftung und Änderungen", paragraphs: ["Soweit gesetzlich zulässig, wird der private Dienst ohne Garantie ununterbrochener Verfügbarkeit oder Eignung für einen bestimmten Zweck bereitgestellt. Zwingende Rechte und nicht ausschließbare Haftung bleiben unberührt. Änderungen werden durch ein neues Gültigkeitsdatum kenntlich gemacht."] },
      ],
    },
  },
  hu: {
    brandSubtitle: "Privát személyes operációs rendszer",
    privacy: "Adatkezelési tájékoztató",
    terms: "Felhasználási feltételek",
    signIn: "Bejelentkezés",
    language: "Nyelv",
    controller: "Üzemeltető / adatkezelő",
    contact: "Adatvédelmi kapcsolattartó",
    contactFallback: "Használd az Enable Banking hozzájárulási folyamatában megjelenő adatvédelmi e-mail-címet.",
    privacyDocument: {
      title: "Adatkezelési tájékoztató",
      summary: "Hogyan kezeli a LifeOS a személyes, pénzügyi és technikai adatokat ebben a privát alkalmazásban.",
      updated: "Hatályos: 2026. szeptember 1.",
      notice: "Ez a tájékoztató a jelenlegi privát, korlátozott használatot írja le. Nyilvános vagy kereskedelmi indulás előtt jogi felülvizsgálat szükséges.",
      sections: [
        { heading: "1. Hatály és adatkezelő", paragraphs: ["A LifeOS meghívott háztartási felhasználóknak szánt, magánüzemeltetésű alkalmazás. Az üzemeltető határozza meg az adatkezelés célját és módját, ezért az alkalmazandó adatvédelmi jog szerint adatkezelőnek minősül."] },
        { heading: "2. Kezelt adatok", bullets: [
          "Fiók- és profiladatok: felhasználónév, e-mail-cím, megjelenített név, bemutatkozás, profilkép, nyelv és biztonsági munkamenetadatok.",
          "Felhasználói tartalom: feladatok, kiadások, rendszeres kötelezettségek, filmlisták, értékelések, kritikák, üzleti adatok, ügyfelek, számlák és feltöltött arculati fájlok.",
          "Banki adatok: intézmény- és számlamegnevezés, ország, számlatípus, pénznem, egyenleg, az IBAN utolsó négy karaktere, valamint a szükséges tranzakciós adatok, például állapot, irány, összeg, dátum, kereskedő, leírás és kategóriajavaslat.",
          "Biztonsági adatok: munkamenet-azonosítók, böngésző user-agent, véletlenszerű eszközazonosítók hash-ei és HMAC-védett bejelentkezés-korlátozó azonosítók. Nyers jelszót, banki PIN-t, TAN-t vagy teljes netbanki belépési adatot a rendszer nem gyűjt.",
        ] },
        { heading: "3. Adatforrások és célok", paragraphs: ["Az adatok tőled, az általad használt funkciókból, valamint kizárólag engedélyezésed után az Enable Bankingtől és a kiválasztott banktól származnak. Céljuk a LifeOS működtetése és védelme, az írásvédett banki szinkronizálás, a kiadások kezelése, a számlakészítés és az általad kért filmes funkciók biztosítása."] },
        { heading: "4. Jogalap", paragraphs: ["A GDPR alkalmazása esetén a kért funkciókhoz szükséges adatkezelés a felhasználói megállapodás teljesítésén vagy a kérésedre tett lépéseken alapul. Banki hozzáférés csak a banknál adott kifejezett engedélyeddel indul. A biztonsági naplózás és visszaélés-megelőzés jogalapja a privát szolgáltatás védelméhez fűződő jogos érdek. Opcionális funkciók csak választásod alapján működnek."] },
        { heading: "5. Külső szolgáltatók és címzettek", bullets: [
          "Az Enable Banking megkapja a kiválasztott intézményt, országot, engedélyezési állapotot és az aláírt API-kéréseket, majd visszaadja az engedélyezett számla- és tranzakcióadatokat. A belépést és hozzájárulást a bank kezeli; a LifeOS nem kapja meg a banki jelszavadat, PIN-edet vagy TAN-odat.",
          "Az OMDb a filmes keresés használatakor megkapja a keresőkifejezést.",
          "Az OpenAI a kért MI-ajánlás vagy szövegátírás során az adott funkcióban leírt, korlátozott filmprofilt vagy kritikát kapja meg. Ahol támogatott, az API-adattárolás ki van kapcsolva.",
          "Az infrastruktúra-szolgáltatók kizárólag az üzemeltetés és védelem céljából kezelhetnek titkosított forgalmat, alkalmazásnaplókat, mentéseket és PostgreSQL-adatokat.",
        ] },
        { heading: "6. Tárolás, megőrzés és törlés", paragraphs: ["Az adatok az üzemeltető által felügyelt PostgreSQL-adatbázisban vannak. A szolgáltatói munkamenet-azonosítók titkosítottak, az IBAN-ból csak az utolsó négy karakter marad meg. A szinkronizált banki rekordok adatbázis-törlésig vagy a LifeOS-fiók eltávolításáig megmaradnak. A bank leválasztása megszünteti a jövőbeli hozzáférést, de a korábban importált kiadásokat megőrzi. A biztonsági adatok a beállított munkamenet- és korlátozási időkkel járnak le; a mentések az üzemeltető megőrzési rendjét követik."] },
        { heading: "7. Biztonság", paragraphs: ["Nyilvános telepítésben a LifeOS HTTPS-t, biztonságos HttpOnly sütiket, rövid életű hozzáférési tokeneket, jelszóhash-elést, tartós belépési korlátozást, felhasználónkénti jogosultság-ellenőrzést, titkosított szolgáltatói munkameneteket, adatbázis-hozzáférés-védelmet és korlátozott regisztrációt használ. Teljes biztonságot egyetlen rendszer sem garantálhat."] },
        { heading: "8. Választásaid és jogaid", paragraphs: ["A bankkapcsolatot bármikor megszüntetheted, továbbá kérhetsz hozzáférést, helyesbítést, exportot, korlátozást vagy törlést. A hozzájárulás a korábbi jogszerű adatkezelés érintése nélkül visszavonható. Ahol alkalmazandó, tiltakozhatsz és panaszt tehetsz az illetékes adatvédelmi hatóságnál."] },
        { heading: "9. Nemzetközi adattovábbítás és automatizált döntések", paragraphs: ["Egyes külső szolgáltatók saját garanciáik mellett az országodon kívül is kezelhetnek adatokat. A LifeOS kategória- és filmajánlásai nem hoznak rád nézve jogi vagy hasonlóan jelentős döntést."] },
        { heading: "10. Módosítások", paragraphs: ["A tájékoztató frissül, ha az adatfolyam, a szolgáltatók, a telepítés vagy a jogi követelmények lényegesen változnak. A fenti hatálybalépési dátum jelöli az aktuális változatot."] },
      ],
    },
    termsDocument: {
      title: "Felhasználási feltételek",
      summary: "A privát LifeOS és írásvédett bankkapcsolatának használati szabályai.",
      updated: "Hatályos: 2026. szeptember 1.",
      notice: "A feltételek meghívott háztartási felhasználók privát, korlátozott használatára készültek; nyilvános vagy kereskedelmi indulás előtt jogi felülvizsgálat szükséges.",
      sections: [
        { heading: "1. Privát szolgáltatás", paragraphs: ["A LifeOS privát személyes rendszerező eszköz, amelyet az üzemeltető kizárólag kifejezetten meghívott felhasználóknak biztosít; a nagyközönség számára nem elérhető."] },
        { heading: "2. Fiókfelelősség", paragraphs: ["Pontos adatokat kell megadnod, védened kell a belépési adataidat és eszközeidet, az ismeretlen munkameneteket pedig azonnal vissza kell vonnod. Csak saját vagy jogszerűen hozzáférhető bankszámlát kapcsolhatsz össze."] },
        { heading: "3. Írásvédett bankkapcsolat", paragraphs: ["A LifeOS csak banki engedélyezés után kér le egyenlegeket és tranzakciókat. Nem kezdeményez fizetést, átutalást, beszedést, kereskedést vagy számlamódosítást. Egy tranzakció importálása kizárólag LifeOS-kiadási rekordot hoz létre."] },
        { heading: "4. Nem szakmai tanácsadás", paragraphs: ["A LifeOS rendszerezési számításokat és összesítéseket ad, nem pénzügyi, befektetési, adó-, jogi, számviteli vagy biztosítási tanácsot. A fontos információkat az eredeti banki, szerződéses, számla- és hatósági iratok alapján ellenőrizd."] },
        { heading: "5. Pontosság és rendelkezésre állás", paragraphs: ["A banki és külső adatok késhetnek, hiányosak vagy ismétlődők lehetnek, ideiglenesen kieshetnek, illetve később módosulhatnak. A kategóriák és előrejelzések becslések. Az importált tételek ellenőrzése és a szükséges külön nyilvántartások fenntartása a te felelősséged."] },
        { heading: "6. Külső szolgáltatások", paragraphs: ["Az Enable Banking, a kapcsolt bankok, az OMDb, az OpenAI és a tárhelyszolgáltatók saját feltételeik és adatvédelmi tájékoztatóik szerint működnek. Elérhetőségük és döntéseik nem az üzemeltető irányítása alatt állnak. A banki hozzájárulás lejárhat és új engedélyezést igényelhet."] },
        { heading: "7. Elfogadható használat", paragraphs: ["Tilos az illetéktelen hozzáférés, biztonsági védelem megkerülése, jogosulatlan számla összekapcsolása, jogellenes tartalom feltöltése, a szolgáltatás zavarása, illetve a szükséges megállapodások és szabályozási vizsgálat nélküli nyilvános vagy kereskedelmi számlaaggregáció."] },
        { heading: "8. Saját tartalmad", paragraphs: ["Te felelsz a megadott és feltöltött információkért. Az üzemeltető kizárólag a szolgáltatás biztosításához szükséges tárolási, feldolgozási, mentési és megjelenítési engedélyt kapja."] },
        { heading: "9. Felfüggesztés és megszüntetés", paragraphs: ["A hozzáférés a felhasználók, adatok vagy infrastruktúra védelmében felfüggeszthető. A LifeOS használatát és a bankkapcsolatot bármikor megszüntetheted. A leválasztás leállítja a későbbi szinkronizálást, de nem törli automatikusan az importált kiadásokat vagy tárolt rekordokat."] },
        { heading: "10. Felelősség és módosítások", paragraphs: ["A jogszabályok által megengedett mértékben a privát szolgáltatás megszakításmentes elérhetőségre vagy meghatározott célra való alkalmasságra vonatkozó garancia nélkül működik. A kötelező jogok és ki nem zárható felelősség változatlan marad. A lényeges módosításokat új hatálybalépési dátum jelzi."] },
      ],
    },
  },
}
