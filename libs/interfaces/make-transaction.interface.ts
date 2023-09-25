export interface IMakeTransaction {
  walletId: string;
  amount: number;
}

export const SUCCESS = 'success';
export const FAILURE = 'failure';

export interface IMakeTransactionResponse {
  status: 'success' | 'failure'
}