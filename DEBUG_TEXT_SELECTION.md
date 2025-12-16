# 🔍 Debug Text Selection Issue

## 🐛 Vấn đề

**User report:** "Khi bôi đen xong, text tự động mất bôi đen luôn"

**Expected:** Selection phải GIỮ lại cho đến khi click ra ngoài

---

## 🎯 Debug Steps

Đã thêm **extensive logging** để track exact flow.

### 1. Reload App

```bash
Cmd/Ctrl + R
```

### 2. Open Console

```bash
F12 → Console tab
```

### 3. Bôi đen text

Select một đoạn text trong node.

### 4. Check Console Logs

Sẽ thấy sequence logs như sau:

---

## 📊 Expected Log Sequence (GOOD)

### ✅ When Selection Works

```javascript
// Step 1: Mouse up sau khi bôi đen
🖱️ MouseUp - Selection check: {
  hasSelection: true,
  rangeCount: 1,
  text: "Machine Learning"
}

✅ Valid selection detected: Machine Learning

✅ Button shown, selection should stay visible

// Step 2: Check after 100ms
🔍 Checking selection after 100ms: {
  hasSelection: true,
  rangeCount: 1,
  text: "Machine Learning"
}

✅ Selection still active

// No click event (user just selected text)
// → Selection stays!
```

**Result:** ✅ Selection GIỮ, button hiển thị

---

## ❌ Bad Log Sequence (BUG)

### ❌ When Selection Disappears

```javascript
// Step 1: Mouse up
🖱️ MouseUp - Selection check: {
  hasSelection: true,
  rangeCount: 1,
  text: "Machine Learning"
}

✅ Valid selection detected: Machine Learning
✅ Button shown, selection should stay visible

// Step 2: Check after 100ms
🔍 Checking selection after 100ms: {
  hasSelection: false,  // ← LOST!
  rangeCount: 0,
  text: ""
}

⚠️ Selection lost! Restoring...
✅ Selection restored  // OR ❌ Failed to restore

// Step 3: Unexpected click event?
👆 Click detected: { ... }
🚪 Click OUTSIDE content - clearing  // ← WHY?
```

**Problem:** Selection bị clear bởi:
1. Click event không mong muốn
2. React Flow clearing selection
3. CSS preventing selection

---

## 🔍 Debug Scenarios

### Scenario 1: Click event fire ngay sau mouseup

**Symptom:**
```javascript
🖱️ MouseUp ...
✅ Button shown
👆 Click detected  // ← Ngay sau đó!
🚪 Click OUTSIDE content - clearing
```

**Cause:** Browser/React Flow fire click ngay sau mouseup

**Fix needed:** Ignore click trong khoảng 200ms sau mouseup

---

### Scenario 2: Selection bị clear bởi CSS

**Symptom:**
```javascript
🖱️ MouseUp - text: "Machine Learning"
✅ Button shown
🔍 Checking after 100ms - text: ""  // ← Lost!
⚠️ Selection lost! Restoring...
❌ Failed to restore
```

**Cause:** CSS `user-select: none` hoặc `pointer-events: none`

**Fix needed:** Check CSS trên contentRef

---

### Scenario 3: React Flow stealing selection

**Symptom:**
```javascript
✅ Valid selection detected
✅ Button shown
// 50ms later...
⚠️ Selection lost! Restoring...
👆 Click detected - inside ReactFlow node
```

**Cause:** React Flow event handlers clear selection

**Fix needed:** Prevent React Flow từ handling events trong content

---

## 🔧 Troubleshooting Steps

### Step 1: Check Console Logs

Bôi đen text → Check logs:

**Question 1:** Selection detected?
```javascript
🖱️ MouseUp - hasSelection: true  // ← Should be true
```
- ❌ If `false`: Selection không được detect → Check CSS
- ✅ If `true`: Proceed to Q2

**Question 2:** Selection stays after 100ms?
```javascript
🔍 Checking selection after 100ms: rangeCount: 1  // ← Should be 1
```
- ❌ If `0`: Selection lost → Check why
- ✅ If `1`: Selection good!

