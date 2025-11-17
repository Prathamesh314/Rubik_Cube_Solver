import { CubeCategories, Player, PlayerState } from "@/modals/player";
import { Redis } from "@/utils/redis";
import {generateScrambledCube} from '@/utils/redis'
import { randomUUID } from "crypto";
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

    const cube = generateScrambledCube(20).state

    const p1 = new Player(
        randomUUID(),
        "player 1",
        PlayerState.Playing,
        1200,
        0,
        0,
        {},
    );

    const p2 = new Player(
        randomUUID(),
        "player 2",
        PlayerState.Playing,
        1300,
        0,
        0,
        {},
    );
    // const response1 = await redis.tryMatchOrEnqueue(p1, CubeCategories.ThreeCube);
    // const response2 = await redis.tryMatchOrEnqueue(p2, CubeCategories.ThreeCube);
    // const response_all = await redis.get_all_players()
    // console.log("All players: ", response_all)
    // const response = await redis.get_all_waiting_players()
    // console.log("Response: ", response);
    // const rooms = await redis.get_room("0abb6724-265c-464c-be19-11bb9f10f7cc")
    const allrooms = await redis.get_all_rooms()
    console.log("rooms: ", allrooms)

   
    // await redis.delete_all_players();
    // await redis.delete_all_rooms();
    
    // await redis.clear_player_room();

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