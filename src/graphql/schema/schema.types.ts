export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
};

export type CoinGeckoCoinDetails = {
  __typename?: 'CoinGeckoCoinDetails';
  block_time_in_minutes: Scalars['Float']['output'];
  categories: Array<Scalars['String']['output']>;
  description: Describtion;
  genesis_date?: Maybe<Scalars['String']['output']>;
  hashing_algorithm?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image: Images;
  market_cap_rank?: Maybe<Scalars['Float']['output']>;
  market_data: MarketData;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

export type CoinGeckoGraphHistory = {
  __typename?: 'CoinGeckoGraphHistory';
  market_caps: Array<Array<Scalars['Float']['output']>>;
  prices: Array<Array<Scalars['Float']['output']>>;
  total_volumes: Array<Array<Scalars['Float']['output']>>;
};

export type CoinGeckoMarkets = {
  __typename?: 'CoinGeckoMarkets';
  ath: Scalars['Float']['output'];
  ath_change_percentage: Scalars['Float']['output'];
  ath_date: Scalars['String']['output'];
  atl: Scalars['Float']['output'];
  atl_change_percentage: Scalars['Float']['output'];
  atl_date: Scalars['String']['output'];
  circulating_supply: Scalars['Float']['output'];
  current_price: Scalars['Float']['output'];
  fully_diluted_valuation: Scalars['Float']['output'];
  high_24h: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  last_updated: Scalars['String']['output'];
  low_24h: Scalars['Float']['output'];
  market_cap: Scalars['Float']['output'];
  market_cap_change_24h?: Maybe<Scalars['Float']['output']>;
  market_cap_change_percentage_24h?: Maybe<Scalars['Float']['output']>;
  market_cap_rank?: Maybe<Scalars['Float']['output']>;
  max_supply: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  price_change_24h: Scalars['Float']['output'];
  price_change_percentage_1h_in_currency?: Maybe<Scalars['Float']['output']>;
  price_change_percentage_7d_in_currency?: Maybe<Scalars['Float']['output']>;
  price_change_percentage_24h?: Maybe<Scalars['Float']['output']>;
  sparkline_in_7d?: Maybe<Sparkline>;
  symbol: Scalars['String']['output'];
  total_supply: Scalars['Float']['output'];
  total_volume: Scalars['Float']['output'];
};

export type CoinGeckoSearchCoin = {
  __typename?: 'CoinGeckoSearchCoin';
  api_symbol: Scalars['String']['output'];
  id: Scalars['String']['output'];
  large: Scalars['String']['output'];
  market_cap_rank?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  thumb: Scalars['String']['output'];
};

export type Describtion = {
  __typename?: 'Describtion';
  en: Scalars['String']['output'];
};

export type Etf = {
  __typename?: 'ETF';
  /** How many parts of the ETF */
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** How much was invested in the ETF */
  deposited: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isin: Scalars['String']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  title: Scalars['String']['output'];
  transactions?: Maybe<Array<EtfTransaction>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  wkn: Scalars['String']['output'];
  /** How much is the ETF worth */
  worth: Scalars['Float']['output'];
};

export type EtfTransactionsArgs = {
  order?: InputMaybe<Scalars['String']['input']>;
};

export type EtfSearch = {
  __typename?: 'ETFSearch';
  isin: Scalars['String']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  title: Scalars['String']['output'];
  wkn: Scalars['String']['output'];
};

export type EtfTransaction = {
  __typename?: 'ETFTransaction';
  /** How much parts of the etf was bougth */
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  etf: Etf;
  /** How much Fee was payed this time */
  fee: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  /** How much invested in the ETF */
  invest: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  /** How much is the ETF worth this time */
  value: Scalars['Float']['output'];
};

export type Expense = {
  __typename?: 'Expense';
  archived: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  expenseByCategory: Array<ExpenseByCategory>;
  id: Scalars['ID']['output'];
  monthlyRecurring: Scalars['Boolean']['output'];
  spendingLimit?: Maybe<Scalars['Int']['output']>;
  sum: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  transactions?: Maybe<Array<ExpenseTransaction>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type ExpenseTransactionsArgs = {
  order?: InputMaybe<Scalars['String']['input']>;
};

export type ExpenseByCategory = {
  __typename?: 'ExpenseByCategory';
  amount: Scalars['Float']['output'];
  color: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type ExpenseCategory = {
  __typename?: 'ExpenseCategory';
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  transactions?: Maybe<Array<ExpenseTransaction>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type ExpenseTransaction = {
  __typename?: 'ExpenseTransaction';
  amount: Scalars['Float']['output'];
  category?: Maybe<ExpenseCategory>;
  createdAt: Scalars['DateTime']['output'];
  describtion: Scalars['String']['output'];
  expense: Expense;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type Images = {
  __typename?: 'Images';
  large: Scalars['String']['output'];
  small: Scalars['String']['output'];
  thumb: Scalars['String']['output'];
};

export type LoginType = {
  __typename?: 'LoginType';
  token: Scalars['String']['output'];
  user: User;
};

export type MarketData = {
  __typename?: 'MarketData';
  ath: Scalars['Float']['output'];
  ath_change_percentage: Scalars['Float']['output'];
  ath_date: Scalars['String']['output'];
  atl: Scalars['Float']['output'];
  atl_change_percentage: Scalars['Float']['output'];
  atl_date: Scalars['String']['output'];
  circulating_supply: Scalars['Float']['output'];
  current_price: Scalars['Float']['output'];
  high_24h: Scalars['Float']['output'];
  last_updated: Scalars['String']['output'];
  low_24h: Scalars['Float']['output'];
  market_cap: Scalars['Float']['output'];
  market_cap_change_24h: Scalars['Float']['output'];
  market_cap_change_24h_in_currency: Scalars['Float']['output'];
  market_cap_change_percentage_24h: Scalars['Float']['output'];
  market_cap_change_percentage_24h_in_currency: Scalars['Float']['output'];
  market_cap_rank: Scalars['Float']['output'];
  max_supply?: Maybe<Scalars['Float']['output']>;
  price_change_24h_in_currency: Scalars['Float']['output'];
  price_change_percentage_1h_in_currency?: Maybe<Scalars['Float']['output']>;
  price_change_percentage_1y: Scalars['Float']['output'];
  price_change_percentage_1y_in_currency: Scalars['Float']['output'];
  price_change_percentage_7d: Scalars['Float']['output'];
  price_change_percentage_7d_in_currency: Scalars['Float']['output'];
  price_change_percentage_14d: Scalars['Float']['output'];
  price_change_percentage_14d_in_currency: Scalars['Float']['output'];
  price_change_percentage_24h: Scalars['Float']['output'];
  price_change_percentage_24h_in_currency: Scalars['Float']['output'];
  price_change_percentage_30d: Scalars['Float']['output'];
  price_change_percentage_30d_in_currency: Scalars['Float']['output'];
  price_change_percentage_60d: Scalars['Float']['output'];
  price_change_percentage_60d_in_currency: Scalars['Float']['output'];
  price_change_percentage_200d: Scalars['Float']['output'];
  price_change_percentage_200d_in_currency: Scalars['Float']['output'];
  sparkline_7d: Sparkline;
  total_supply?: Maybe<Scalars['Float']['output']>;
  total_volume: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createETF: Etf;
  createETFTransaction: EtfTransaction;
  createExpense: Expense;
  createExpenseCategory: ExpenseCategory;
  createExpenseTransaction: ExpenseTransaction;
  createSavingDepot: SavingDepot;
  createSavingTransaction: SavingTransaction;
  deleteETF: Scalars['Boolean']['output'];
  deleteETFTransaction: Scalars['Boolean']['output'];
  deleteExpense: Scalars['Boolean']['output'];
  deleteExpenseCategory: Scalars['Boolean']['output'];
  deleteExpenseTransaction: Scalars['Boolean']['output'];
  deleteSavingDepot: Scalars['Boolean']['output'];
  deleteSavingTransaction: Scalars['Boolean']['output'];
  login?: Maybe<LoginType>;
  logout: Scalars['Boolean']['output'];
  signup?: Maybe<User>;
  updateExpense: Expense;
  updateExpenseCategory: ExpenseCategory;
  updateExpenseTransaction: ExpenseTransaction;
  updateSavingDepot: SavingDepot;
  updateSavingTransaction: SavingTransaction;
};

export type MutationCreateEtfArgs = {
  isin: Scalars['String']['input'];
};

export type MutationCreateEtfTransactionArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  etfId: Scalars['String']['input'];
  fee?: InputMaybe<Scalars['Float']['input']>;
  invest?: InputMaybe<Scalars['Float']['input']>;
};

export type MutationCreateExpenseArgs = {
  monthlyRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  skipTemplateIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  spendingLimit?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type MutationCreateExpenseCategoryArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type MutationCreateExpenseTransactionArgs = {
  amount: Scalars['Float']['input'];
  autocategorize?: InputMaybe<Scalars['Boolean']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  describtion: Scalars['String']['input'];
  expenseId: Scalars['String']['input'];
};

export type MutationCreateSavingDepotArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  savinggoal?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  short: Scalars['String']['input'];
};

export type MutationCreateSavingTransactionArgs = {
  amount: Scalars['Float']['input'];
  date?: InputMaybe<Scalars['Float']['input']>;
  depotId: Scalars['String']['input'];
  describtion: Scalars['String']['input'];
};

export type MutationDeleteEtfArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteEtfTransactionArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteExpenseArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteExpenseCategoryArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteExpenseTransactionArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteSavingDepotArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteSavingTransactionArgs = {
  id: Scalars['String']['input'];
};

export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MutationSignupArgs = {
  data: RegisterInput;
};

export type MutationUpdateExpenseArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  monthlyRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  spendingLimit?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateExpenseCategoryArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateExpenseTransactionArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  describtion?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['String']['input'];
};

export type MutationUpdateSavingDepotArgs = {
  currency?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  savinggoal?: InputMaybe<Scalars['Int']['input']>;
  short?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateSavingTransactionArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  describtion?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  getCoinDetails?: Maybe<CoinGeckoCoinDetails>;
  getCoinGraphHistory?: Maybe<CoinGeckoGraphHistory>;
  getETF?: Maybe<Etf>;
  getETFs: Array<Etf>;
  getExpense?: Maybe<Expense>;
  getExpenseCategories?: Maybe<Array<ExpenseCategory>>;
  getExpenses: Array<Expense>;
  getMarketData?: Maybe<Array<CoinGeckoMarkets>>;
  getSavingDepot?: Maybe<SavingDepot>;
  getSavingDepots: Array<SavingDepot>;
  getSupportedVsCurrencies: Array<Scalars['String']['output']>;
  getUser: User;
  me?: Maybe<User>;
  searchCryptoCoin: Array<CoinGeckoSearchCoin>;
  searchETF: EtfSearch;
  summary: UserSummary;
};

export type QueryGetCoinDetailsArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  vs_currency: Scalars['String']['input'];
};

export type QueryGetCoinGraphHistoryArgs = {
  days: Scalars['Float']['input'];
  id: Scalars['String']['input'];
  vs_currency: Scalars['String']['input'];
};

export type QueryGetEtfArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetExpenseArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetExpensesArgs = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetMarketDataArgs = {
  ids?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Float']['input']>;
  per_page?: InputMaybe<Scalars['Float']['input']>;
  sparkline?: InputMaybe<Scalars['Boolean']['input']>;
  vs_currency?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGetSavingDepotArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetUserArgs = {
  username: Scalars['String']['input'];
};

export type QuerySearchCryptoCoinArgs = {
  query: Scalars['String']['input'];
};

export type QuerySearchEtfArgs = {
  searchKey: Scalars['String']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SavingDepot = {
  __typename?: 'SavingDepot';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  savinggoal?: Maybe<Scalars['Int']['output']>;
  short: Scalars['String']['output'];
  sum: Scalars['Float']['output'];
  transactions?: Maybe<Array<SavingTransaction>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type SavingDepotTransactionsArgs = {
  order?: InputMaybe<Scalars['String']['input']>;
};

export type SavingTransaction = {
  __typename?: 'SavingTransaction';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  depot: SavingDepot;
  describtion: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type Sparkline = {
  __typename?: 'Sparkline';
  price?: Maybe<Array<Scalars['Float']['output']>>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  etfTransactions: Array<EtfTransaction>;
  etfs: Array<Etf>;
  expenseCategory: Array<ExpenseCategory>;
  expenseDepots: Array<Expense>;
  expenseTransactions: Array<ExpenseTransaction>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  savingDepots: Array<SavingDepot>;
  savingTransactions: Array<SavingTransaction>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserSummary = {
  __typename?: 'UserSummary';
  etfMovement?: Maybe<Scalars['Float']['output']>;
  etfWorth?: Maybe<Scalars['Float']['output']>;
  latestExpense?: Maybe<Expense>;
  savingValue: Scalars['Float']['output'];
  todaySpent?: Maybe<Array<ExpenseTransaction>>;
};
