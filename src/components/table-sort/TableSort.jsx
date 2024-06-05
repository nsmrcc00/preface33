import { useState, useMemo } from 'react';

const useSortableData = (items, config = { key: null, direction: 'asc' }) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aKey = sortConfig.key.split('.').reduce((o, i) => o[i], a);
        const bKey = sortConfig.key.split('.').reduce((o, i) => o[i], b);
        if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

export default useSortableData;
