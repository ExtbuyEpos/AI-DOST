
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
  userFaceImage?: string; // Base64 of user's uploaded face
  identity: AIPersonality;
  voiceName: string;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  pairingCode?: string;
  sessionName: string;
  lastMessage?: string;
  unreadCount: number;
}

export interface AutoComment {
  id: string;
  platform: 'INSTAGRAM' | 'META' | 'TWITTER';
  targetUser: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL';
  timestamp: number;
}

export interface SocialAccount {
  platform: 'INSTAGRAM' | 'META' | 'TWITTER' | 'TIKTOK';
  handle: string;
  followers: string;
  engagementRate: string;
  growth: string;
  shopStatus: 'NOT_APPLIED' | 'PENDING' | 'ACTIVE';
  isConnected: boolean;
  autoEngageActive: boolean;
}

export interface BusinessLead {
  id: string;
  name: string;
  status: 'HOT' | 'WARM' | 'COLD';
  lastInteraction: string;
}

export interface AdCampaign {
  id: string;
  brandName: string;
  slogan: string;
  visualUrl?: string;
  status: string;
  phases: string[];
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  network: number;
  threatLevel: 'MINIMAL' | 'ELEVATED' | 'CRITICAL';
  marketStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  tradingVolume: string;
  pcLink: boolean;
  mobileLink: boolean;
  socialNodes: boolean;
  satelliteLink: boolean;
  miningHashrate: string;
  vaultStatus: 'SECURE' | 'ENCRYPTED';
  lastCommand?: string;
  battery?: {
    level: number;
    charging: boolean;
  };
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  networkType?: string;
  whatsapp?: WhatsAppStatus;
  isSearching?: boolean;
}

export enum SessionState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export interface TrainingSession {
  id: string;
  name: string;
  progress: number;
  accuracy: number;
  loss: number;
  status: 'INITIALIZING' | 'TRAINING' | 'OPTIMIZING' | 'FINALIZING' | 'COMPLETE';
  epoch: number;
  totalEpochs: number;
  metrics: number[];
}

// Fix: Added GitHubRepo interface to resolve import error in GitHubNode.tsx
export interface GitHubRepo {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  languages: string[];
  lastSync: number;
}

// Fix: Added CodeAnalysis interface to resolve import error in GitHubNode.tsx
export interface CodeAnalysis {
  filePath: string;
  language: string;
  issues: string[];
  optimizations: string[];
  content: string;
}
