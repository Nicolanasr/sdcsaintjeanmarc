import type { LeadershipContent } from "@/lib/translations";
import { pickLocalized } from "@/lib/content/shared/localized";
import { leadershipDefinition } from "./data";

function buildLeadershipContent(): LeadershipContent {
	return {
		title: pickLocalized(leadershipDefinition.title, "en"),
		items: leadershipDefinition.items.map((item) => ({
			id: item.id,
			name: pickLocalized(item.name, "en"),
			role: pickLocalized(item.role, "en"),
			bio: pickLocalized(item.bio, "en"),
			photo: item.photo,
		})),
		orgChart: {
			rows: leadershipDefinition.orgChart.rows.map((row) => ({
				label: pickLocalized(row.label, "en"),
				highlight: row.highlight,
				compact: row.compact,
				nodes: row.nodes,
			})),
		},
	};
}

export const leadershipEn = buildLeadershipContent();
