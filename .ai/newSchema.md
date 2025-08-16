type Query {
  getCoinGraphHistory(
    days: Float!
    vs_currency: String!
    id: String!
  ): CoinGeckoGraphHistory
  getCoinDetails(vs_currency: String!, id: String): CoinGeckoCoinDetails
  searchCryptoCoin(query: String!): [CoinGeckoSearchCoin!]!
  getSupportedVsCurrencies: [String!]!
  getMarketData(
    sparkline: Boolean = false
    page: Float = 1
    per_page: Float = 10
    order: String = "market_cap_desc"
    vs_currency: String = "usd"
    ids: String
  ): [CoinGeckoMarkets!]
  searchETF(searchKey: String!): ETFSearch!
  getExpenses(archived: Boolean, order: String = "DESC"): [Expense!]!
  getExpenseCategories: [ExpenseCategory!]
  getExpense(id: String!): Expense
  me: User
  getUser(username: String!): User!
  getETF(id: String!): ETF
  getETFs: [ETF!]!
  getSavingDepot(id: String!): SavingDepot
  getSavingDepots: [SavingDepot!]!
  summary: UserSummary!
  categorizeExpense(
    multiLabel: Boolean = false
    title: String!
  ): CategorizeExpenseResultType!
  getExpenseTransactionTemplates: [ExpenseTransactionTemplate!]!
  getExpenseTransactionTemplate(id: String!): ExpenseTransactionTemplate!
}

type CoinGeckoGraphHistory {
  prices: [[Float!]!]!
  market_caps: [[Float!]!]!
  total_volumes: [[Float!]!]!
}

type CoinGeckoCoinDetails {
  id: String!
  symbol: String!
  name: String!
  block_time_in_minutes: Float!
  hashing_algorithm: String
  categories: [String!]!
  description: Describtion!
  image: Images!
  genesis_date: String
  market_cap_rank: Float
  market_data: MarketData!
}

type Describtion {
  en: String!
}

type Images {
  thumb: String!
  small: String!
  large: String!
}

type MarketData {
  current_price: Float!
  ath: Float!
  ath_change_percentage: Float!
  ath_date: String!
  atl: Float!
  atl_change_percentage: Float!
  atl_date: String!
  market_cap: Float!
  market_cap_rank: Float!
  total_volume: Float!
  high_24h: Float!
  low_24h: Float!
  price_change_percentage_24h: Float!
  price_change_percentage_7d: Float!
  price_change_percentage_14d: Float!
  price_change_percentage_30d: Float!
  price_change_percentage_60d: Float!
  price_change_percentage_200d: Float!
  price_change_percentage_1y: Float!
  market_cap_change_24h: Float!
  market_cap_change_percentage_24h: Float!
  price_change_24h_in_currency: Float!
  price_change_percentage_1h_in_currency: Float
  price_change_percentage_24h_in_currency: Float!
  price_change_percentage_7d_in_currency: Float!
  price_change_percentage_14d_in_currency: Float!
  price_change_percentage_30d_in_currency: Float!
  price_change_percentage_60d_in_currency: Float!
  price_change_percentage_200d_in_currency: Float!
  price_change_percentage_1y_in_currency: Float!
  market_cap_change_24h_in_currency: Float!
  market_cap_change_percentage_24h_in_currency: Float!
  total_supply: Float
  max_supply: Float
  circulating_supply: Float!
  sparkline_7d: Sparkline!
  last_updated: String!
}

type Sparkline {
  price: [Float!]
}

type CoinGeckoSearchCoin {
  id: String!
  name: String!
  symbol: String!
  api_symbol: String!
  market_cap_rank: Float
  thumb: String!
  large: String!
}

type CoinGeckoMarkets {
  id: String!
  symbol: String!
  name: String!
  image: String!
  current_price: Float!
  market_cap: Float!
  market_cap_rank: Float
  fully_diluted_valuation: Float!
  total_volume: Float!
  high_24h: Float!
  low_24h: Float!
  price_change_percentage_1h_in_currency: Float
  price_change_24h: Float!
  price_change_percentage_7d_in_currency: Float
  price_change_percentage_24h: Float
  market_cap_change_24h: Float
  market_cap_change_percentage_24h: Float
  circulating_supply: Float!
  total_supply: Float!
  max_supply: Float!
  ath: Float!
  ath_change_percentage: Float!
  ath_date: String!
  atl: Float!
  atl_change_percentage: Float!
  atl_date: String!
  last_updated: String!
  sparkline_in_7d: Sparkline
}

type ETFSearch {
  name: String!
  title: String!
  symbol: String!
  isin: String!
  wkn: String!
}

