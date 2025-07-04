
export enum UserRole {
  Customer = 'Customer',
  Artisan = 'Artisan',
}

export enum ServiceCategory {
  Plumbing = 'Plomberie',
  Electricity = 'Électricité',
  Painting = 'Peinture',
  Carpentry = 'Menuiserie',
  AC = 'Installation Climatiseur',
  Satellite = 'Installation Parabole',
  Welding = 'Soudure',
  Handyman = 'Bricolage Général',
  Zellige = 'Zellige',
  Tadelakt = 'Tadelakt',
  Plaster = 'Plâtre',
}

export enum JobStatus {
  Open = 'Open',
  AwaitingPayment = 'Awaiting Payment',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Disputed = 'Disputed',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatarUrl: string;
  role: UserRole;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface Artisan extends User {
  role: UserRole.Artisan;
  specialization: ServiceCategory;
  rating: number;
  jobsCompleted: number;
  isVerified: boolean;
  portfolio: string[];
  location: string;
  reviews: Review[];
  totalEarnings: number;
  acceptanceRate: number; // in percentage
}

export interface Customer extends User {
  role: UserRole.Customer;
}

export interface Bid {
  id: string;
  artisanId: string;
  jobRequestId: string;
  amount: number; // Artisan's counter-offer
  timestamp: number;
}

export interface DisputeInfo {
    reason: string;
    raisedAt: number;
    status: 'open' | 'resolved';
}

export interface JobRequest {
  id: string;
  customerId: string;
  category: ServiceCategory;
  description: string;
  imageUrl?: string;
  location: string;
  proposedPrice: number;
  status: JobStatus;
  createdAt: number;
  bids: Bid[];
  acceptedArtisanId?: string;
  isReviewed?: boolean;
  chatHistory?: ChatMessage[];
  paymentStatus: 'unpaid' | 'paid' | 'released';
  escrowAmount?: number;
  dispute?: DisputeInfo;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'model';
    text: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  link?: {
    view: 'job' | 'dashboard_tab';
    jobId?: string;
    tabName?: 'available' | 'bids' | 'inProgress' | 'completed' | 'disputed';
  };
}
