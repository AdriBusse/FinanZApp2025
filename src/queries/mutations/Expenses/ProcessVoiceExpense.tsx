import { gql } from '@apollo/client';

export const PROCESS_VOICE_EXPENSE = gql`
  mutation PROCESSVOICEEXPENSE($expenseId: String!, $base64File: String, $fileExtension: String, $language: String) {
    processVoiceExpense(expenseId: $expenseId, base64File: $base64File, fileExtension: $fileExtension, language: $language) {
      id
      transcription
      title
      amount
      suggestedCategoryId
      suggestedCategoryName
    }
  }
`;
