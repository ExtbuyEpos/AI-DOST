
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

export type AIPersonality = 'GERVIS' | 'FRIDAY' | 'ALTON' | 'MOLTBOT';

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
  battery?: { level: number; charging: boolean; };
  location?: { lat: number; lng: number; accuracy: number; };
  networkType?: string;
}

// Fix: Added missing AdCampaign type used in PromotionDisplay and OmniMonitor
export interface AdCampaign {
  brandName: string;
  slogan: string;
  visualUrl?: string;
  status: string;
  phases: string[];
}

// Fix: Added missing TrainingSession type used in NeuralTrainingModule
export interface TrainingSession {
  name: string;
  status: string;
  accuracy: number;
  loss: number;
  epoch: number;
  totalEpochs: number;
  progress: number;
}

// Fix: Added missing WhatsAppStatus type used in WhatsAppNode
export interface WhatsAppStatus {
  isConnected: boolean;
  sessionName: string;
  unreadCount: number;
}

// Fix: Added missing SocialAccount type used in SocialMediaNode
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

// Fix: Added missing AutoComment type used in SocialMediaNode
export interface AutoComment {
  id: string;
  platform: 'INSTAGRAM' | 'META' | 'TWITTER' | 'TIKTOK';
  targetUser: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  timestamp: number;
}

// Fix: Added missing N8NWorkflow type used in N8NNode
export interface N8NWorkflow {
  id: string;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'EXECUTING';
  triggers: string[];
  lastRun?: number;
}
