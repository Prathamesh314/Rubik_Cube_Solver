import { GameServer } from "./websocket-server";

function run(){
    GameServer.getInstance().start()
}
  
 run();