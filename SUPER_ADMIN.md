-- Thay email của bạn vào đây
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'thajcaca@gmail.com'
);

-- Verify
SELECT u.email, p.role, p.ai_model 
FROM auth.users u
JOIN user_profiles p ON p.user_id = u.id
WHERE p.role = 'super_admin';