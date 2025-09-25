export interface UserPublic {
  id: string;
  email: string;
  name?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface UIUserPublic extends Omit<UserPublic, 'id' | 'created_at' | 'updated_at'> {
  id: string;
  created_at?: string | number;
  updated_at?: string | number;
}

