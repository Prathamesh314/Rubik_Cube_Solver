import GamePage from "@/components/GamePage";
import dbConnect from "@/utils/db";

dbConnect();
export default function Home() {
  return (
    <div>
        <GamePage />
    </div>
  );
}

