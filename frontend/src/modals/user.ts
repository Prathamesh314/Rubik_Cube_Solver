import mongoose, { Schema, Document, Model } from "mongoose";
import { CubeCategories } from "./player";

// Interface matches Player class in player.ts
export interface IUser extends Document {
  username: string;
  player_state: string; // Use PlayerState enum value as string
  rating: number;
  total_wins: number;
  win_percentage: number;
  top_speed_to_solve_cube: {
    [key in CubeCategories]?: {
      cube_category: CubeCategories;
      top_speed: number;
    }
  };
  email: string;
  password: string;
  createdAt: Date;
}

const SpeedCollectionSchema = new Schema(
  {
    cube_category: { type: String, enum: Object.values(CubeCategories), required: true },
    top_speed: { type: Number, default: 0 }
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username:   { type: String, required: true, unique: true },
    player_state: { type: String, required: true, default: "waiting", enum: ["playing", "not playing", "waiting"] },
    rating:     { type: Number, default: 0 },
    total_wins: { type: Number, default: 0 },
    win_percentage: { type: Number, default: 0 },
    top_speed_to_solve_cube: {
      type: Map,
      of: SpeedCollectionSchema,
      default: {},
    },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    createdAt:  { type: Date, default: Date.now }
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
