"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Search, MessageCircle, Swords, Users, X, Check, UserPlus } from "lucide-react"; // Added UserPlus icon
// 1. Import the socket context and types
import { useSocket } from "@/context/SocketContext"; 
import { GameEventTypes } from "@/types/game-events";
import { CubeCategories, PlayerState, Player } from "@/modals/player";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Friend = {
  id: string;
  name: string;
  username: string;
  rating: number;
  bestTime: number;
  status: "online" | "offline" | "busy";
};

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
  const router = useRouter()

  // ✅ Call the hook at the top level
  const { isReady, send, onMessage } = useSocket();

  const userId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;

  const handleChallengeRejected = (opponentPlayerId?: string, roomId?: string) => {
    const friend_challenge_rejected_msg = {
      type: GameEventTypes.FriendChallengeRejected,
      value: {
        playerId: sessionStorage.getItem("userId"),
        opponentPlayerId: opponentPlayerId,
        roomId: roomId
      }
    }

    console.log("Rejection message: ", friend_challenge_rejected_msg)

    send(friend_challenge_rejected_msg)
    console.log("Sending friend challenge rejected message.")
  }

  const handleChallengeAccepted = (opponetPlayerId?: string) => {
    const helper = async () => {
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
          isOpponentReady: true,
          opponentPlayerId: opponetPlayerId
        })
      })

      if (!res.ok) {
        throw Error("Error in matching friends api")
      }

      const data: {
        roomId: string;
        isGameStarted: boolean;
      } = await res.json()
      localStorage.setItem("player", JSON.stringify(new_player))
      router.push(`/room/${data.roomId}`);
    }

    helper()
  }

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

  const handleFriendRequestReject = async (message: any) => {
    const { fromUserId, fromUsername } = message.value;
    const selfUserId = sessionStorage.getItem("userId");
    const addresseeUserId = fromUserId;

    const res = await fetch("/api/delete_friend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        selfUserId,
        addresseeUserId
      })
    })
  }

  const handleFriendRequestAccept = async (message:  any) => {
    //   value: {
    //     fromUserId: payload.fromUserId,
    //     fromUsername: payload.fromUsername,
    //     timestamp: new Date().toISOString()
    // }
    // if we decline the friend request we should remove friend from friends table.
    try {
      // message.value should contain the relevant IDs, e.g., fromUserId and toUserId
      const { fromUserId, fromUsername } = message.value;
      const selfUserId = sessionStorage.getItem("userId");
      const addresseeUserId = fromUserId;
      const status = "accepted";
      const res = await fetch("/api/update_friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selfUserId,
          addresseeUserId,
          status
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success("Friend request accepted!");
        // Optionally, update the friends list UI or state here if needed
      } else {
        toast.error(result.message || "Failed to accept friend request.");
      }
    } catch (error) {
      toast.error("An error occurred while updating friend status.");
    }
  }

  // Receive messages here....
  useEffect(() => {
    const off = onMessage((msg) => {
      console.log("[FriendsPage] incoming:", msg);

      if (msg.type === GameEventTypes.PlayerStatusUpdate) {
        // INSERT_YOUR_CODE
        // If PlayerStatusUpdate received, update "friends" list to reflect who's online
        setOnlinePlayers(msg.value.player)
      } else if (msg.type === GameEventTypes.FriendChallenge) {
        const opponentId = msg.value.opponentPlayerId;
        const roomId = msg.value.roomId
        console.log("Friend challenged you whose playerId: ", msg.value)
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-in fade-in zoom-in-95' : 'animate-out fade-out zoom-out-95'
            } w-full max-w-sm pointer-events-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden`}
          >
            {/* Card Content */}
            <div className="p-4 flex items-start gap-4">
              {/* Icon Circle */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Swords className="h-5 w-5 text-sky-500" />
                </div>
              </div>
              
              {/* Text Info */}
              <div className="flex-1 pt-0.5">
                <h3 className="text-sm font-bold text-white">Duel Request</h3>
                <p className="mt-1 text-sm text-slate-400">
                  <span className="font-semibold text-sky-400">{opponentId}</span> wants to challenge you!
                </p>
              </div>
            </div>
        
            {/* Button Footer - Split Design */}
            <div className="flex border-t border-slate-800 bg-slate-950/30">
              <button
                onClick={() => {
                  console.log("Rejection sent.");
                  toast.dismiss(t.id);
                  handleChallengeRejected(opponentId, roomId)
                }}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors border-r border-slate-800"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              
              <button
                onClick={() => {
                  console.log("Challenge Accepted!");
                  // Handle your accept logic here
                  handleChallengeAccepted(msg.value?.opponentPlayerId)
                  toast.dismiss(t.id);
                }}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
            </div>
          </div>
        ), {
          id: "challenge-toast", // Unique ID prevents duplicate toasts
          duration: Infinity,    // Keeps it open forever
          position: "top-center" // Optional: usually better for alerts
        });
      }
      else if (msg.type === GameEventTypes.FriendRequestReceived) {
        console.log("Message: ", msg)
        const { fromUserId, fromUsername } = msg.value || {};

        toast.custom((t) => (
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg max-w-xs w-full">
            <div className="p-4 flex items-start gap-4">
              {/* Icon Circle */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-sky-500" />
                </div>
              </div>
              {/* Text Info */}
              <div className="flex-1 pt-0.5">
                <h3 className="text-sm font-bold text-white">Friend Request</h3>
                <p className="mt-1 text-sm text-slate-400">
                  <span className="font-semibold text-sky-400">
                    {fromUsername || fromUserId}
                  </span>{" "}
                  sent you a friend request!
                </p>
              </div>
            </div>
            {/* Button Footer - Split Design */}
            <div className="flex border-t border-slate-800 bg-slate-950/30">
              <button
                onClick={() => {
                  // You can add logic here to reject (server-side if desired)
                  toast.dismiss(t.id);
                  toast.success("Friend request declined.");
                  handleFriendRequestReject(msg)
                }}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-colors border-r border-slate-800"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={() => {
                  // Accept logic: could make API call, update UI, etc
                  toast.dismiss(t.id);
                  toast.success("Friend request accepted.");
                  // Optional: add logic to update friend list, notify server, etc.
                  handleFriendRequestAccept(msg);
                }}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
            </div>
          </div>
        ), {
          id: `friend-request-toast-${fromUserId}`,
          duration: Infinity,
          position: "top-center"
        });
      }
    })
    
    return off
  }, [onMessage]);

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
      // The data structure is { success: true, user: [...] }
      setAllPlayers(data.user || []);
      console.log("All players: ", data)
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Set of friend IDs for easy lookup
  const friendIdsSet = useMemo(
    () => new Set(friends.map((f) => f.id)),
    [friends]
  );

  // Convert allPlayers to Friend format with online status
  const playersAsFriends = useMemo(() => {
    return allPlayers
      .filter(player => player.id !== userId) // Exclude current user
      .map(player => ({
        id: player.id,
        name: player.username, // Using username as name since we don't have a separate name field
        username: player.username,
        rating: player.rating || 0,
        bestTime: player.fastest_time_to_solve_cube || 0,
        status: (onlinePlayers.includes(player.id) ? 'online' : 'offline') as "online" | "offline" | "busy"
      }));
  }, [allPlayers, onlinePlayers, userId]);

  // Add online status to existing friends
  const friendsWithStatus = useMemo(() => {
    return friends.map(friend => ({
      ...friend,
      status: (onlinePlayers.includes(friend.id) ? 'online' : 'offline') as "online" | "offline" | "busy"
    }));
  }, [friends, onlinePlayers]);

  // Filter logic: if search is active and allPlayers is loaded, search from all players
  // Otherwise show friends list
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    
    // If no search query, show friends
    if (!q) return friendsWithStatus;

    // If search query exists and allPlayers is loaded, search from all players
    if (allPlayers.length > 0) {
      return playersAsFriends.filter(
        (p) =>
          p.username.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }

    // Fallback: search from friends
    return friendsWithStatus.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [search, friendsWithStatus, playersAsFriends, allPlayers.length]);

  const handleChat = (friend: Friend) => {
    console.log("Open chat with:", friend.id);
  };

  const handleChallenge = (friend: Friend) => {
    console.log("Send challenge to:", friend.id);
    const userId = sessionStorage.getItem("userId")
    if (userId === null) {
      throw Error(`User id is null cannot send challenge`)
    }

    // Instead of sending the WebSocket message immediately (where roomId is a Promise), 
    // wait for the asynchronous API call to complete before sending the message with the correct roomId.

    const makeApiRequestToStartFriendMatch = async () => {
      console.log("Making an api request to match friends...");

      const userId = sessionStorage.getItem("userId");
      const player_res = await fetch(`/api/get_user?id=${userId}`);
      if (!player_res.ok) {
        throw new Error(`Cannot find user in db for user id: ${userId}`);
      }

      const player_data: ApiUserResponse = await player_res.json();

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
      });

      if (!res.ok) {
        throw Error("Error in matching friends api");
      }

      const data: {
        roomId: string;
        isGameStarted: boolean;
      } = await res.json();

      // Save player and navigate to room
      localStorage.setItem("player", JSON.stringify(new_player));
      router.push(`/room/${data.roomId}`);

      return { roomId: data.roomId, new_player };
    };

    // We need to use async/await here to get the roomId before sending the WebSocket message.
    (async () => {
      try {
        const { roomId } = await makeApiRequestToStartFriendMatch();
        const friendChallengeMsg = {
          type: GameEventTypes.FriendChallenge,
          value: {
            playerId: userId,
            opponentPlayerId: friend.id,
            roomId: roomId
          }
        };
        console.log("Sending challenge to friend: ", friend.id, "with roomId:", roomId);
        send(friendChallengeMsg);
      } catch (error) {
        console.error("Failed to initiate friend match:", error);
      }
    })();
  };

  // Handler to send friend request (dummy for UI)
  const handleSendFriendRequest = async (user: Friend) => {
    try {
      const selfUserId = typeof window !== "undefined" ? sessionStorage.getItem("userId") : null;
      const userName = sessionStorage.getItem("username");
      if (!selfUserId) {
        toast.error("You must be logged in to send friend requests.");
        return;
      }
      if (selfUserId === user.id) {
        toast.error("You cannot add yourself as a friend.");
        return;
    }
        const res = await fetch("/api/add_friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selfUserId,
            addresseeUserId: user.id
          })
        });
  
        const result = await res.json();
  
        if (res.ok && result.success) {
          toast.success(`Sent friend request to ${user.username}`);
          const send_friend_request_msg = {
            type: GameEventTypes.SendFriendRequest,
            value: {
                fromUserId: selfUserId,
                fromUsername: userName,
                toUserId: user.id
            }
          }
      
          console.log("Sending friend request message: ", send_friend_request_msg)
          send(send_friend_request_msg)
          
        } else {
          toast.error(result.message || "Failed to send friend request.");
        }
      } catch (error) {
        toast.error("An error occurred while sending friend request.");
      }
  };

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
          {filteredList.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl py-10 text-center">
              <p className="text-sm text-slate-400">
                {search ? "No users found matching your search." : "No friends found. Try searching for users to add."}
              </p>
            </div>
          ) : (
            filteredList.map((friend) => {
              // friend.id may or may not be in the current friends set
              const isFriend = friendIdsSet.has(friend.id);
              return (
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
                              .map((n: string) => n[0])
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
                        <p className="text-sm font-medium flex items-center gap-1">
                          {friend.name}
                          {
                            // Show friend request icon if NOT a friend and it's not my own profile
                            !isFriend && friend.id !== userId && (
                              <button
                                className="p-0.5 rounded hover:bg-sky-900 group"
                                aria-label="Send friend request"
                                onClick={() => handleSendFriendRequest(friend)}
                                title="Send friend request"
                                tabIndex={0}
                              >
                                <UserPlus className="w-4 h-4 text-sky-400 group-hover:text-sky-200 transition" />
                              </button>
                            )
                          }
                        </p>
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
                        {friend.bestTime > 0 && (
                          <span>Best solve: {friend.bestTime}s</span>
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
                      onClick={() => handleChat(friend)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium
                                  hover:border-sky-500 hover:bg-slate-900/80 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                    {/* Only show Challenge if online */}
                    <button
                      onClick={() => handleChallenge(friend)}
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
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

export default FriendsPage;