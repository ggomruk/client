export interface GeneralResponse<T = any> {
  isOk: boolean;
  errorCode?: number;
  message: string;
  payload?: T;
}
