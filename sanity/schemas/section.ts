import { defineField, defineType } from "sanity";

export default defineType({
  name: "section",
  title: "Section",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "ageRange", type: "string", title: "Age Range" }),
    defineField({ name: "motto", type: "string", title: "Motto" }),
    defineField({ name: "meeting", type: "string", title: "Meeting Details" }),
    defineField({ name: "heroImage", type: "image", title: "Hero Image", options: { hotspot: true } }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "focusAreas",
      title: "Focus Areas",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "chief",
      title: "Chief",
      type: "reference",
      to: [{ type: "leader" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "assistants",
      title: "Assistants",
      type: "array",
      of: [{ type: "reference", to: [{ type: "leader" }] }],
    }),
    defineField({
      name: "patrols",
      title: "Patrols",
      type: "array",
      of: [
        defineField({
          name: "patrol",
          type: "object",
          fields: [
            defineField({ name: "name", type: "string", title: "Name", validation: (rule) => rule.required() }),
            defineField({ name: "leader", type: "string", title: "Patrol Leader" }),
            defineField({ name: "assistant", type: "string", title: "Assistant" }),
            defineField({ name: "members", type: "array", title: "Members", of: [{ type: "string" }] }),
          ],
        }),
      ],
    }),
  ],
});
