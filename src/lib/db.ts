import { db, storage } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { PuzzleConfig, Letter, Memory, VoiceNote } from "./types";

// --- Puzzle ---
export const getPuzzleConfig = async (): Promise<PuzzleConfig | null> => {
  const snap = await getDoc(doc(db, "siteConfig", "main"));
  if (snap.exists()) return snap.data() as PuzzleConfig;
  return null;
};

export const updatePuzzleImage = async (file: File) => {
  const storageRef = ref(storage, `puzzle/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  await setDoc(doc(db, "siteConfig", "main"), {
    puzzleImageUrl: url,
    updatedAt: Timestamp.now()
  }, { merge: true });
  
  return url;
};

// --- Letters ---
export const getLetter = async (mood: string): Promise<Letter | null> => {
  if (!db) {
    throw new Error("Firebase not configured");
  }
  const snap = await getDoc(doc(db, "letters", mood));
  if (snap.exists()) return { id: snap.id, ...snap.data() } as Letter;
  return null;
};

export const updateLetter = async (mood: string, title: string, body: string) => {
  await setDoc(doc(db, "letters", mood), {
    title,
    body,
    updatedAt: Timestamp.now()
  }, { merge: true });
};

// --- Memories ---
export const getMemories = async (): Promise<Memory[]> => {
  const q = query(collection(db, "memories"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Memory));
};

export const addMemory = async (file: File, caption: string) => {
  const storageRef = ref(storage, `memories/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  await addDoc(collection(db, "memories"), {
    imageUrl: url,
    caption,
    createdAt: Timestamp.now()
  });
};

export const deleteMemory = async (id: string, imageUrl: string) => {
  await deleteDoc(doc(db, "memories", id));
  // Try to delete from storage too
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (e) {
    console.error("Error deleting image from storage", e);
  }
};

// --- Voice Notes ---
export const getVoiceNotes = async (): Promise<VoiceNote[]> => {
  const q = query(collection(db, "voiceNotes"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VoiceNote));
};

export const addVoiceNote = async (file: File, title: string, duration: number) => {
  const storageRef = ref(storage, `voiceNotes/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  await addDoc(collection(db, "voiceNotes"), {
    audioUrl: url,
    title,
    duration,
    createdAt: Timestamp.now()
  });
};

export const deleteVoiceNote = async (id: string, audioUrl: string) => {
  await deleteDoc(doc(db, "voiceNotes", id));
  try {
    const storageRef = ref(storage, audioUrl);
    await deleteObject(storageRef);
  } catch (e) {
    console.error("Error deleting audio from storage", e);
  }
};
