import { gql } from '@apollo/client';

export const PROCESS_VOICE_EXPENSE = gql`
  mutation PROCESSVOICEEXPENSE($expenseId: String!, $file: Upload!, $language: String) {
    processVoiceExpense(expenseId: $expenseId, file: $file, language: $language) {
      id
      transcription
      title
      amount
      suggestedCategoryId
      suggestedCategoryName
    }
  }
`;
