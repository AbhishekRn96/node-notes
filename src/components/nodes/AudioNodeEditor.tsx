import { useState, useRef } from 'react';
import { AudioNode } from '@/types/notes';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Upload } from 'lucide-react';

interface AudioNodeEditorProps {
  node: AudioNode;
  onChange: (audioData: string, duration?: number) => void;
  viewMode: 'view' | 'edit';
}

export default function AudioNodeEditor({ node, onChange, viewMode }: AudioNodeEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // View mode: simple audio player
  if (viewMode === 'view') {
    if (!node.audioData) {
      return <div className="text-muted-foreground text-sm">No audio</div>;
    }
    return (
      <div className="p-3 bg-muted rounded-lg">
        <audio src={node.audioData} controls className="w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {!node.audioData ? (
        <div className="flex gap-2">
          {!isRecording ? (
            <>
              <Button variant="outline" onClick={startRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Record Audio
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
            </>
          ) : (
            <Button variant="destructive" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayback}
            className="h-10 w-10 p-0"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <audio
            ref={audioRef}
            src={node.audioData}
            onEnded={() => setIsPlaying(false)}
            className="flex-1"
            controls
          />
        </div>
      )}
    </div>
  );
}