import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { leadershipEn } from "../../lib/content/shared/leadership/en";
import { sectionsPageEn } from "../../lib/content/sections/en";

const sectionLeadershipMap: Record<string, { chiefId: string; assistantIds: string[] }> = {
  louveteaux: { chiefId: "louveteaux-lead", assistantIds: ["louveteaux-assistant"] },
  jeanettes: { chiefId: "flowers-lead", assistantIds: ["flowers-assistant"] },
  scouts: { chiefId: "guides-lead", assistantIds: ["guides-assistant"] },
  guides: { chiefId: "guides-lead", assistantIds: ["guides-assistant"] },
  routiers: { chiefId: "rovers-lead", assistantIds: ["rovers-assistant"] },
  caravelles: { chiefId: "pioneers-lead", assistantIds: ["pioneers-assistant-1", "pioneers-assistant-2"] },
};

const leadershipDocs = leadershipEn.items.map((leader) => ({
  _id: leader.id,
  _type: "leader",
  name: leader.name,
  role: leader.role,
  section: leader.role,
  bio: leader.bio,
  photoUrl: leader.photo,
  slug: { _type: "slug", current: leader.id },
}));

const sectionsDocs = sectionsPageEn.sections.map((section) => {
  const refs = sectionLeadershipMap[section.id];
  if (!refs) {
    throw new Error(`Missing leadership map for ${section.id}`);
  }
  return {
    _id: section.id,
    _type: "section",
    title: section.name,
    slug: { _type: "slug", current: section.id },
    ageRange: section.ageRange,
    motto: section.motto,
    meeting: section.meeting,
    description: section.description,
    focusAreas: section.focus,
    heroImageUrl: section.image,
    patrols: section.leadership.patrols,
    chief: { _ref: refs.chiefId, _type: "reference" },
    assistants: refs.assistantIds.map((assistantId) => ({ _ref: assistantId, _type: "reference" })),
  };
});

const outDir = resolve(dirname(new URL(import.meta.url).pathname), "..", "data");
writeFileSync(resolve(outDir, "leadership.json"), JSON.stringify(leadershipDocs, null, 2));
writeFileSync(resolve(outDir, "sections.json"), JSON.stringify(sectionsDocs, null, 2));
console.log("Exported Sanity JSON to", outDir);
