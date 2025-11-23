import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { tables } from '@/db/postgres';
import { sql } from 'kysely';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'day';

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'day':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const postgresDb = await dbConnect();
    const db = postgresDb.connection();

    // Total users
    const totalUsersResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.user)}
      WHERE email != 'admin@gmail.com'
    `.execute(db);
    const totalUsers = totalUsersResult.rows[0]?.count || 0;

    // New users today
    const newUsersTodayResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.user)}
      WHERE created_at >= ${todayStart}
    `.execute(db);
    const newUsersToday = newUsersTodayResult.rows[0]?.count || 0;

    // Total games played
    const totalGamesResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.game_history)}
    `.execute(db);
    const totalGamesPlayed = totalGamesResult.rows[0]?.count || 0;

    // Games played today
    const gamesTodayResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.game_history)}
      WHERE started_at >= ${todayStart}
    `.execute(db);
    const gamesPlayedToday = gamesTodayResult.rows[0]?.count || 0;

    // Games played yesterday (for growth calculation)
    const gamesYesterdayResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.game_history)}
      WHERE started_at >= ${yesterdayStart}
        AND started_at < ${todayStart}
    `.execute(db);
    const gamesYesterday = gamesYesterdayResult.rows[0]?.count || 1;

    // Active users (users who played in the last hour)
    const activeUsersResult = await sql<{count: number}>`
      SELECT COUNT(DISTINCT user_id)::int as count
      FROM ${sql.table(tables.game_history)}
      WHERE started_at >= ${lastHour}
    `.execute(db);
    const activeUsers = activeUsersResult.rows[0]?.count || 0;

    // Average game time (in minutes)
    const avgGameTimeResult = await sql<{avg_time: number}>`
      SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60)::numeric(10,1) as avg_time
      FROM ${sql.table(tables.game_history)}
      WHERE ended_at IS NOT NULL
        AND started_at >= ${startDate}
    `.execute(db);
    const averageGameTime = Number(avgGameTimeResult.rows[0]?.avg_time || 0);

    // Users from last week
    const usersLastWeekResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.user)}
      WHERE created_at >= ${lastWeekStart}
        AND created_at < ${lastWeekEnd}
    `.execute(db);
    const usersLastWeek = usersLastWeekResult.rows[0]?.count || 1;

    // Users from this week
    const usersThisWeekResult = await sql<{count: number}>`
      SELECT COUNT(id)::int as count
      FROM ${sql.table(tables.user)}
      WHERE created_at >= ${lastWeekEnd}
    `.execute(db);
    const usersThisWeek = usersThisWeekResult.rows[0]?.count || 0;

    const userGrowth = Math.round(((usersThisWeek - usersLastWeek) / usersLastWeek) * 100 * 10) / 10;

    // Daily games for the last 7 days
    const dailyGamesResult = await sql`
      SELECT 
        DATE(started_at)::text as date,
        COUNT(id)::int as count
      FROM ${sql.table(tables.game_history)}
      WHERE started_at >= ${sevenDaysAgo}
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `.execute(db);

    const dailyGames = dailyGamesResult.rows.map((row: any) => ({
      date: row.date,
      count: row.count
    }));

    // Calculate growth percentage for today vs yesterday
    const gamesTodayGrowth = gamesYesterday > 0 
      ? Math.round(((gamesPlayedToday - gamesYesterday) / gamesYesterday) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      totalUsers,
      totalGamesPlayed,
      gamesPlayedToday,
      activeUsers,
      averageGameTime,
      newUsersToday,
      userGrowth,
      gamesTodayGrowth,
      dailyGames,
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data', message: String(error) },
      { status: 500 }
    );
  }
}