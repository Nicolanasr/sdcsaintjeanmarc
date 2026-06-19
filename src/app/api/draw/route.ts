import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Create a bypass RLS admin client
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication & Role
    const supabase = await createServerSideClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin role required" },
        { status: 403 }
      );
    }

    // 2. Fetch all tickets and teams
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select(`
        id,
        buyer_name,
        buyer_phone,
        team_id,
        scout_id
      `);

    if (ticketsError || !tickets) {
      throw new Error("Could not fetch tickets");
    }

    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("*");

    if (teamsError || !teams) {
      throw new Error("Could not fetch teams");
    }

    const teamsMap = new Map(teams.map((t) => [t.id, t]));

    // 3. Compile the weighted raffle pool
    const rafflePool: any[] = [];

    tickets.forEach((ticket) => {
      const team = teamsMap.get(ticket.team_id);
      if (!team) return;

      // Podium finish: 1st (10x), 2nd (5x), 3rd (2x), others (0x)
      let multiplier = 0;
      if (team.podium_finish === 1) multiplier = 10;
      else if (team.podium_finish === 2) multiplier = 5;
      else if (team.podium_finish === 3) multiplier = 2;

      const entriesCount = team.total_goals * multiplier;

      // Duplicate the ticket in the pool entriesCount times
      for (let i = 0; i < entriesCount; i++) {
        rafflePool.push(ticket);
      }
    });

    if (rafflePool.length === 0) {
      return NextResponse.json(
        { error: "Raffle pool is empty. Make sure teams have goals and podium finishes set." },
        { status: 400 }
      );
    }

    // 4. Securely select 3 unique winners
    const winners: any[] = [];
    const chosenTicketIds = new Set<string>();

    // Copy raffle pool to shuffle/pick from
    let pool = [...rafflePool];

    // We want 3 unique winners. If total unique tickets in the pool is less than 3, adjust.
    const uniqueTicketsCount = new Set(pool.map((t) => t.id)).size;
    const targetWinnersCount = Math.min(3, uniqueTicketsCount);

    while (winners.length < targetWinnersCount && pool.length > 0) {
      // Cryptographically secure random index selection
      const randomIndex = crypto.randomInt(0, pool.length);
      const candidate = pool[randomIndex];

      if (!chosenTicketIds.has(candidate.id)) {
        winners.push(candidate);
        chosenTicketIds.add(candidate.id);
      }

      // Remove all entries of this ticket to ensure uniqueness
      pool = pool.filter((t) => t.id !== candidate.id);
    }

    return NextResponse.json({
      success: true,
      poolSize: rafflePool.length,
      winners,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
