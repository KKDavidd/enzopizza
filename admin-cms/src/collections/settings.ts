// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firestore collection: settings
//
// Two fixed documents live here:
//   settings/general    — address, phone, email, messenger, hero photo
//   settings/hours      — weekly opening hours
//   settings/allergens  — optional override of the allergen number→label legend
//
// FireCMS doesn't have a native "singleton document" concept, so
// this is modeled as a normal collection whose entity IDs are
// fixed strings — the admin always edits the same three rows.
// ============================================================

import { buildCollection, buildProperty } from "@firecms/core";

type DayHours = { open: string; close: string; closed?: boolean };

export type Settings = {
  // --- present on settings/general ---
  address?: string;
  addressMapsUrl?: string;
  phone?: string;
  phoneDisplay?: string;
  email?: string;
  messengerUrl?: string;
  heroPhotoUrl?: string;

  // --- present on settings/hours ---
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

const dayHoursProperty = (label: string) =>
  buildProperty<DayHours>({
    name: label,
    dataType: "map",
    properties: {
      closed: buildProperty({
        name: "Zárva",
        dataType: "boolean",
        defaultValue: false
      }),
      open: buildProperty({
        name: "Nyitás",
        dataType: "string",
        description: "Formátum: ÓÓ:PP, pl. 11:00"
      }),
      close: buildProperty({
        name: "Zárás",
        dataType: "string",
        description: "Formátum: ÓÓ:PP, pl. 20:00"
      })
    }
  });

export const settingsCollection = buildCollection<Settings>({
  id: "settings",
  path: "settings",
  name: "Beállítások",
  singularName: "Beállítás",
  description: "Elérhetőségek és nyitvatartás. Két fix dokumentum: 'general' (kapcsolat) és 'hours' (nyitvatartás) — ne hozz létre újat, csak ezt a kettőt szerkeszd.",
  icon: "Settings",
  group: "Beállítások",
  defaultSize: "l",
  properties: {
    address: buildProperty({
      name: "Cím",
      dataType: "string",
      description: "Csak a 'general' dokumentumon töltsd ki."
    }),
    addressMapsUrl: buildProperty({
      name: "Google Maps link",
      dataType: "string",
      url: true
    }),
    phone: buildProperty({
      name: "Telefonszám (hívható formátum)",
      dataType: "string",
      description: "Pl. +36705846276 — ezt használja a 'hívás' gomb."
    }),
    phoneDisplay: buildProperty({
      name: "Telefonszám (megjelenített)",
      dataType: "string",
      description: "Pl. (70) 584 6276"
    }),
    email: buildProperty({
      name: "Email",
      dataType: "string",
      email: true
    }),
    messengerUrl: buildProperty({
      name: "Messenger link",
      dataType: "string",
      url: true
    }),
    heroPhotoUrl: buildProperty({
      name: "Főoldali (hero) fotó URL",
      dataType: "string",
      url: true,
      description: "Csak a 'general' dokumentumon töltsd ki. Illessz be egy publikus kép linket (pl. Imgur, ImageKit, Cloudinary) — ez cseréli le a főoldal jobb felső pizza fotóját. A Firebase Storage fizetős, ezért itt nincs közvetlen feltöltés."
    }),
    monday: dayHoursProperty("Hétfő"),
    tuesday: dayHoursProperty("Kedd"),
    wednesday: dayHoursProperty("Szerda"),
    thursday: dayHoursProperty("Csütörtök"),
    friday: dayHoursProperty("Péntek"),
    saturday: dayHoursProperty("Szombat"),
    sunday: dayHoursProperty("Vasárnap")
  }
});
