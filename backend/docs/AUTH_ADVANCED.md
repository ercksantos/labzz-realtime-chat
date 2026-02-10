# Autenticação Avançada - API Documentation

## 🔐 2FA (Two-Factor Authentication)

### 1. Gerar Secret para 2FA
**Endpoint:** `GET /api/2fa/generate`  
**Auth:** Required (Bearer token)

**Response:**
```json
{
  "status": "success",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,..."
  }
}
```

**Uso:**
1. Usuário autenticado faz o request
2. Backend gera um secret e QR code
3. Usuário escaneia QR code no app de autenticação (Google Authenticator, Authy, etc.)
4. Usuário usa o código gerado para ativar 2FA

---

### 2. Ativar 2FA
**Endpoint:** `POST /api/2fa/enable`  
**Auth:** Required (Bearer token)

**Body:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "2FA enabled successfully"
  }
}
```

---

### 3. Desativar 2FA
**Endpoint:** `POST /api/2fa/disable`  
**Auth:** Required (Bearer token)

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "2FA disabled successfully"
  }
}
```

---

### 4. Login com 2FA (Fluxo Modificado)

**Passo 1:** Login normal
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (se 2FA está habilitado):**
```json
{
  "status": "success",
  "data": {
    "requires2FA": true,
    "userId": "uuid-here",
    "message": "2FA verification required"
  }
}
```

**Passo 2:** Verificar código 2FA
```
POST /api/auth/verify-2fa
{
  "userId": "uuid-here",
  "token": "123456"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

## 🔗 OAuth2 (Google & GitHub)

### Google OAuth

**1. Iniciar autenticação:**
```
GET /api/oauth/google
```
Redireciona para página de login do Google.

**2. Callback (automático):**
```
GET /api/oauth/google/callback?code=...
```
Após login, redireciona para: `{FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...`

---

### GitHub OAuth

**1. Iniciar autenticação:**
```
GET /api/oauth/github
```
Redireciona para página de login do GitHub.

**2. Callback (automático):**
```
GET /api/oauth/github/callback?code=...
```
Após login, redireciona para: `{FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...`

---

## 🔧 Configuração OAuth

### Google OAuth Setup:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API "Google+ API"
4. Crie credenciais OAuth 2.0
5. Configure redirect URI: `http://localhost:4000/api/oauth/google/callback`
6. Adicione as credenciais no `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth Setup:
1. Acesse Settings > Developer settings > OAuth Apps
2. Crie uma nova OAuth App
3. Configure callback URL: `http://localhost:4000/api/oauth/github/callback`
4. Adicione as credenciais no `.env`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

---

## 📝 Notas Importantes

### 2FA:
- O secret é temporário até ser ativado
- Após ativar, o usuário DEVE fornecer código 2FA em todos os logins
- QR code deve ser salvo pelo usuário (não é recuperável)
- Usar app como Google Authenticator, Authy, 1Password, etc.

### OAuth:
- Usuários OAuth não têm senha (campo `password` é `null`)
- Se já existir conta com o email, OAuth é vinculado à conta existente
- Username é gerado automaticamente a partir do email se necessário
- Tokens são retornados via URL query params (implementação básica)

---

## 🧪 Testando

### Testar 2FA localmente:
```bash
# 1. Login e obter token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.accessToken')

# 2. Gerar secret 2FA
curl -X GET http://localhost:4000/api/2fa/generate \
  -H "Authorization: Bearer $TOKEN"

# 3. Ativar 2FA (use código do app)
curl -X POST http://localhost:4000/api/2fa/enable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secret":"SECRET_HERE","token":"123456"}'
```

### Testar OAuth:
Abra no navegador:
- Google: `http://localhost:4000/api/oauth/google`
- GitHub: `http://localhost:4000/api/oauth/github`
