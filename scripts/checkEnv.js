require('dotenv').config();

console.log('='.repeat(50));
console.log('  環境變數檢查');
console.log('='.repeat(50));
console.log();

console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ 已設定' : '❌ 未設定');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ 已設定' : '❌ 未設定');
console.log('CLIENT_ORIGIN:', process.env.CLIENT_ORIGIN || '未設定 (預設: http://localhost:3000)');
console.log();
console.log('Google OAuth 設定:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? `✅ ${process.env.GOOGLE_CLIENT_ID}` : '❌ 未設定');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? `✅ ${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : '❌ 未設定');
console.log();
console.log('Callback URL 應該設定為:');
console.log('http://localhost:5000/api/auth/google/callback');
console.log();
console.log('請確認以上資訊在 Google Cloud Console 中正確設定');
