
export interface SourceLink {
  uri: string;
  title: string;
}

export interface TranscriptionLine {
  text: string;
  role: 'user' | 'model';
  timestamp: number;
  sources?: SourceLink[];
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export type AIPersonality = 'GERVIS' | 'FRIDAY' | 'ALTON';

export interface AvatarConfig {
  hairstyle: string;
  faceType: string;
  themeColor: string;
  accessory: string;
  generatedUrl?: string;
  userFaceImage?: string;
  identity: AIPersonality;
  voiceName: string;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  network: number;
  threatLevel: 'MINIMAL' | 'ELEVATED' | 'CRITICAL';
  battery?: {
    level: number;
    charging: boolean;
  };
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  motion?: {
    x: number;
    y: number;
    z: number;
  };
  isSearching?: boolean;
}

export enum SessionState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}
