import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Bypass RLS on the server using service role key
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  // Simple check to secure cron route if CRON_SECRET is set
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey || apiKey === "your-football-api-key") {
    return NextResponse.json(
      { message: "Football API Key not configured. Skipping automated sync." },
      { status: 200 }
    );
  }

  try {
    // Fetch World Cup matches from Football-Data.org (Competition: WC)
    // For World Cup 2026, the competition code is WC.
    const res = await fetch("http://api.football-data.org/v4/competitions/WC/matches", {
      headers: {
        "X-Auth-Token": apiKey,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Football API returned status ${res.status}`);
    }

    const data = await res.json();
    const matches = data.matches || [];

    // Accumulate goals for each team code
    // Football-Data.org team codes (e.g., ARG, BRA) or names
    const goalsMap: Record<string, number> = {};

    matches.forEach((match: any) => {
      // Only process finished or live matches
      if (match.status === "FINISHED" || match.status === "IN_PLAY") {
        const homeCode = match.homeTeam.tla || match.homeTeam.id?.toString();
        const awayCode = match.awayTeam.tla || match.awayTeam.id?.toString();

        const homeGoals = match.score.fullTime.home ?? 0;
        const awayGoals = match.score.fullTime.away ?? 0;

        if (homeCode) {
          goalsMap[homeCode] = (goalsMap[homeCode] || 0) + homeGoals;
        }
        if (awayCode) {
          goalsMap[awayCode] = (goalsMap[awayCode] || 0) + awayGoals;
        }
      }
    });

    // Update teams in Supabase database
    const updates = Object.entries(goalsMap).map(async ([teamId, goals]) => {
      // Check if team exists in our teams table
      const { data: team } = await supabaseAdmin
        .from("teams")
        .select("id")
        .eq("id", teamId)
        .single();

      if (team) {
        return supabaseAdmin
          .from("teams")
          .update({ total_goals: goals })
          .eq("id", teamId);
      }
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized goals for ${Object.keys(goalsMap).length} teams.`,
      data: goalsMap,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