**Question 3:** Có click event không mong muốn?
```javascript
👆 Click detected  // ← Shouldn't fire ngay sau mouseup
```
- ❌ If fires immediately: Click conflict
- ✅ If no click: Good!

---

### Step 2: Check CSS

Inspect element trong node content:

```css
/* Should have these: */
.nodrag {
  user-select: text !important;
  -webkit-user-select: text !important;
  pointer-events: auto !important;
}

/* Should NOT have: */
user-select: none;  /* ← BAD */
pointer-events: none;  /* ← BAD */
```

---

### Step 3: Test Different Scenarios

**Test A: Bôi đen và đợi**
1. Bôi đen text
2. Đợi 3 giây (không click)
3. Check logs: Selection should stay

**Test B: Bôi đen và click ngoài**
1. Bôi đen text
2. Click outside node
3. Check logs: Should see `Click OUTSIDE - clearing`

**Test C: Bôi đen nhanh**
1. Drag nhanh để select
2. Thả chuột ngay
3. Check logs: Selection should be detected

---

## 🎯 Possible Root Causes

### 1. CSS Issue

**Check:**
```javascript
// In console:
const content = document.querySelector('.nodrag');
console.log(getComputedStyle(content).userSelect);
// Should be: "text"
```

**Fix:**
```css
.nodrag {
  user-select: text !important;
}
```

---

### 2. Event Timing

**Check logs for:**
```javascript
🖱️ MouseUp
👆 Click detected  // ← If < 50ms gap: PROBLEM
```

**Fix:** Add debounce to click handler

---

### 3. React Flow Interference

**Check:**
```javascript
// Selection lost immediately after mouseup
⚠️ Selection lost! Restoring...
```

**Fix:** stopPropagation on mouseUp in ContentDisplay

---

### 4. Z-index / Overlay Issue

**Check:** Button có che selection không?

```javascript
// In console:
const button = document.querySelector('[data-add-button]');
console.log(getComputedStyle(button).zIndex);
// Should not be too high
```

---

## 💡 Quick Fixes to Try

### Fix 1: Prevent immediate click clear

```typescript
let lastMouseUpTime = 0;

const handleMouseUp = () => {
  lastMouseUpTime = Date.now();
  // ... existing code
};

const handleClickOutside = () => {
  // Ignore clicks within 200ms of mouseup
  if (Date.now() - lastMouseUpTime < 200) {
    console.log('⏱️ Ignoring click (too soon after mouseup)');
    return;
  }
  // ... existing code
};
```

### Fix 2: Force selection to stay

```typescript
const handleMouseUp = () => {
  // ... detect selection
  
  // Aggressively preserve selection
  const preserveInterval = setInterval(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (savedRangeRef.current) {
        sel?.addRange(savedRangeRef.current.cloneRange());
      }
    }
  }, 50);
  
  // Clear after 1s
  setTimeout(() => clearInterval(preserveInterval), 1000);
};
```

### Fix 3: Prevent React Flow from clearing

```tsx
// In ContentDisplay
<div
  onMouseDown={(e) => e.stopPropagation()}
  onMouseUp={(e) => e.stopPropagation()}
  onMouseMove={(e) => e.stopPropagation()}
>
```

---

## 🚀 Next Steps

### 1. Reproduce Issue

Bôi đen text → Check console → Share logs

### 2. Share Debug Info

Copy paste these logs:
```javascript
🖱️ MouseUp - Selection check: { ... }
🔍 Checking selection after 100ms: { ... }
👆 Click detected: { ... }
```

### 3. Identify Root Cause

Based on logs, determine:
- Selection detected? → Yes/No
- Selection lost when? → Immediately/After 100ms
- Click event fires? → Yes/No/When

### 4. Apply Fix

Based on root cause, apply appropriate fix from above.

---

## 📋 Checklist

- [ ] Console logs enabled
- [ ] Reproduced issue
- [ ] Checked logs for selection detection
- [ ] Checked logs for selection loss
- [ ] Checked logs for click events
- [ ] Inspected CSS user-select
- [ ] Tested with delays
- [ ] Identified root cause
- [ ] Applied fix
- [ ] Verified fix works

---

**Share console logs để tôi giúp debug! 🔍**
