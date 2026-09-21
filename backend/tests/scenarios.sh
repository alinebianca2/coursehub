#!/usr/bin/env bash
# Testes manuais/roteirizados da Etapa 8 (seção 16 do enunciado).
#
# Pré-requisitos:
#   - API rodando em http://localhost:3333 (npm run dev)
#   - Banco no estado do seed (npm run prisma:seed)
#
# Uso: ./tests/scenarios.sh

set -u
BASE="${BASE_URL:-http://localhost:3333}"
PASS=0
FAIL=0

check() {
  local desc="$1"; local expected="$2"; shift 2
  local code
  code=$(curl -s -o /tmp/scenario-body.json -w "%{http_code}" "$@")
  if [ "$code" == "$expected" ]; then
    echo "OK   [$code] $desc"
    PASS=$((PASS + 1))
  else
    echo "FAIL [esperado $expected, obteve $code] $desc"
    cat /tmp/scenario-body.json
    echo
    FAIL=$((FAIL + 1))
  fi
}

json_field() {
  node -e "process.stdin.on('data', d => { try { console.log(JSON.parse(d)['$1']) } catch { console.log('') } })"
}

echo "=== Login dos 3 perfis ==="
ADMIN_TOKEN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@coursehub.com","password":"Demo@123"}' | json_field token)
OP_TOKEN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"operator@coursehub.com","password":"Demo@123"}' | json_field token)
CLIENT_TOKEN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"client@coursehub.com","password":"Demo@123"}' | json_field token)
CLIENT_ID=$(curl -s "$BASE/auth/me" -H "Authorization: Bearer $CLIENT_TOKEN" | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).user.id))")

[ -n "$ADMIN_TOKEN" ] && [ -n "$OP_TOKEN" ] && [ -n "$CLIENT_TOKEN" ] && echo "OK   tokens obtidos" && PASS=$((PASS + 1)) || { echo "FAIL login inicial"; FAIL=$((FAIL + 1)); }

echo
echo "=== Cenários ADMIN ==="
check "ADMIN lista usuários" 200 "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN"
NEW_ID=$(curl -s -X POST "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Usuario Etapa8","email":"etapa8@coursehub.com","password":"Senha123","role":"CLIENT"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).id))")
check "ADMIN cria usuário" 201 -X POST "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Outro Etapa8","email":"etapa8b@coursehub.com","password":"Senha123","role":"CLIENT"}'
check "ADMIN consulta usuário criado" 200 "$BASE/users/$NEW_ID" -H "Authorization: Bearer $ADMIN_TOKEN"
check "ADMIN edita usuário criado" 200 -X PUT "$BASE/users/$NEW_ID" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Usuario Etapa8 Editado"}'
check "ADMIN exclui usuário criado" 204 -X DELETE "$BASE/users/$NEW_ID" -H "Authorization: Bearer $ADMIN_TOKEN"

echo
echo "=== Cenários OPERATOR ==="
check "OPERATOR lista usuários" 200 "$BASE/users" -H "Authorization: Bearer $OP_TOKEN"
check "OPERATOR consulta usuário" 200 "$BASE/users/$CLIENT_ID" -H "Authorization: Bearer $OP_TOKEN"
check "OPERATOR edita usuário" 200 -X PUT "$BASE/users/$CLIENT_ID" -H "Authorization: Bearer $OP_TOKEN" -H "Content-Type: application/json" -d '{"name":"Cliente"}'
check "OPERATOR tenta excluir -> 403" 403 -X DELETE "$BASE/users/$CLIENT_ID" -H "Authorization: Bearer $OP_TOKEN"

echo
echo "=== Cenários CLIENT ==="
check "CLIENT consulta o próprio usuário" 200 "$BASE/users/$CLIENT_ID" -H "Authorization: Bearer $CLIENT_TOKEN"
check "CLIENT tenta consultar outro -> 403" 403 "$BASE/users/1" -H "Authorization: Bearer $CLIENT_TOKEN"
check "CLIENT tenta listar -> 403" 403 "$BASE/users" -H "Authorization: Bearer $CLIENT_TOKEN"
check "CLIENT tenta excluir -> 403" 403 -X DELETE "$BASE/users/$CLIENT_ID" -H "Authorization: Bearer $CLIENT_TOKEN"

echo
echo "=== Não autenticado ==="
check "Acesso sem token -> 401" 401 "$BASE/users"

echo
echo "=== Outros casos de erro ==="
check "Senha incorreta -> 401" 401 -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@coursehub.com","password":"errada"}'
check "Token inválido -> 401" 401 "$BASE/users" -H "Authorization: Bearer token.invalido.aqui"
EXPIRED=$(node -e "
require('dotenv').config();
const jwt = require('jsonwebtoken');
console.log(jwt.sign({ sub: 1, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1s' }));
")
sleep 2
check "Token expirado -> 401" 401 "$BASE/users" -H "Authorization: Bearer $EXPIRED"
check "Usuário inexistente -> 404" 404 "$BASE/users/999999" -H "Authorization: Bearer $ADMIN_TOKEN"
check "E-mail duplicado -> 409" 409 -X POST "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"Duplicado","email":"admin@coursehub.com","password":"Senha123","role":"CLIENT"}'
check "Dados inválidos -> 400" 400 -X POST "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name":"A","email":"invalido","password":"123","role":"CLIENT"}'

echo
echo "=== Limpeza ==="
curl -s -X DELETE "$BASE/users/$(curl -s "$BASE/users" -H "Authorization: Bearer $ADMIN_TOKEN" | node -e "process.stdin.on('data',d=>{const u=JSON.parse(d).find(x=>x.email==='etapa8b@coursehub.com');console.log(u?u.id:'')})")" -H "Authorization: Bearer $ADMIN_TOKEN" -o /dev/null

echo
echo "=================================="
echo "Resultado: $PASS passaram, $FAIL falharam"
echo "=================================="
[ "$FAIL" -eq 0 ]
