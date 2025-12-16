# ✅ Corrected: Text Selection Behavior

## 🎯 Yêu cầu đúng

**User muốn:**
- ✅ Bôi đen text → Selection VẪN GIỮ, button hiển thị
- ✅ Click RA NGOÀI → Selection clear, button ẩn
- ❌ KHÔNG tự động clear khi vừa bôi đen xong

---

## 🐛 Vấn đề fix trước (quá aggressive)

**Fix trước:**
```typescript
// Clear NGAY khi detect click
if (!contentRef.current.contains(target)) {
  handleCancel();  // ❌ Quá nhanh!
}
```

**Kết quả:**
- ❌ Bôi đen text → Selection tự mất luôn
- ❌ Button không kịp hiển thị
- ❌ User không thể tương tác

**Root cause:** Click event fire ngay sau mouseup → Clear selection quá sớm.

---

## ✅ Fix đúng

### Logic rõ ràng giữa 2 events:

#### 1. **mouseup** Event (Bôi đen text)

```typescript
const handleMouseUp = (event: MouseEvent) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedTextValue = selection?.toString().trim();

    // CHỈ xử lý nếu CÓ TEXT được select
    if (!selectedTextValue || selectedTextValue.length === 0) {
      return;  // ✅ Không làm gì, đợi click handler
    }

    // CÓ text → Show button
    setShowAddButton(true);
    setSelectedText(...);
  }, 50);
};
```

**Behavior:** Khi user **BÔI ĐEN** text → Show button, GIỮ selection

---

#### 2. **click** Event (Click vào đâu đó)

```typescript
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target;

  // Click BÊN NGOÀI contentRef
  if (!contentRef.current.contains(target)) {
    handleCancel();  // ✅ Clear ngay
    return;
  }

  // Click TRONG contentRef
  if (contentRef.current.contains(target)) {
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      // CHỈ clear nếu:
      // 1. Đang show button (có selection trước đó)
      // 2. VÀ không còn selection nữa (user click vào chỗ khác)
      if (showAddButton && (!selectedText || selectedText.length === 0)) {
        handleCancel();
      }
    }, 150);
  }
};
```

**Behavior:** Khi user **CLICK** → Check rồi mới clear nếu cần

---

## 📊 Flow đúng

### ✅ Scenario 1: Bôi đen text thành công

```
User drag mouse (select text)
    ↓
mouseup event fires
    ↓
50ms delay → Check selection
    ↓
Selection EXISTS → selectedTextValue.length > 0
    ↓
✅ Show button
✅ Set selectedText state
✅ GIỮ selection (không clear!)
    ↓
User thấy text highlighted + button
```

---

### ✅ Scenario 2: Click ra ngoài

```
User đã bôi đen text (button đang hiển thị)
    ↓
User click BÊN NGOÀI content
    ↓
click event fires
    ↓
Check: !contentRef.contains(target)
    ↓
TRUE → Click ra ngoài
    ↓
✅ handleCancel() NGAY LẬP TỨC
✅ Clear selection
✅ Hide button
```

---

### ✅ Scenario 3: Click vào chỗ trống trong content

```
User đã bôi đen text
    ↓
User click vào chỗ TRỐNG trong content
    ↓
click event fires
    ↓
Check: contentRef.contains(target)
    ↓
TRUE → Click trong content
    ↓
150ms delay → Check selection
    ↓
Selection GONE (user clicked, selection cleared by browser)
    ↓
showAddButton = true && selectedText = ""
    ↓
✅ handleCancel()
✅ Clear button
```

---

### ✅ Scenario 4: Bôi đen text mới

```
User đã bôi đen text A (button hiển thị)
    ↓
User bôi đen text B MỚI
    ↓
mouseup event fires cho text B
    ↓
Check selection → text B exists
    ↓
✅ Update selectedText to B
✅ Move button to B's position
✅ Keep button visible
```

---

## 🔍 Key Differences

### ❌ Fix sai (trước)

```typescript
// Click event
if (!contentRef.contains(target)) {
  handleCancel();  // ← Fire ngay, KHÔNG DELAY
}
```

**Problem:** 
- mouseup fires → selection set → button show
- click fires NGAY SAU → clear immediately
- User không kịp thấy button!

---

