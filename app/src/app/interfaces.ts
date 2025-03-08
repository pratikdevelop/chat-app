export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string;
    status: string;
    phone:string;

    bio: string,
    is_verified: string;
    last_seen: string;
  }
  
  export interface Conversation {
    id: number;
    members: User[];
    conversation_type: 'private' | 'group';
    name: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Message {
    id: number;
    conversation: number;
    sender: User;
    message: string;
    file: string;
    message_type: string;
    created_at: string;
    is_read: boolean;
    is_delivered: boolean;
  }