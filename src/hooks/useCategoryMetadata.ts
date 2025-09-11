import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { CATEGORY_METADATA_QUERY } from '../graphql/categories';

export type IconMeta = { icon: string; label?: string; keyword?: string };

export const useCategoryMetadata = () => {
  const q = useQuery(CATEGORY_METADATA_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const colors: string[] = useMemo(() => {
    const list = q.data?.categoryMetadata?.colors ?? [];
    return Array.isArray(list)
      ? list.map((c: any) => c?.hex).filter(Boolean)
      : [];
  }, [q.data]);

  const icons: IconMeta[] = useMemo(() => {
    const list = q.data?.categoryMetadata?.icons ?? [];
    return Array.isArray(list)
      ? list
          .map((i: any) => ({
            icon: i?.icon,
            label: i?.label ?? undefined,
            keyword: i?.keyword ?? undefined,
          }))
          .filter(x => !!x.icon)
      : [];
  }, [q.data]);

  return { ...q, colors, icons } as const;
};