type Expense {
  id: ID!
  title: String!
  currency: String
  archived: Boolean!
  monthlyRecurring: Boolean!
  spendingLimit: Int
  sum: Float!
  user: User!
  transactions(order: String = "DESC"): [ExpenseTransaction!]
  expenseByCategory: [ExpenseByCategory!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User {
  id: ID!
  username: String!
  firstName: String
  middleName: String
  lastName: String
  email: String!
  etfs: [ETF!]!
  etfTransactions: [ETFTransaction!]!
  savingDepots: [SavingDepot!]!
  savingTransactions: [SavingTransaction!]!
  expenseDepots: [Expense!]!
  expenseTransactions: [ExpenseTransaction!]!
  expenseCategory: [ExpenseCategory!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ETF {
  id: ID!
  name: String!
  title: String!
  symbol: String!
  isin: String!
  wkn: String!

  # How much is the ETF worth
  worth: Float!

  # How much was invested in the ETF
  deposited: Float!

  # How many parts of the ETF
  amount: Float!
  user: User!
  transactions(order: String = "DESC"): [ETFTransaction!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ETFTransaction {
  id: ID!

  # How much invested in the ETF
  invest: Float!

  # How much Fee was payed this time
  fee: Float!

  # How much parts of the etf was bougth
  amount: Float!

  # How much is the ETF worth this time
  value: Float!
  user: User!
  etf: ETF!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# The javascript `Date` as string. Type represents date and time as the ISO Date string.
scalar DateTime

type SavingDepot {
  id: ID!
  name: String!
  short: String!
  currency: String
  savinggoal: Int
  sum: Float!
  user: User!
  transactions(order: String = "DESC"): [SavingTransaction!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SavingTransaction {
  id: ID!
  describtion: String!
  amount: Float!
  user: User!
  depot: SavingDepot!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ExpenseTransaction {
  id: ID!
  describtion: String!
  amount: Float!
  user: User!
  expense: Expense!
  category: ExpenseCategory
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ExpenseCategory {
  id: ID!
  name: String!
  color: String
  icon: String
  transactions: [ExpenseTransaction!]
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ExpenseByCategory {
  name: String!
  amount: Float!
  icon: String!
  color: String!
}

type UserSummary {
  latestExpense: Expense
  todaySpent: [ExpenseTransaction!]
  etfWorth: Float
  etfMovement: Float
  savingValue: Float!
}

type CategorizeExpenseResultType {
  best: CategoryScoreType
  candidates: [CategoryScoreType!]!
}

type CategoryScoreType {
  id: ID!
  name: String!
  score: Float!
}

type ExpenseTransactionTemplate {
  id: ID!
  describtion: String!
  amount: Float!
  user: User!
  category: ExpenseCategory
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Mutation {
  updateSavingDepot(
    savinggoal: Int
    currency: String
    short: String
    name: String
    id: String!
  ): SavingDepot!
  updateExpense(
    spendingLimit: Int
    monthlyRecurring: Boolean
    archived: Boolean
    currency: String
    title: String
    id: String!
  ): Expense!
  updateExpenseCategory(
    color: String
    icon: String
    name: String
    id: String!
  ): ExpenseCategory!
  updateExpenseTransaction(
    date: String
    amount: Float
    categoryId: String
    describtion: String
    transactionId: String!
  ): ExpenseTransaction!
  deleteExpenseCategory(id: String!): Boolean!
  createExpenseCategory(
    icon: String
    color: String
    name: String!
  ): ExpenseCategory!
  createExpenseTransaction(
    date: Float
    autocategorize: Boolean
    categoryId: String
    expenseId: String!
    amount: Float!
    describtion: String!
  ): ExpenseTransaction!
  deleteExpense(id: String!): Boolean!
  createExpense(
    skipTemplateIds: [ID!]
    spendingLimit: Int
    monthlyRecurring: Boolean
    currency: String
    title: String!
  ): Expense!
  logout: Boolean!
  signup(data: RegisterInput!): User
  login(password: String!, username: String!): LoginType
  changePassword(newPassword: String!, currentPassword: String!): Boolean!
  updateSavingTransaction(
    date: String
    amount: Float
    describtion: String
    transactionId: Float!
  ): SavingTransaction!
  deleteETFTransaction(id: String!): Boolean!
  deleteETF(id: String!): Boolean!
  createETFTransaction(
    date: String
    fee: Float = 0
    invest: Float
    etfId: String!
  ): ETFTransaction!
  createETF(isin: String!): ETF!
  deleteSavingTransaction(id: String!): Boolean!
  deleteSavingDepot(id: String!): Boolean!
  createSavingTransaction(
    date: Float
    depotId: String!
    amount: Float!
    describtion: String!
  ): SavingTransaction!
  createSavingDepot(
    savinggoal: Int
    currency: String
    short: String!
    name: String!
  ): SavingDepot!
  deleteExpenseTransaction(id: String!): Boolean!
  createExpenseTransactionTemplate(
    categoryId: String
    amount: Float!
    describtion: String!
  ): ExpenseTransactionTemplate!
  updateExpenseTransactionTemplate(
    categoryId: String
    amount: Float
    describtion: String
    id: String!
  ): ExpenseTransactionTemplate!
  deleteExpenseTransactionTemplate(id: String!): Boolean!
}

input RegisterInput {
  username: String!
  email: String!
  password: String!
}

type LoginType {
  user: User!
  token: String!
}
