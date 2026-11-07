import type { Category, CategoryNode } from '../../core/models/category.model';

/**
 * Builds a hierarchical tree from a flat list of categories.
 * Expects categories sorted by name (or any order — will re-sort children alphabetically).
 */
export function buildCategoryTree(cats: Category[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();

  // First pass: create all nodes
  for (const cat of cats) {
    map.set(cat.id, { ...cat, children: [], depth: 0, path: cat.name });
  }

  const roots: CategoryNode[] = [];

  // Second pass: assign children and depths
  for (const node of map.values()) {
    if (node.parent_id != null && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Third pass: compute depth and path recursively
  function enrich(node: CategoryNode, depth: number, parentPath: string) {
    node.depth = depth;
    node.path = parentPath ? `${parentPath} > ${node.name}` : node.name;
    // Sort children alphabetically
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    for (const child of node.children) {
      enrich(child, depth + 1, node.path);
    }
  }

  roots.sort((a, b) => a.name.localeCompare(b.name));
  for (const root of roots) {
    enrich(root, 0, '');
  }

  return roots;
}

/**
 * Flattens a tree in depth-first order (for rendering in a list with indentation).
 */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  function walk(list: CategoryNode[]) {
    for (const node of list) {
      result.push(node);
      if (node.children.length) walk(node.children);
    }
  }
  walk(nodes);
  return result;
}

/**
 * Returns the IDs of all descendants of a given category (not including itself).
 */
export function getDescendantIds(categoryId: number, allCats: Category[]): number[] {
  const ids: number[] = [];
  const queue = [categoryId];
  while (queue.length) {
    const current = queue.shift()!;
    const children = allCats.filter(c => c.parent_id === current);
    for (const child of children) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

/**
 * Returns all category IDs that belong to the subtree rooted at categoryId
 * (including categoryId itself).
 */
export function getSubtreeIds(categoryId: number, allCats: Category[]): number[] {
  return [categoryId, ...getDescendantIds(categoryId, allCats)];
}

