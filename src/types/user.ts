export interface UserInfo {
  id: string;
  name: string;
  email: string;
  image: string;
  introduction: string;
  role: string;
  status: string;
  isAdmin: boolean;
  balance: string;
  chargeBalance: string;
  totalBalance: string;
}

export interface UserResponse {
  code: number;
  status: boolean;
  message: string;
  data: UserInfo;
}
