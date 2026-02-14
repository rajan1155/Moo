'use client';

import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Music, Trash2, Play, Heart } from 'lucide-react';

interface Memory {
  id: string;
  url: string;
  createdAt: number;
}

interface VoiceNote {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

export default function AdminPage() {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [puzzleConfig, setPuzzleConfig] = useState<{ url: string, updatedAt: number } | null>(null);
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);

  useEffect(() => {
    // Fetch all data on mount
    const fetchData = async () => {
      try {
        const [puzzleRes, memRes, voiceRes] = await Promise.all([
          fetch('/api/puzzle-config', { cache: 'no-store' }),
          fetch('/api/memories'),
          fetch('/api/voice-notes')
        ]);

        if (puzzleRes.ok) setPuzzleConfig(await puzzleRes.json());
        if (memRes.ok) setMemories(await memRes.json());
        if (voiceRes.ok) setVoiceNotes(await voiceRes.json());
      } catch (e) {
        console.error('Failed to fetch initial data', e);
      }
    };
    fetchData();
  }, []);

  async function handleDelete(type: 'memory' | 'voice', id: string) {
    if (!confirm('Are you sure you want to delete this? This cannot be undone.')) return;
    
    const endpoint = type === 'memory' ? `/api/memories/${id}` : `/api/voice-notes/${id}`;
    
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.ok) {
        setMessage({ text: 'Deleted successfully! 🗑️', type: 'success' });
        if (type === 'memory') {
          setMemories(prev => prev.filter(m => m.id !== id));
        } else {
          setVoiceNotes(prev => prev.filter(v => v.id !== id));
        }
      } else {
        setMessage({ text: data.error || 'Delete failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error', type: 'error' });
    }
  }

  async function handlePuzzleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/upload/puzzle', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.ok) {
        setMessage({ text: 'Puzzle image updated! 🧩', type: 'success' });
        // Update local state immediately
        setPuzzleConfig({
          url: data.url,
          updatedAt: data.updatedAt
        });
      } else {
        setMessage({ text: data.error || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  async function handleOtherUpload(endpoint: string, formData: FormData, successText: string, type: 'memory' | 'voice') {
    setUploading(true);
    setMessage(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.ok) {
        setMessage({ text: successText, type: 'success' });
        // Optimistically add new item or re-fetch
        if (data.id) {
            const newItem = { 
                id: data.id, 
                url: data.url, 
                createdAt: Date.now(),
                title: type === 'voice' ? (formData.get('file') as File).name : undefined
            };
            if (type === 'memory') {
                setMemories(prev => [newItem as Memory, ...prev]);
            } else {
                setVoiceNotes(prev => [newItem as VoiceNote, ...prev]);
            }
        } else {
            // Fallback refetch
             if (type === 'memory') {
                 fetch('/api/memories').then(r => r.json()).then(setMemories);
             } else {
                 fetch('/api/voice-notes').then(r => r.json()).then(setVoiceNotes);
             }
        }

      } else {
        setMessage({ text: data.error || 'Upload failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
            <h1 className="text-4xl font-bold text-[var(--text)] mb-2 font-serif">
            pudu control room 💗
            </h1>
            <p className="text-[var(--text-soft)] font-medium italic">Manage your valentine's content here</p>
        </header>

        {message && (
          <div className={`px-6 py-3 rounded-full text-center text-sm font-medium animate-pulse max-w-lg mx-auto shadow-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Puzzle Section */}
          <section className="glass-card p-8 rounded-[32px] hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2 font-serif">
              <ImageIcon size={20} className="text-[var(--accent)]" />
              Puzzle Gate Image
            </h2>
            
            {puzzleConfig && (
              <div className="mb-4 space-y-2">
                <div className="relative group overflow-hidden rounded-2xl border border-pink-100 h-48 bg-pink-50">
                  <img 
                    src={`${puzzleConfig.url}?v=${puzzleConfig.updatedAt}`} 
                    alt="Current puzzle" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            )}

            <form onSubmit={handlePuzzleUpload} className="flex gap-3 items-center">
              <input 
                type="file" 
                name="file" 
                accept="image/*" 
                required
                className="block w-full text-xs text-gray-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-bold
                  file:bg-[var(--bg2)] file:text-[var(--accent)]
                  hover:file:bg-[var(--accent-light)] file:transition-colors cursor-pointer"
              />
              <button disabled={uploading} type="submit" className="bg-[var(--accent)] text-white p-2.5 rounded-full hover:bg-[var(--accent-hover)] shadow-md hover:scale-105 transition disabled:opacity-50">
                <Upload size={18} />
              </button>
            </form>
          </section>

          {/* Memories Upload */}
          <section className="glass-card p-8 rounded-[32px] hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2 font-serif">
              <ImageIcon size={20} className="text-[var(--accent)]" />
              Add Memory
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleOtherUpload('/api/memories', formData, 'Memory added! 📸', 'memory');
            }} className="flex gap-3 items-center">
              <input 
                type="file" 
                name="file" 
                accept="image/*" 
                required
                className="block w-full text-xs text-gray-500
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-full file:border-0
                  file:text-xs file:font-bold
                  file:bg-[var(--bg2)] file:text-[var(--accent)]
                  hover:file:bg-[var(--accent-light)] file:transition-colors cursor-pointer"
              />
              <button disabled={uploading} type="submit" className="bg-[var(--accent)] text-white p-2.5 rounded-full hover:bg-[var(--accent-hover)] shadow-md hover:scale-105 transition disabled:opacity-50">
                <Upload size={18} />
              </button>
            </form>
          </section>
        </div>

        {/* Memories Management */}
        <section className="glass-card p-8 rounded-[32px]">
            <h2 className="text-xl font-bold text-[var(--text)] mb-6 flex items-center gap-2 font-serif">
                <ImageIcon size={24} className="text-[var(--accent)]" />
                Manage Memories ({memories.length})
            </h2>
            
            {memories.length === 0 ? (
                <p className="text-[var(--text-soft)] italic text-center py-8">No memories yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {memories.map(mem => (
                        <div key={mem.id} className="group relative aspect-square bg-pink-50 rounded-2xl overflow-hidden shadow-sm border border-pink-100 hover:shadow-md transition-all">
                            <img src={mem.url} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            <button
                                onClick={() => handleDelete('memory', mem.id)}
                                className="absolute top-2 right-2 bg-white/90 text-[#E53935] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 hover:bg-white shadow-sm border border-red-100"
                                title="Delete Memory"
                            >
                                <Trash2 size={14} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-[var(--text)] text-[10px] p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                {new Date(mem.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {/* Voice Notes Management */}
        <section className="glass-card p-8 rounded-[32px]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-[var(--text)] flex items-center gap-2 font-serif">
                    <Music size={24} className="text-[var(--accent)]" />
                    Manage Voice Notes ({voiceNotes.length})
                </h2>
                
                {/* Inline Upload for Voice */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleOtherUpload('/api/voice-notes', formData, 'Voice note added! 🎤', 'voice');
                    e.currentTarget.reset();
                }} className="flex gap-2 w-full md:w-auto">
                    <input type="file" name="file" accept="audio/*" required className="text-xs w-full md:w-48 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[var(--bg2)] file:text-[var(--accent)] hover:file:bg-[var(--accent-light)] cursor-pointer" />
                    <button disabled={uploading} type="submit" className="bg-[var(--accent)] text-white p-2 rounded-full hover:bg-[var(--accent-hover)] transition disabled:opacity-50 shadow-sm">
                        <Upload size={16} />
                    </button>
                </form>
            </div>

            {voiceNotes.length === 0 ? (
                <p className="text-[var(--text-soft)] italic text-center py-8">No voice notes yet.</p>
            ) : (
                <div className="space-y-3">
                    {voiceNotes.map(voice => (
                        <div key={voice.id} className="flex items-center justify-between bg-[var(--bg1)] p-4 rounded-2xl border border-[var(--card-border)] hover:bg-[var(--bg2)] transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-[var(--bg2)] p-2 rounded-full text-[var(--accent)]">
                                    <Play size={16} fill="currentColor" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-[var(--text)] text-sm truncate font-serif">{voice.title || voice.id}</p>
                                    <p className="text-xs text-[var(--text-soft)]">{new Date(voice.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                <audio src={voice.url} controls className="h-8 w-32 md:w-48 hidden sm:block opacity-70 hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={() => handleDelete('voice', voice.id)}
                                    className="text-[#E53935] hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Voice Note"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}
