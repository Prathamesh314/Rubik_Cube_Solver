"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Search, MessageCircle, Swords, Users } from "lucide-react";
// 1. Import the socket context and types
import { useSocket } from "@/context/SocketContext"; 
import { GameEventTypes } from "@/types/game-events";
import { CubeCategories, PlayerState, Player } from "@/modals/player";
import { useRouter } from "next/navigation";

type Friend = {
  id: string;
  name: string;
  username: string;
  rating: number;
  bestTime: number;
  status: "online" | "offline" | "busy";
};

interface PlayerType {
  player_id: string;
  username: string;
  player_state: PlayerState;
  rating: number;
  total_wins: number;
  win_percentage: number;
  scrambledCube: number[][][];
}

export type ApiUserResponse = {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    password: string;
    rating: number;
    total_games_played: number;
    fastest_time_to_solve_cube: number;
    created_at: string;
    updated_at: string;
    total_wins: number;
  };
};

const statusColors: Record<Friend["status"], string> = {
  online: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-slate-500",
};

const FriendsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);
  const [updatedFriends, setUpdatedFriends] = useState<Friend[]>([]);
  const router = useRouter()

  // ✅ Call the hook at the top level
  const { isReady, send, onMessage } = useSocket();

  // local refs/states (you can drop wsRef if you only use provider's socket)
  const wsRef = useRef<WebSocket | null>(null);

  const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

  // Fetch initial friends list
  useEffect(() => {
    const getFriends = async () => {
      if (!userId) return;
      try {
        const res = await fetch(
          `/api/get_friends?userId=${encodeURIComponent(userId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.friends)) {
            // Note: The API should ideally return current status. 
            // If API returns null for status, default to offline until socket updates it.
            setFriends(data.friends.map((f: any) => ({ ...f, status: f.status || 'offline' })));
          } else {
            setFriends([]);
          }
        } else {
          setFriends([]);
        }
      } catch (err) {
        console.error("Error fetching friends", err);
        setFriends([]);
      }
    };

    getFriends();
  }, [userId]);

  // Receive messages here....
  useEffect(() => {
    const off = onMessage((msg) => {
      console.log("[FriendsPage] incoming:", msg);

      if (msg.type === GameEventTypes.PlayerStatusUpdate) {
        // INSERT_YOUR_CODE
        // If PlayerStatusUpdate received, update "friends" list to reflect who's online
        setOnlinePlayers(msg.value.player)
      }
    })
    
    return off
  }, [onMessage]);

  useEffect(() => {
    setUpdatedFriends(
      friends.map(friend => ({
        ...friend,
        status: onlinePlayers.includes(friend.id) ? 'online' : 'offline'
      }))
    );
  }, [friends, onlinePlayers])

  // Sending messages to websocet server.
  useEffect(() => {
    if (!isReady) return;
    // prove send/receive path via a ping
    const playerId = sessionStorage.getItem("userId")
    const playerOnlineMessage = {
      type: GameEventTypes.PlayerOnline,
      value: {
        playerId: playerId
      }
    }
    send(playerOnlineMessage)

  }, [isReady, send]);

  const handleSearchBoxClicked = async () => {
    try {
      const res = await fetch("/api/get_user");
      if (!res.ok) {
        throw new Error("Error in fetching users in searchbox");
      }
      const data = await res.json();
      setAllPlayers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const friendsWithStatus = useMemo(() => {
    return friends.map(friend => ({
      ...friend,
      status: onlinePlayers.includes(friend.id) ? 'online' : 'offline'
    }));
  }, [friends, onlinePlayers]); // Re-runs whenever friends or online list changes

  // 3. Filter the calculated list
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friendsWithStatus;

    return friendsWithStatus.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [search, friendsWithStatus]);

  const handleChat = (friend: Friend) => {
    console.log("Open chat with:", friend.id);
  };

  const handleChallenge = (friend: Friend) => {
    console.log("Send challenge to:", friend.id);
    const userId = sessionStorage.getItem("userId")
    if (userId === null) {
      throw Error(`User id is null cannot send challenge`)
    }

    const makeApiRequestToStartFriendMatch = async () => {
      console.log("Making an api request to match frineds...")
      
      const userId = sessionStorage.getItem("userId")
      const player_res = await fetch(`/api/get_user?id=${userId}`)
      if (!player_res.ok) {
        throw new Error(`Cannot find user in db for user id: ${userId}`)
      }

      const player_data: ApiUserResponse = await player_res.json()

      const new_player = new Player(
        player_data.user.id,
        player_data.user.username,
        PlayerState.NotPlaying,
        player_data.user.rating,
        player_data.user.total_wins,
        (player_data.user.total_wins === 0 ? 0 : (player_data.user.total_wins / player_data.user.total_games_played) * 100),
        {}, // top_speed_to_solve_cube: no data, provide empty object
        [[[]]] // scrambledCube, default
      );

      const res = await fetch("/api/match_friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          player: new_player,
          variant: CubeCategories.ThreeCube,
          isOpponentReady: false,
          opponentPlayerId: null
        })
      })

      if (!res.ok) {
        throw Error("Error in matching friends api")
      }

      const data: {
        roomId: string;
        isGameStarted: boolean;
      } = await res.json()
      // response looks like this: {
      //   roomId: '3f86ccc0-7bf6-47d0-a775-9170c8b11349',
      //   isGameStarted: false
      // }
      localStorage.setItem("player", JSON.stringify(new_player))
      router.push(`/room/${data.roomId}`);
    }

    makeApiRequestToStartFriendMatch();
    const friendChallengeMsg = {
      type: GameEventTypes.FriendChallenge,
      value: {
        playerId: userId,
        opponentPlayerId: friend.id
      }
    }
    console.log("Sending challenge to friend: ", friend.id)
    send(friendChallengeMsg)
  };

  // if (updatedFriends.length === 0) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <span className="text-slate-400 text-lg">Loading...</span>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6" />
              Friends
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search your friends, start a chat, or send a challenge.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total friends
            </p>
            <p className="text-lg font-semibold">
              {friends.length.toString().padStart(2, "0")}
            </p>
          </div>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onClick={handleSearchBoxClicked}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none
                       focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-500"
          />
        </div>

        {/* Friends list */}
        <section className="space-y-3">
          {filteredFriends.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl py-10 text-center">
              <p className="text-sm text-slate-400">
                No friends found. Try a different name or username.
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3
                           hover:border-sky-500/70 hover:bg-slate-900 transition-colors"
              >
                {/* Left: avatar + info */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
                      {friend.name
                        ? friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "??"}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-slate-950 ${
                        statusColors[friend.status as keyof typeof statusColors] || statusColors.offline
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{friend.name}</p>
                      <span className="text-xs text-slate-500">
                        {friend.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                      {friend.rating && (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Rating: {friend.rating}
                        </span>
                      )}
                      {friend.bestTime && (
                        <span>Best solve: {friend.bestTime}</span>
                      )}
                      <span className="capitalize">
                        Status: {friend.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleChat({
                      ...friend,
                      status: friend.status as "online" | "offline" | "busy"
                    })}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium
                               hover:border-sky-500 hover:bg-slate-900/80 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                  {/* Only show Challenge if online */}
                  <button
                    onClick={() => handleChallenge({
                      ...friend,
                      status: friend.status as "online" | "offline" | "busy"
                    })}
                    disabled={friend.status !== 'online'}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors ${
                        friend.status === 'online' 
                        ? 'bg-sky-500 hover:bg-sky-400' 
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Swords className="w-4 h-4" />
                    Challenge
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default FriendsPage;