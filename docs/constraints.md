# Development Constraints

## GraphQL Mutations & Schemas

1. **`createExpenseTransaction` Mutation**:
   - `date` field expects `DateTime` (ISO-8601 string, e.g. `2026-08-22T05:41:35.000Z`), NOT `Float` (milliseconds timestamp).
   - `autocategorize` is NOT a supported argument on the backend mutation `createExpenseTransaction`.
   - `categoryId` should be passed as `undefined` / `null` rather than empty string `""` when no category is selected.

2. **`updateExpenseTransaction` Mutation**:
   - `id` argument is required (`id: String!`), NOT `transactionId`.
   - `date` field expects `DateTime` (ISO-8601 string), NOT `String`.
   - `categoryId` should be passed as `undefined` / `null` rather than empty string `""`.

3. **`updateSavingTransaction` Mutation**:
   - Cache comparisons should use string coercion (`${item.id} === ${transaction.id}`) to handle string vs number ID discrepancies.
