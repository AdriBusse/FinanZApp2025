import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Record from '../src/screens/Record';

const mockConfirmVoiceMutation = jest.fn();
const mockProcessVoiceMutation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: (mutation: any) => {
    const mutationStr = JSON.stringify(mutation);
    if (
      mutationStr.includes('CONFIRMVOICETRANSACTION') ||
      mutationStr.includes('confirmVoiceTransaction')
    ) {
      return [mockConfirmVoiceMutation, { loading: false }];
    }
    return [mockProcessVoiceMutation, { loading: false }];
  },
}));

jest.mock('../src/hooks/useExpenses', () => ({
  useExpenses: () => ({
    expensesQuery: {
      data: {
        getExpenses: [
          {
            id: 'exp-1',
            title: 'Monthly Budget',
            currency: 'EUR',
          },
        ],
      },
      loading: false,
    },
    categoriesQuery: {
      data: {
        getExpenseCategories: [
          { id: 'cat-1', name: 'Food', color: '#ff0000' },
          { id: 'cat-2', name: 'Transport', color: '#00ff00' },
        ],
      },
      loading: false,
    },
  }),
}));

describe('Record Screen - Voice Transaction Editing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Record screen without errors', async () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<Record />);
    });
    expect(component!).toBeDefined();
  });

  test('edits transcribed title and amount and confirms with updated values', async () => {
    mockProcessVoiceMutation.mockResolvedValue({
      data: {
        processVoiceExpense: {
          id: 'v-1',
          transcription: 'Lunch 15 euros',
          title: 'Lunch',
          amount: 15,
          suggestedCategoryId: 'cat-1',
          suggestedCategoryName: 'Food',
        },
      },
    });

    mockConfirmVoiceMutation.mockResolvedValue({
      data: {
        confirmVoiceTransaction: {
          id: 'tx-100',
          describtion: 'Business Lunch with Client',
          amount: 32.5,
          createdAt: '2026-08-21T12:00:00Z',
          category: {
            id: 'cat-1',
            name: 'Food',
          },
        },
      },
    });

    let component: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      component = ReactTestRenderer.create(<Record />);
    });

    const root = component!.root;

    // Find the record button
    const allPressables = root.findAll(
      node => typeof node.props?.onPress === 'function',
    );
    // The record button is the one at the bottom with startRecording/stopRecording
    const recordBtn = allPressables[allPressables.length - 1];

    // Start recording
    await ReactTestRenderer.act(async () => {
      recordBtn.props.onPress();
    });

    // Stop recording and process
    await ReactTestRenderer.act(async () => {
      recordBtn.props.onPress();
    });

    // Expect processVoiceMutation to have been called
    expect(mockProcessVoiceMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          expenseId: 'exp-1',
        }),
      }),
    );

    // Find TextInput elements for title and amount
    const textInputs = root.findAllByType('TextInput' as any);
    const titleInput = textInputs.find(i => i.props.placeholder === 'Title');
    const amountInput = textInputs.find(i => i.props.placeholder === 'Amount');

    expect(titleInput).toBeDefined();
    expect(amountInput).toBeDefined();
    expect(titleInput?.props.value).toBe('Lunch');
    expect(amountInput?.props.value).toBe('15');

    // Edit title and amount
    await ReactTestRenderer.act(async () => {
      titleInput!.props.onChangeText('Business Lunch with Client');
      amountInput!.props.onChangeText('32.50');
    });

    // Find confirm button
    const buttons = root.findAll(
      node =>
        (node.type as any)?.name === 'RoundedButton' ||
        node.props.title === 'Confirm',
    );
    const confirmButton = buttons.find(b => b.props.title === 'Confirm');
    expect(confirmButton).toBeDefined();

    // Confirm transaction
    await ReactTestRenderer.act(async () => {
      await confirmButton!.props.onPress();
    });

    // Verify confirmVoiceMutation was called with EDITED values
    expect(mockConfirmVoiceMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          expenseId: 'exp-1',
          title: 'Business Lunch with Client',
          amount: 32.5,
          categoryId: 'cat-1',
        },
      }),
    );
  });
});
