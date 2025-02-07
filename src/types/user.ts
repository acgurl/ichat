export interface UserInfo {
  name: string;
  balance: number;
  chargeBalance: number;
  totalBalance: number;
  status: 'active' | 'inactive';
  created: number;
  lastLogin?: number;
}

export interface UserResponse {
  status: boolean;
  code: number;
  message?: string;
  data: UserInfo;
}
