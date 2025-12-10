/**
 * Utility functions để quản lý tags cho mind maps
 */

const TAGS_STORAGE_KEY = 'neomind_mindmap_tags';

export interface MindMapTags {
  [mindMapId: string]: string[];
}

/**
 * Lấy tất cả tags của tất cả mind maps
 */
export const getAllTags = (): MindMapTags => {
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading tags:', error);
    return {};
  }
};

/**
 * Lấy tags của một mind map cụ thể
 */
export const getTagsForMindMap = (mindMapId: string): string[] => {
  const allTags = getAllTags();
  return allTags[mindMapId] || [];
};

/**
 * Lưu tags cho một mind map
 */
export const saveTagsForMindMap = (mindMapId: string, tags: string[]): void => {
  try {
    const allTags = getAllTags();
    allTags[mindMapId] = tags.filter((tag) => tag.trim().length > 0);
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(allTags));
  } catch (error) {
    console.error('Error saving tags:', error);
  }
};

/**
 * Thêm tag vào mind map
 */
export const addTagToMindMap = (mindMapId: string, tag: string): void => {
  const tags = getTagsForMindMap(mindMapId);
  const trimmedTag = tag.trim().toLowerCase();
  if (trimmedTag && !tags.includes(trimmedTag)) {
    tags.push(trimmedTag);
    saveTagsForMindMap(mindMapId, tags);
  }
};

/**
 * Xóa tag khỏi mind map
 */
export const removeTagFromMindMap = (mindMapId: string, tag: string): void => {
  const tags = getTagsForMindMap(mindMapId);
  const filteredTags = tags.filter((t) => t !== tag);
  saveTagsForMindMap(mindMapId, filteredTags);
};

/**
 * Xóa tất cả tags của một mind map
 */
export const clearTagsForMindMap = (mindMapId: string): void => {
  const allTags = getAllTags();
  delete allTags[mindMapId];
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(allTags));
};

/**
 * Lấy tất cả tags unique từ tất cả mind maps
 */
export const getAllUniqueTags = (): string[] => {
  const allTags = getAllTags();
  const uniqueTags = new Set<string>();
  Object.values(allTags).forEach((tags) => {
    tags.forEach((tag) => uniqueTags.add(tag));
  });
  return Array.from(uniqueTags).sort();
};

/**
 * Tìm mind maps theo tag
 */
export const getMindMapsByTag = (tag: string): string[] => {
  const allTags = getAllTags();
  const mindMapIds: string[] = [];
  Object.entries(allTags).forEach(([mindMapId, tags]) => {
    if (tags.includes(tag)) {
      mindMapIds.push(mindMapId);
    }
  });
  return mindMapIds;
};
