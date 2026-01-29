
export interface User {
  username: string;
  id: string;
  lastLogin: number;
}

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
  audioUrl?: string;
  prompt: string;
  config?: {
    aspectRatio?: string;
    style?: string;
    length?: string;
  };
}

export type AIPersonality = 'GERVIS' | 'FRIDAY' | 'ALTON' | 'MOLTBOT' | 'AI_DOST';

export interface AvatarConfig {
  hairstyle: string;
  faceType: string;
  themeColor: string;
  accessory: string;
  generatedUrl?: string;
  userFaceImage?: string;
  identity: AIPersonality;
  voiceName: string;
  granular?: {
    noseSize: number;
    eyeWidth: number;
    jawLine: number;
    glowIntensity: number;
  };
}

export type VideoStyle = 'CINEMATIC' | 'REALISTIC' | 'ANIMATED' | 'CYBERPUNK';
export type VideoLength = '5s' | '10s' | '15s';

export interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isAI?: boolean;
}

export enum SessionState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export interface SystemStatus {
  threatLevel: 'MINIMAL' | 'ELEVATED' | 'CRITICAL';
  isSearching?: boolean;
  motionDetected?: boolean;
  motionSensitivity?: number;
  isBuilding?: boolean;
  battery?: { level: number; charging: boolean; };
  location?: { lat: number; lng: number; accuracy: number; };
  networkType?: string;
}

export interface AdCampaign {
  brandName: string;
  slogan: string;
  visualUrl?: string;
  status: string;
  phases: string[];
}

export interface TrainingSession {
  name: string;
  status: string;
  accuracy: number;
  loss: number;
  epoch: number;
  totalEpochs: number;
  progress: number;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  sessionName: string;
  unreadCount: number;
}

export interface SocialAccount {
  platform: 'INSTAGRAM' | 'META' | 'TWITTER' | 'TIKTOK';
  handle: string;
  followers: string;
  engagementRate: string;
  growth: string;
  isConnected: boolean;
  autoEngageActive: boolean;
  shopStatus: 'IDLE' | 'PENDING' | 'ACTIVE';
}

export interface AutoComment {
  id: string;
  platform: 'INSTAGRAM' | 'META' | 'TWITTER' | 'TIKTOK';
  targetUser: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  timestamp: number;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'EXECUTING';
  triggers: string[];
  lastRun?: number;
}

export interface MasterProject {
  id: string;
  name: string;
  target: 'WEB' | 'IOS' | 'ANDROID' | 'WINDOWS';
  status: 'SYNTHESIZING' | 'MAPPING' | 'EXTRACTING' | 'COMPLETE';
  progress: number;
  roadmap: {
    phase: string;
    details: string;
    completed: boolean;
  }[];
  intel: {
    source: string;
    data: string;
  }[];
}
