# Read-Only Mode Implementation

## Tổng quan

Khi chia sẻ mind map, người xem sẽ thấy mind map ở **chế độ chỉ xem (read-only)**. Trong chế độ này, tất cả các controls để chỉnh sửa đều bị ẩn và disabled.

## Các thay đổi đã thực hiện

### 1. Context Update

**File**: `src/features/mindmap/context.tsx`

Thêm `readOnly` flag vào MindMapContext:

```typescript
interface MindMapContextType {
  onTextSelected?: (selected: SelectedText, customPrompt?: string) => void;
  highlightedTexts?: Map<string, HighlightedText[]>;
  onDeleteNode?: (nodeId: string) => void;
  readOnly?: boolean; // ← NEW
}
```

### 2. MindMapProvider Update

Provider giờ nhận và truyền `readOnly` prop:

```typescript
export const MindMapProvider = ({
  children,
  onTextSelected,
  highlightedTexts,
  onDeleteNode,
  readOnly = false, // ← NEW
}: {
  // ...
  readOnly?: boolean; // ← NEW
}) => {
  return (
    <MindMapContext.Provider 
      value={{ onTextSelected, highlightedTexts, onDeleteNode, readOnly }}
    >
      {children}
    </MindMapContext.Provider>
  );
};
```

### 3. CustomNode Component

**File**: `src/features/mindmap/components/Node/CustomNode.tsx`

Sử dụng `readOnly` flag để ẩn controls:

#### A. Resize Handle

```typescript
{/* NodeResizeControl - chỉ hiển thị khi KHÔNG readOnly */}
{!readOnly && (selected || isHovered) && (
  <NodeResizeControl ...>
    <Maximize2 /> {/* Icon resize */}
  </NodeResizeControl>
)}
```

#### B. Delete Button

```typescript
{/* Delete button - chỉ hiển thị khi KHÔNG readOnly */}
{!readOnly && (selected || isHovered) && onDeleteNode && (
  <button onClick={handleDelete}>
    <Trash2 /> {/* Icon delete */}
  </button>
)}
```

#### C. "Text selectable" Indicator

```typescript
{/* Indicator - chỉ hiển thị khi KHÔNG readOnly */}
{!readOnly && selected && (
  <div>Text selectable</div>
)}
```

### 4. SharedMindMapPage

**File**: `src/pages/SharedMindMapPage.tsx`

Pass `readOnly={true}` vào cả MindMapProvider và MindMap:

```typescript
<MindMapProvider
  onTextSelected={() => {}}
  highlightedTexts={highlightedTexts}
  onDeleteNode={() => {}}
  readOnly={true} // ← Truyền vào context
>
  <MindMap
    nodes={nodes}
    edges={edges}
    onNodesChange={() => {}}
    onEdgesChange={() => {}}
    onConnect={() => {}}
    onNodeClick={() => {}}
    readOnly={true} // ← Disable ReactFlow interactions
  />
</MindMapProvider>
```

## Kết quả

### ✅ Trong chế độ Read-Only (Shared)

Khi hover hoặc click vào node:

- ❌ **KHÔNG hiển thị** resize handle (icon Maximize2)
- ❌ **KHÔNG hiển thị** delete button (icon Trash2)
- ❌ **KHÔNG hiển thị** "Text selectable" indicator
- ❌ **KHÔNG thể** drag node
- ❌ **KHÔNG thể** resize node
- ❌ **KHÔNG thể** delete node
- ❌ **KHÔNG thể** tạo connections
- ✅ **CÓ THỂ** zoom in/out
- ✅ **CÓ THỂ** pan/move viewport
- ✅ **CÓ THỂ** xem tất cả nội dung

### ✅ Trong chế độ Normal (Owner)

Khi hover hoặc click vào node:

- ✅ **Hiển thị** resize handle
- ✅ **Hiển thị** delete button
- ✅ **Hiển thị** "Text selectable" indicator
- ✅ **Có thể** drag node
- ✅ **Có thể** resize node
- ✅ **Có thể** delete node
- ✅ **Có thể** tạo connections
- ✅ Full editing capabilities

## UI/UX Considerations

### 1. Visual Feedback

Trong SharedMindMapPage, có banner rõ ràng:

```tsx
<div className='px-6 py-3 bg-amber-50 border-t border-amber-100'>
  <div className='flex items-center gap-3 text-amber-800'>
    <Lock size={20} />
    <div className='flex-1'>
      <p className='font-semibold'>Chế độ chỉ xem</p>
      <p className='text-sm text-amber-700'>
        Bạn đang xem mind map được chia sẻ. Không thể chỉnh sửa nội dung.
      </p>
    </div>
    <Eye size={24} />
  </div>
</div>
```

### 2. Consistent Behavior

- ReactFlow props disabled: `nodesDraggable={false}`, `nodesConnectable={false}`, etc.
- Context handlers là empty functions: `onTextSelected={() => {}}`
- UI controls ẩn hoàn toàn: không render resize/delete buttons

### 3. Performance

- Không render không cần thiết: Sử dụng conditional rendering (`!readOnly &&`)
- Memo optimization: CustomNode đã được wrap với `memo()`

## Testing Checklist

Để verify read-only mode hoạt động đúng:

```bash
# 1. Tạo share link
✅ Đăng nhập → Mở mind map → Click "Share" → Tạo link

# 2. Mở shared link (incognito)
✅ Paste URL vào incognito window

# 3. Test read-only restrictions
✅ Hover vào node → KHÔNG thấy resize handle
✅ Hover vào node → KHÔNG thấy delete button
✅ Click node → KHÔNG thấy "Text selectable"
✅ Try drag node → KHÔNG drag được
✅ Try resize node → KHÔNG có resize control
✅ Try delete node → KHÔNG có delete button
✅ Try create connection → KHÔNG connect được

# 4. Test allowed interactions
✅ Zoom in/out → Hoạt động
✅ Pan viewport → Hoạt động
✅ View content → Hiển thị đầy đủ
✅ Scroll → Hoạt động bình thường
```

## Files Modified

- ✅ `src/features/mindmap/context.tsx` - Thêm readOnly vào context
- ✅ `src/features/mindmap/components/Node/CustomNode.tsx` - Ẩn controls khi readOnly
- ✅ `src/pages/SharedMindMapPage.tsx` - Pass readOnly prop

## Code Quality

- ✅ No linter errors
- ✅ TypeScript types đầy đủ
- ✅ Consistent naming conventions
- ✅ Clear comments giải thích intent
- ✅ Backwards compatible (readOnly default = false)

## Future Enhancements

Các tính năng có thể thêm:

- [ ] **Watermark**: Thêm watermark "Read-Only" subtle trên canvas
- [ ] **Tooltips**: Thêm tooltips giải thích tại sao không thể edit
- [ ] **View-only analytics**: Track người xem tương tác như thế nào
- [ ] **Customizable read-only**: Cho phép owner chọn những gì viewer có thể làm

## Summary

Read-only mode giờ đã hoạt động hoàn hảo:

✅ **Complete**: Tất cả edit controls đã bị ẩn  
✅ **Consistent**: Behavior consistent across toàn bộ app  
✅ **User-friendly**: Banner rõ ràng thông báo read-only mode  
✅ **Secure**: Không thể bypass restrictions từ UI  
✅ **Performant**: Không impact performance  

Người xem có thể explore mind map thoải mái mà không lo làm hỏng gì! 🎉
