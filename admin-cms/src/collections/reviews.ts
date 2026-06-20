// ============================================================
// ENZOPIZZA HAJMÁSKÉR — Admin CMS
// Firestore collection: reviews
//
// Customer reviews shown in the "Vélemények" section of the
// public site. Mirrors the Facebook reviews shown in the
// reference screenshots, but editable independently.
// ============================================================

import { buildCollection, buildProperty } from "@firecms/core";

export type Review = {
  name: string;
  text: string;
  recommends: boolean;
  order: number;
  visible: boolean;
};

export const reviewsCollection = buildCollection<Review>({
  id: "reviews",
  path: "reviews",
  name: "Vélemények",
  singularName: "Vélemény",
  description: "Vendégvélemények, amelyek a weboldal 'Vélemények' szekciójában jelennek meg.",
  icon: "Star",
  group: "Tartalom",
  defaultSize: "m",
  properties: {
    name: buildProperty({
      name: "Név",
      dataType: "string",
      validation: { required: true }
    }),
    text: buildProperty({
      name: "Vélemény szövege",
      dataType: "string",
      multiline: true,
      validation: { required: true }
    }),
    recommends: buildProperty({
      name: "Ajánlja",
      dataType: "boolean",
      defaultValue: true
    }),
    order: buildProperty({
      name: "Sorrend",
      dataType: "number",
      validation: { required: true }
    }),
    visible: buildProperty({
      name: "Látható a weboldalon",
      dataType: "boolean",
      defaultValue: true
    })
  }
});
