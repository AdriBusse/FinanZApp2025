import React from 'react';
import renderer from 'react-test-renderer';
import { TextInput, ScrollView } from 'react-native';
import EditSavingTransactionSheet from '../src/components/organisms/savings/EditSavingTransactionSheet';
import TransactionListItem from '../src/components/molecules/TransactionListItem';
import FormBottomSheet from '../src/components/FormBottomSheet';
import { getSavingChain } from '../src/utils/savingChain';

test('opens a connected transaction for editing and saves its own ID', async () => {
  const parent = { id: '1', amount: -6000, describtion: 'Withdrawal' };
  const child = {
    id: '2',
    amount: 1000,
    describtion: 'Repayment',
    parentTransactionId: '1',
  };
  const onSelectConnected = jest.fn();
  const onSave = jest.fn().mockResolvedValue(undefined);
  const props = {
    open: true,
    onClose: jest.fn(),
    onSave,
    depotId: '7',
    currency: 'EUR',
    chain: getSavingChain(parent, [parent, child]),
    onSelectConnected,
  };
  let component!: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    component = renderer.create(
      <EditSavingTransactionSheet {...props} transaction={parent} />,
    );
  });
  expect(component.root.findAllByType(ScrollView).length).toBeGreaterThan(0);
  const row = component.root.findByType(TransactionListItem);
  expect(row.props.id).toBe(child.id);
  renderer.act(() => row.props.onPress());
  expect(onSelectConnected).toHaveBeenCalledWith(child);
  await renderer.act(async () => {
    component.update(
      <EditSavingTransactionSheet {...props} transaction={child} />,
    );
  });
  expect(component.root.findByType(TransactionListItem).props.id).toBe(
    parent.id,
  );
  const amountInput = component.root.findAllByType(TextInput)[0];
  renderer.act(() => amountInput.props.onChangeText('1500'));
  await renderer.act(async () => {
    await component.root.findByType(FormBottomSheet).props.onSubmit();
  });
  expect(onSave).toHaveBeenCalledWith({
    id: child.id,
    amount: 1500,
    describtion: 'Repayment',
  });
  renderer.act(() => component.unmount());
});

test('closing or saving the nested editor preserves the underlying parent draft', async () => {
  const parent = { id: '1', amount: -6000, describtion: 'Withdrawal' };
  const child = {
    id: '2',
    amount: 1000,
    describtion: 'Repayment',
    parentTransactionId: '1',
  };
  const chain = getSavingChain(parent, [parent, child]);
  const onSave = jest.fn().mockResolvedValue(undefined);
  function Editors() {
    const [childOpen, setChildOpen] = React.useState(false);
    return (
      <EditSavingTransactionSheet
        open
        onClose={jest.fn()}
        transaction={parent}
        chain={chain}
        depotId="7"
        onSave={onSave}
        onSelectConnected={() => setChildOpen(true)}
        connectedEditor={
          <EditSavingTransactionSheet
            open={childOpen}
            onClose={() => setChildOpen(false)}
            transaction={child}
            chain={chain}
            depotId="7"
            onSave={onSave}
          />
        }
      />
    );
  }
  let component!: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    component = renderer.create(<Editors />);
  });
  const parentEditor = () =>
    component.root.findAllByType(EditSavingTransactionSheet)[0];
  const childEditor = () =>
    component.root.findAllByType(EditSavingTransactionSheet)[1];
  renderer.act(() =>
    parentEditor()
      .findAllByType(TextInput)[1]
      .props.onChangeText('Unsaved parent title'),
  );
  renderer.act(() =>
    parentEditor().findByType(TransactionListItem).props.onPress(),
  );
  expect(childEditor().props.open).toBe(true);
  renderer.act(() => childEditor().props.onClose());
  expect(childEditor().props.open).toBe(false);
  expect(parentEditor().findAllByType(TextInput)[1].props.value).toBe(
    'Unsaved parent title',
  );
  renderer.act(() =>
    parentEditor().findByType(TransactionListItem).props.onPress(),
  );
  renderer.act(() =>
    childEditor().findAllByType(TextInput)[0].props.onChangeText('1500'),
  );
  await renderer.act(async () => {
    await childEditor().findByType(FormBottomSheet).props.onSubmit();
  });
  expect(onSave).toHaveBeenCalledWith({
    id: child.id,
    amount: 1500,
    describtion: 'Repayment',
  });
  expect(childEditor().props.open).toBe(false);
  expect(parentEditor().props.open).toBe(true);
  expect(parentEditor().findAllByType(TextInput)[1].props.value).toBe(
    'Unsaved parent title',
  );
  renderer.act(() => component.unmount());
});
