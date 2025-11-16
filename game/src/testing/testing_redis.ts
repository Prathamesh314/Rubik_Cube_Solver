import { CubeCategories, Player, PlayerState } from "@/modals/player";
import { Redis } from "@/utils/redis";
// import { randomUUID } from "crypto";

async function show_keys(redis: Redis){
    if (redis.redis_client) {
        const keys = await redis.redis_client.keys('*');
        console.log("Keys: ", keys)
        if (keys.length == 0){
            console.log("No keys found , returning.....")
            return
        }
        for (const key of keys) {
            const type = await redis.redis_client.type(key);
            let value;
            switch (type) {
                case 'string':
                    value = await redis.redis_client.get(key);
                    break;
                case 'hash':
                    value = await redis.redis_client.hGetAll(key);
                    break;
                case 'list':
                    value = await redis.redis_client.lRange(key, 0, -1);
                    break;
                case 'set':
                    value = await redis.redis_client.sMembers(key);
                    break;
                case 'zset':
                    value = await redis.redis_client.zRangeWithScores(key, 0, -1);
                    break;
                default:
                    value = '<unknown type>';
            }
            console.log(`Key: ${key} (type: ${type}) =>`, value);
        }
    } else {
        console.log("No redis client available");
    }
}

async function main() {
    console.log("Testing...")
    const redis = Redis.getInstance();
    await redis.connect();

    const p1 = new Player(
        "player 1",
        PlayerState.NotPlaying,
        1200,
        0,
        0,
        {}
    );

    const p2 = new Player(
        "player 2",
        PlayerState.NotPlaying,
        1300,
        0,
        0,
        {}
    );

    // async tryMatchOrEnqueue1(
    //     player: Player,
    //     roomId: string,
    //     variant: CubeCategories
    // )

    // const response = await redis.tryMatchOrEnqueue(p1, CubeCategories.ThreeCube);
    // const response = await redis.tryMatchOrEnqueue1(p2, CubeCategories.ThreeCube);
    // console.log("Response: ", response);

    // const has_players = await redis.has_players();
    // if (has_players) {
    //     const players = await redis.get_all_players()
    //     const player1 = players[0]
    //     console.log("All players: ", player1);
    //     // fetch which room the player1 is waiting inside??

        // const roomID = await redis.get_player_room(player1.player_id);
        // console.log("Roomid: ", roomID);
    //     // delete the player from the cache and also room as well
    //     await redis.delete_player(player1.player_id);
    //     await redis.clear_player_room(player1.player_id);

    //     console.log("Playe 1 removed....")
    // }
    // } else {
    //     await redis.insert_player(p1)
    //     const roomID: string = randomUUID()
    //     console.log("Room ID: ", roomID, "Player ID: ", p1.player_id);
    //     await redis.set_player_room(p1.player_id, roomID)
    // }

    // const insert_res = await redis.insert_player(p1)
    // console.log("Inserted res: ", insert_res)
    // const has_players = await redis.has_players();
    // console.log("Has players: ", has_players)
    await redis.delete_all_players();
    await redis.delete_all_rooms();
    
    await redis.clear_player_room();

    // Display all keys and their values in Redis (assuming you have access to redis_client)
    // await show_keys(redis)
    process.exit(0);
}

(async () => {
    await main();
})()

/**
 * 
 * PSUEDO CODE
 * if there are players in players namespace --> find room of that player and join the second player in same room.
 * if the cache is empty --> insert player in the cache and map it to it's room id.
 */