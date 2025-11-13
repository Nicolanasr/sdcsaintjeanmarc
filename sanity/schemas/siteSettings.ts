import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Site Title" }),
    defineField({ name: "tagline", type: "string", title: "Tagline" }),
    defineField({ name: "locale", type: "string", title: "Locale", initialValue: "en" }),
    defineField({
      name: "homeHero",
      title: "Home Hero",
      type: "object",
      fields: [
        defineField({ name: "badge", type: "string", title: "Badge" }),
        defineField({ name: "title", type: "string", title: "Title" }),
        defineField({ name: "description", type: "text", title: "Description" }),
        defineField({ name: "image", type: "image", title: "Image", options: { hotspot: true } }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "locale" },
  },
});
