export interface ChainTransaction {
  id: string;
  amount: number;
  describtion?: string;
  createdAt?: string;
  parentTransactionId?: string | null;
}

export function getSavingChain(
  transaction: ChainTransaction,
  transactions: ChainTransaction[],
) {
  const rootId = transaction.parentTransactionId ?? transaction.id;
  const members = transactions.filter(
    t => t.id === rootId || t.parentTransactionId === rootId,
  );
  members.sort((a, b) =>
    a.id === rootId
      ? -1
      : b.id === rootId
      ? 1
      : (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
  );
  return {
    root: members.find(t => t.id === rootId),
    members,
    total:
      Math.round(members.reduce((sum, t) => sum + t.amount, 0) * 100) / 100,
    connected: members.length > 1,
  };
}
