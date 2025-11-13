import type { LeadershipContent } from "@/lib/translations";
import { pickLocalized } from "@/lib/content/shared/localized";
import { leadershipDefinition } from "./data";

function buildLeadershipContent(): LeadershipContent {
	return {
		title: pickLocalized(leadershipDefinition.title, "ar"),
		items: leadershipDefinition.items.map((item) => ({
			id: item.id,
			name: pickLocalized(item.name, "ar"),
			role: pickLocalized(item.role, "ar"),
			bio: pickLocalized(item.bio, "ar"),
			photo: item.photo,
		})),
		orgChart: {
			rows: leadershipDefinition.orgChart.rows.map((row) => ({
				label: pickLocalized(row.label, "ar"),
				highlight: row.highlight,
				compact: row.compact,
				nodes: row.nodes,
			})),
		},
	};
}

export const leadershipAr = buildLeadershipContent();
