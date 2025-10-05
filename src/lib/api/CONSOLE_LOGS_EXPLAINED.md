# Console Logs Explained

## 📌 Tóm Tắt Quan Trọng

**Các messages bạn thấy trong console KHÔNG PHẢI là lỗi thực sự!** 

Đây là các **debug logs** được thiết kế để giúp developers (bạn) hiểu được:
- ✅ Request được gửi như thế nào
- ✅ Response trả về như thế nào  
- ✅ Errors được xử lý ra sao
- ✅ Data flow trong app

**Chỉ hiển thị trong Development Mode** (`NODE_ENV=development`)

## 🎯 Các Loại Console Logs

### 1. 🚀 API Request (Thành Công)

Khi bạn submit form, bạn sẽ thấy:

```
🚀 API Request
  Method: POST
  URL: /auth/register
  Body: {
    "email": "user@example.com",
    "displayName": "John Doe",
    "password": "password123",
    "confirmPassword": "password123"
  }
```

**Ý nghĩa:**
- ✅ Request đang được gửi đến server
- ✅ Xem data gửi đi để verify đúng format
- ✅ Check method và URL

**Đây KHÔNG PHẢI là error** - Đây là info log!

---

### 2. ✅ API Response (Thành Công)

Khi server trả về success (200 hoặc 201):

```
✅ API Response
  Method: POST
  URL: /auth/register
  Status: 201 Created
  Data: {
    "statusCode": 201,
    "message": "Đăng ký thành công! Vui lòng kiểm tra email...",
    "data": {
      "email": "user@example.com",
      "message": "Mã OTP đã được gửi..."
    }
  }
```

**Ý nghĩa:**
- ✅ Request thành công!
- ✅ Server đã xử lý và trả về kết quả
- ✅ Xem data nhận được từ server

**Đây KHÔNG PHẢI là error** - Request đã thành công!

---

### 3. ❌ API Response Error (Có Lỗi Từ Server)

Khi server trả về error (400, 401, 500...):

```
❌ API Response Error
  Method: POST
  URL: /auth/register
  Status: 400 Bad Request
  Error Message: Request failed with status code 400
  📦 Response Data:
  {
    "statusCode": 400,
    "message": "Email is existed",
    "data": null
  }
```

**Ý nghĩa:**
- ⚠️ Server trả về error (VD: email đã tồn tại)
- ✅ Log này giúp bạn biết lỗi gì
- ✅ Xem full response từ server để debug

**Đây là debug info** - Giúp bạn hiểu tại sao request failed

---

### 4. 🔍 Parsed Error (Error Được Parse)

Sau khi nhận error, system sẽ parse để extract message:

```
🔍 Parsed Error:
  Status Code: 400
  Message: Email is existed
  Original Data: {
    "statusCode": 400,
    "message": "Email is existed",
    "data": null
  }
```

**Ý nghĩa:**
- ✅ System đã extract được message từ response
- ✅ Status code: 400 (từ response body, không phải HTTP status)
- ✅ Message: "Email is existed" (sẽ hiển thị cho user)

**Đây là processing info** - Cho thấy cách error được xử lý

---

### 5. ⚠️ ApiError (Error Object)

Cuối cùng, error object được throw:

```
ApiError: Email is existed
  at ApiClient.handleError (src/lib/api/client.ts:280:12)
  at <unknown> (src/lib/api/client.ts:194:36)
  ...
```

**Ý nghĩa:**
- ⚠️ Đây là error object được throw để UI catch
- ✅ Message: "Email is existed" 
- ✅ Stack trace để debug nếu cần

**Đây là expected error** - Được catch bởi UI để hiển thị toast

---

## 🎨 Flow Hoàn Chỉnh

### Scenario: Email Đã Tồn Tại

```
1. User clicks "Register" button
   ↓
2. 🚀 API Request
   Method: POST
   URL: /auth/register
   Body: { email: "existing@gmail.com", ... }
   ↓
3. Server processes request
   ↓
4. ❌ API Response Error
   Status: 400 Bad Request
   Data: { "statusCode": 400, "message": "Email is existed", "data": null }
   ↓
5. 🔍 Parsed Error
   Status Code: 400
   Message: Email is existed
   ↓
6. ⚠️ ApiError: Email is existed
   (Error object thrown)
   ↓
7. UI catches error
   ↓
8. 🎯 Toast displays: "❌ Email is existed"
```

**Result:** User thấy toast error rõ ràng!

---

### Scenario: Đăng Ký Thành Công

```
1. User clicks "Register" button
   ↓
2. 🚀 API Request
   Method: POST
   URL: /auth/register
   Body: { email: "newuser@gmail.com", ... }
   ↓
3. Server processes request
   ↓
4. ✅ API Response
   Status: 201 Created
   Data: { "statusCode": 201, "message": "Đăng ký thành công!", ... }
   ↓
5. UI shows success toast
   ↓
6. 🎯 Redirect to /verify-email
```

**Result:** User thấy success message và được redirect!

---

## 🔧 Console Groups

