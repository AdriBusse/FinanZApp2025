import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import TransactionListItem from '../src/components/molecules/TransactionListItem';

describe('TransactionListItem', () => {
  test('formats integer amount without decimal values', () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <TransactionListItem id="1" title="Test Item" amount={12} currency="EUR" />
      );
    });
    const root = component!.root;
    const textNodes = root.findAll(node => (node.type as any) === 'Text');
    const amountText = textNodes.find(node =>
      String(node.props.children).includes('12')
    );
    expect(amountText).toBeDefined();
    const formatted = Array.isArray(amountText?.props.children)
      ? amountText?.props.children.join('')
      : String(amountText?.props.children);
    expect(formatted).toBe((12).toLocaleString() + ' EUR');
  });

  test('formats decimal amount with decimal values when non-zero', () => {
    let component: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      component = ReactTestRenderer.create(
        <TransactionListItem id="2" title="Decimal Item" amount={12.4} currency="EUR" />
      );
    });
    const root = component!.root;
    const textNodes = root.findAll(node => (node.type as any) === 'Text');
    const amountText = textNodes.find(node =>
      String(node.props.children).includes('12')
    );
    expect(amountText).toBeDefined();
    const formatted = Array.isArray(amountText?.props.children)
      ? amountText?.props.children.join('')
      : String(amountText?.props.children);
    expect(formatted).toBe((12.4).toLocaleString() + ' EUR');
  });
});
