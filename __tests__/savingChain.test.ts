import { getSavingChain } from '../src/utils/savingChain';

const withdrawal = { id: '1', amount: -6000, describtion: 'Withdrawal' };
const first = { id: '2', amount: 1000, parentTransactionId: '1' };
const second = { id: '3', amount: 5000, parentTransactionId: '1' };

test('shows the outstanding balance from any member without including unrelated savings', () => {
  const chain = getSavingChain(first, [
    first,
    withdrawal,
    { id: '4', amount: 9000 },
  ]);
  expect(chain.total).toBe(-5000);
  expect(chain.root).toEqual(withdrawal);
  expect(chain.members).toEqual([withdrawal, first]);
});

test('equalizes a withdrawal with several repayments', () => {
  expect(getSavingChain(second, [withdrawal, first, second]).total).toBe(0);
});

test('recalculates after editing or deleting a repayment', () => {
  expect(
    getSavingChain(withdrawal, [withdrawal, { ...first, amount: 500 }]).total,
  ).toBe(-5500);
  expect(getSavingChain(withdrawal, [withdrawal]).connected).toBe(false);
});

test('rounds decimal balances and treats detached repayments independently', () => {
  expect(
    getSavingChain({ id: '1', amount: -0.3 }, [
      { id: '1', amount: -0.3 },
      { ...first, amount: 0.1 },
      { ...second, amount: 0.2 },
    ]).total,
  ).toBe(0);
  expect(
    getSavingChain({ ...first, parentTransactionId: null }, [
      { ...first, parentTransactionId: null },
      { ...second, parentTransactionId: null },
    ]).total,
  ).toBe(1000);
});

test.each([-5000, 0])(
  'displays chain balance %s first and the original amount in parentheses',
  chainTotal => {
    const React = require('react');
    const renderer = require('react-test-renderer');
    const TransactionListItem =
      require('../src/components/molecules/TransactionListItem').default;
    let component: import('react-test-renderer').ReactTestRenderer;
    renderer.act(() => {
      component = renderer.create(
        React.createElement(TransactionListItem, {
          id: '1',
          title: 'Withdrawal',
          amount: -6000,
          currency: 'EUR',
          chainTotal,
        }),
      );
    });
    const text = component!.root
      .findAll(node => node.type === ('Text' as any))
      .map(node => [node.props.children].flat().join(''))
      .join(' ');
    expect(text).toContain(
      `${chainTotal.toLocaleString()} EUR (${(-6000).toLocaleString()} EUR)`,
    );
  },
);
