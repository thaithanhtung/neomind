# 🚨 Quick Fix - User Registration Error

## Vấn đề
```
Error: "Database error saving new user"
```

## Nguyên nhân
RLS policy block trigger tạo user profile.

---

## ✅ Cách fix (1 phút)

### Bước 1: Chạy migration

```bash
./scripts/fix-user-registration.sh
```

Hoặc manual:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/006_fix_user_profile_trigger.sql
```

### Bước 2: Test

1. Logout
2. Đăng ký user mới
3. ✅ Không còn error!

---

## 🔍 Chi tiết

Xem full documentation: [FIX_USER_REGISTRATION.md](./FIX_USER_REGISTRATION.md)

---

## 📋 Checklist

- [ ] Chạy migration
- [ ] Test đăng ký user mới
- [ ] Verify profile được tạo

---

## ❓ Vẫn lỗi?

1. Check migration chạy thành công:
   ```bash
   psql "$SUPABASE_DB_URL" -c "SELECT proname, prosecdef FROM pg_proc WHERE proname = 'create_user_profile';"
   ```

2. Xem logs trong Supabase Dashboard:
   - Database > Logs
   - Tìm "create_user_profile"

3. Liên hệ nếu cần support!

---

**Ready to use! 🚀**
