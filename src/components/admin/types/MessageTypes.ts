
export interface MessageProfile {
  full_name: string | null;
}

export interface MessageCar {
  title?: string;
  make?: string;
  model?: string;
  year?: number;
}

export interface Message {
  id: string;
  car_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read: boolean;
  created_at: string;
  car?: MessageCar;
  sender_profile?: MessageProfile;
  recipient_profile?: MessageProfile;
  sender_name?: string;
  recipient_name?: string;
  car_title?: string;
}
