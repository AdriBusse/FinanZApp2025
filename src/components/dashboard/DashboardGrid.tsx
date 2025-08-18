import React, { memo } from 'react';
import { View, FlatList, useWindowDimensions } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';

export type Identifiable = { id: string };

export type DashboardGridProps<T extends Identifiable> = {
  data: T[];
  editMode: boolean;
  horizontalPadding?: number; // parent horizontal padding for width calc
  gutter?: number; // space between columns
  keyExtractor?: (item: T, index: number) => string;
  onDragBegin?: (index: number) => void;
  onDragEnd?: (data: T[]) => void;
  renderTile: (args: {
    item: T;
    index: number;
    isActive: boolean;
    drag: () => void;
  }) => React.ReactElement | null;
};

function DashboardGridInner<T extends Identifiable>(
  props: DashboardGridProps<T>,
) {
  const { width: screenW } = useWindowDimensions();
  const {
    data,
    editMode,
    horizontalPadding = 16,
    gutter = 12,
    keyExtractor,
    onDragBegin,
    onDragEnd,
    renderTile,
  } = props;

  const tileW = Math.floor((screenW - horizontalPadding * 2 - gutter) / 2);

  const defaultKey = (item: T, index: number) => `${item.id}-${index}`;

  if (editMode) {
    return (
      <DraggableFlatList
        data={data}
        keyExtractor={keyExtractor ?? defaultKey}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 12,
        }}
        removeClippedSubviews={false}
        onDragBegin={onDragBegin}
        onDragEnd={({ data: d }) => onDragEnd?.(d as T[])}
        activationDistance={12}
        renderPlaceholder={() => (
          <View
            style={{
              width: tileW,
              height: 96,
              marginRight: gutter,
              marginBottom: 12,
              borderRadius: 12,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: '#60a5fa',
              backgroundColor: 'rgba(59,130,246,0.08)',
            }}
          />
        )}
        renderItem={({
          item,
          getIndex,
          drag,
          isActive,
        }: RenderItemParams<T>) => {
          const idx = getIndex?.() ?? 0;
          return (
            <View
              style={{
                width: tileW,
                marginRight: idx % 2 === 0 ? gutter : 0,
                marginBottom: 12,
              }}
            >
              {renderTile({ item, index: idx, isActive, drag })}
            </View>
          );
        }}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor ?? defaultKey}
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingBottom: 12,
      }}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      renderItem={({ item, index }) => (
        <View style={{ width: '48%' }}>
          {renderTile({ item, index, isActive: false, drag: () => {} })}
        </View>
      )}
    />
  );
}

const DashboardGrid = memo(DashboardGridInner) as typeof DashboardGridInner;
export default DashboardGrid;