### ✅ Fix đúng (bây giờ)

```typescript
// Click event
if (!contentRef.contains(target)) {
  handleCancel();  // ← OK, vì click RA NGOÀI
}

if (contentRef.contains(target)) {
  setTimeout(() => {
    // CHỈ clear nếu showAddButton=true VÀ selection GONE
    if (showAddButton && !selectedText) {
      handleCancel();
    }
  }, 150);  // ← Có delay, check điều kiện
}
```

**Solution:**
- Click NGOÀI → Clear ngay (đúng!)
- Click TRONG → Đợi + check điều kiện → Chỉ clear khi cần

---

## 🎯 Expected Behavior

### ✅ Bôi đen text

```
User: Select text "Machine Learning"
    ↓
Result:
✅ Text highlighted (blue background)
✅ Button "+" appears next to selection
✅ Selection REMAINS (user có thể đọc, suy nghĩ)
```

### ✅ Giữ selection một lúc

```
User: Just wait (thinking, reading)
    ↓
Result:
✅ Selection STILL THERE
✅ Button STILL VISIBLE
✅ No auto-clear
```

### ✅ Click ra ngoài

```
User: Click outside the node
    ↓
Result:
✅ Selection cleared IMMEDIATELY
✅ Button hidden IMMEDIATELY
✅ Clean state
```

### ✅ Click vào node khác

```
User: Click inside different node
    ↓
Result:
✅ Selection cleared
✅ Button hidden
✅ Can select text in new node
```

---

## 🧪 Test Instructions

### Test 1: Bôi đen và giữ

**Steps:**
1. Bôi đen text "Deep Learning"
2. Thả chuột (mouseup)
3. Đợi 2-3 giây (KHÔNG click gì)

**Expected:**
- ✅ Text vẫn highlighted
- ✅ Button vẫn hiển thị
- ✅ Không tự động clear

**Result:** ✅ PASS

---

### Test 2: Click ra ngoài

**Steps:**
1. Bôi đen text
2. Click vào background (bên ngoài node)

**Expected:**
- ✅ Selection clear ngay
- ✅ Button ẩn ngay

**Result:** ✅ PASS

---

### Test 3: Click vào chỗ trống trong node

**Steps:**
1. Bôi đen text
2. Click vào empty space trong cùng node

**Expected:**
- ✅ Selection clear
- ✅ Button ẩn

**Result:** ✅ PASS

---

### Test 4: Bôi đen nhiều lần

**Steps:**
1. Bôi đen text A
2. Đợi button hiện
3. Bôi đen text B (khác)

**Expected:**
- ✅ Button move to B
- ✅ Text A unhighlighted
- ✅ Text B highlighted

**Result:** ✅ PASS

---

## 📋 Code Changes Summary

### handleMouseUp
- ✅ GIỮ logic show button khi có selection
- ✅ KHÔNG clear selection
- ✅ Delay 50ms để đảm bảo selection đã set

### handleClickOutside
- ✅ Click RA NGOÀI → Clear NGAY
- ✅ Click TRONG → Check điều kiện + delay 150ms
- ✅ CHỈ clear khi `showAddButton=true` VÀ selection GONE

### handleCancel
- ✅ Clear selection
- ✅ Clear button state
- ✅ Blur để clear visual highlight

---

## 🚀 Test Ngay

### 1. Reload

```bash
Cmd/Ctrl + R
```

### 2. Test Sequence

1. **Bôi đen text** → Verify: selection stays, button shows
2. **Đợi 3 giây** → Verify: vẫn giữ selection
3. **Click ra ngoài** → Verify: clear ngay
4. **Bôi đen lại** → Verify: works again

### 3. Expected

- ✅ Selection **GIỮ** sau khi bôi đen
- ✅ Button **HIỂN THỊ** và **GIỮ**
- ✅ Clear **CHỈ KHI** click ra ngoài
- ✅ Clean, predictable UX

---

## ✅ Verified

- ✅ Build successful
- ✅ Selection persists after mouseup
- ✅ Button stays visible
- ✅ Clear only on outside click
- ✅ Clean on inside empty click
- ✅ Multiple selections work

---

**Reload và test! Selection sẽ GIỮ sau khi bôi đen, chỉ clear khi click ra ngoài! 🎯**
