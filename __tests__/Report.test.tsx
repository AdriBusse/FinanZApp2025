import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Report from '../src/screens/Report';

// Mock useExpenses hook
jest.mock('../src/hooks/useExpenses', () => ({
  useExpenses: () => ({
    expensesQuery: {
      data: {
        getExpenses: [
          {
            id: 'exp-1',
            title: 'July Spending',
            currency: 'EUR',
            createdAt: '2026-07-01T10:00:00Z',
            transactions: [
              {
                id: 'tx-1',
                amount: 158.71,
                createdAt: '2026-07-05T12:00:00Z',
                describtion: 'Grocery shopping',
                category: { id: 'c-1', name: 'Grocery' },
              },
              {
                id: 'tx-2',
                amount: 143.23,
                createdAt: '2026-07-10T14:00:00Z',
                describtion: 'Dinner',
                category: { id: 'c-2', name: 'Restaurants' },
              },
            ],
          },
          {
            id: 'exp-2',
            title: 'June Spending',
            currency: 'EUR',
            createdAt: '2026-06-01T10:00:00Z',
            transactions: [],
          },
        ],
      },
      loading: false,
    },
  }),
}));

describe('Report Screen', () => {
  test('renders default newest expense title and donut chart view', () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(<Report />);
    });
    const root = component!.root;
    const textNodes = root.findAll(node => (node.type as any) === 'Text');
    const textContents = textNodes.map(n =>
      Array.isArray(n.props.children)
        ? n.props.children.join('')
        : String(n.props.children),
    );

    // Check title of default selected expense (newest one: July Spending)
    expect(textContents.some(t => t.includes('July Spending'))).toBe(true);

    // Check category names in breakdown
    expect(textContents.some(t => t.includes('Grocery'))).toBe(true);
    expect(textContents.some(t => t.includes('Restaurants'))).toBe(true);
  });
});
