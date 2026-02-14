import { Timestamp } from "firebase/firestore";

export interface PuzzleConfig {
  puzzleImageUrl: string;
  updatedAt: Timestamp;
}

export interface Letter {
  id?: string;
  title: string;
  body: string;
  updatedAt: Timestamp;
}

export interface Memory {
  id?: string;
  imageUrl: string;
  caption: string;
  createdAt: Timestamp;
}

export interface VoiceNote {
  id?: string;
  audioUrl: string;
  title: string;
  createdAt: Timestamp;
  duration: number;
}
