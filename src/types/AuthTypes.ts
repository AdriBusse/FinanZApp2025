export type AuthContextData = {
  authData?: AuthData;
  loading: boolean;
  login(username: string, password: string): Promise<void>;
  logout(): void;
};

export type AuthData = {
  token: string;
  email: string;
  username: string;
};