Tất cả logs được group lại để dễ đọc:

```
▼ 🚀 API Request
    Method: POST
    URL: /auth/register
    Body: {...}

▼ ❌ API Response Error
    Method: POST
    URL: /auth/register
    Status: 400 Bad Request
    📦 Response Data: {...}

  🔍 Parsed Error:
    Status Code: 400
    Message: Email is existed
    Original Data: {...}
```

**Click vào ▶️ để collapse/expand groups**

---

## 🎯 Cách Sử Dụng Logs Để Debug

### Case 1: Check Request Data

**Mục đích:** Verify data gửi đi đúng format

1. Tìm `🚀 API Request`
2. Check `Body:`
3. Verify tất cả fields đúng

**Example:**
```
🚀 API Request
  Body: {
    "email": "test@gmail.com",
    "displayName": "Test User",
    "password": "password123",
    "confirmPassword": "password123"  ✅ Đúng!
  }
```

---

### Case 2: Check Server Response

**Mục đích:** Xem server trả về gì

1. Tìm `✅ API Response` hoặc `❌ API Response Error`
2. Check `Data:` hoặc `📦 Response Data:`
3. Xem statusCode và message

**Example:**
```
❌ API Response Error
  Status: 400 Bad Request
  📦 Response Data:
  {
    "statusCode": 400,
    "message": "Email is existed",  ← Server message
    "data": null
  }
```

---

### Case 3: Check Error Parsing

**Mục đích:** Verify error được parse đúng

1. Tìm `🔍 Parsed Error:`
2. Check `Status Code:` và `Message:`
3. Verify message sẽ hiển thị cho user

**Example:**
```
🔍 Parsed Error:
  Status Code: 400
  Message: Email is existed  ← Will show in toast
```

---

## 🚫 Khi Nào Cần Lo Lắng?

### ✅ KHÔNG cần lo lắng khi thấy:

- `🚀 API Request` - Normal request log
- `✅ API Response` - Success response
- `❌ API Response Error` với message rõ ràng - Expected business error
- `🔍 Parsed Error` - Processing info
- `ApiError: Email is existed` - Expected và được handle

### ⚠️ CẦN chú ý khi thấy:

- `Network Error` - Không có internet hoặc API down
- `500 Internal Server Error` - Server có vấn đề
- `Timeout` - Request quá lâu
- Stack trace dài và không rõ ràng

---

## 💡 Tips

### 1. Filter Console Logs

Trong Browser DevTools:
- Filter by level: Chọn "Info", "Warn", "Error"
- Filter by text: Type "API" để chỉ xem API logs
- Use regex: `/API (Request|Response)/`

### 2. Collapse Groups

- Click vào ▶️ để collapse groups không cần xem
- Chỉ expand groups cần debug

### 3. Copy as JSON

- Right-click vào JSON string
- "Copy object" để paste vào JSON formatter

### 4. Clear Console

- Cmd+K (Mac) hoặc Ctrl+L (Windows)
- Clear console trước mỗi test

---

## 🔕 Tắt Logs (Production)

Logs chỉ hiển thị khi `NODE_ENV=development`.

**Trong production:**
```env
NODE_ENV=production
```

**Kết quả:** Không có logs trong console, performance tốt hơn.

---

## 📊 Log Levels Explained

| Icon | Level | Meaning | Action |
|------|-------|---------|--------|
| 🚀 | INFO | Request sent | Normal |
| ✅ | SUCCESS | Response OK | Normal |
| ❌ | ERROR | Server error | Check message |
| 🔍 | DEBUG | Processing | Info |
| 📦 | DATA | Full data | Debug |
| ⚠️ | WARN | Warning | Review |

---

## 🎓 Tóm Tắt

1. **Console logs = Debug tools**, không phải errors thực sự
2. **Grouped logs** giúp dễ đọc và track flow
3. **Error logs** giúp hiểu tại sao request failed
4. **Chỉ trong dev mode** - Production clean
5. **User vẫn thấy toast** - UX không bị ảnh hưởng

---

## ❓ FAQ

**Q: Tại sao có nhiều logs cho 1 request?**  
A: Để track full flow: Request → Response → Parse → Error. Mỗi step 1 log.

**Q: Console đầy logs, có ảnh hưởng performance?**  
A: Không. Chỉ trong dev mode. Production không có logs.

**Q: Làm sao biết request thành công hay failed?**  
A: Xem icon: ✅ = success, ❌ = error. Hoặc check Status code.

**Q: ApiError trong console là bình thường?**  
A: Yes! Nếu là business error (email existed, validation...). UI sẽ catch và show toast.

**Q: Làm sao ẩn logs?**  
A: Set `NODE_ENV=production` hoặc filter console trong DevTools.

---

## 🎉 Kết Luận

**Logs bạn đang thấy hoàn toàn bình thường và có ích!**

Chúng giúp bạn:
- ✅ Debug dễ dàng
- ✅ Hiểu data flow
- ✅ Track errors
- ✅ Verify API integration

Không cần lo lắng về chúng - Đây là công cụ của developers! 🛠️

