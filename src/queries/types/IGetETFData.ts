export interface IGetEtfData {
  getETFs: Array<ETF>;
}

interface ETF {
  name: string;
  id: string;
  worth: number;
  deposited: number;
}
