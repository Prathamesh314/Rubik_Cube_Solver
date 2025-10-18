import GamePage from "@/components/GamePage";
import dbConnect from "@/utils/db";

(async () => {
  await dbConnect();
})();
export default function Home() {
  return (
    <div>
        <GamePage />
    </div>
  );
}

