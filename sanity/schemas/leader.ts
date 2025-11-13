import { defineField, defineType } from "sanity";

export default defineType({
  name: "leader",
  title: "Leader",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", title: "Name", validation: (rule) => rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "name", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "role", type: "string", title: "Role", validation: (rule) => rule.required() }),
    defineField({ name: "section", type: "string", title: "Section / Responsibility" }),
    defineField({ name: "bio", type: "text", title: "Bio" }),
    defineField({ name: "photo", type: "image", title: "Photo", options: { hotspot: true } }),
    defineField({ name: "contactEmail", type: "string", title: "Contact Email" }),
    defineField({
      name: "assistantFor",
      title: "Assistant For",
      type: "array",
      of: [{ type: "reference", to: [{ type: "leader" }] }],
      description: "Link to leaders this person assists (optional).",
    }),
  ],
});
