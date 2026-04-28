#!/usr/bin/env bash
set -e

API="http://localhost:3000"

echo "==> Autenticando..."
TOKEN=$(curl -sf -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp-joalheria.com","password":"Admin@2024"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

AUTH="Authorization: Bearer $TOKEN"

echo "==> Buscando produto PU0025/CTC..."
PRODUCT=$(curl -sf "$API/products?search=PU0025" \
  -H "$AUTH" \
  | python3 -c "
import sys, json
prods = json.load(sys.stdin)
match = next((p for p in prods if p.get('sku','').upper() == 'PU0025/CTC'), None)
if not match:
    match = prods[0] if prods else None
if match:
    print(match['id'] + '|' + match.get('sku','') + '|' + str(match.get('salePrice',0)))
else:
    print('NOT_FOUND')
")
echo "   Produto: $PRODUCT"

if [ "$PRODUCT" = "NOT_FOUND" ]; then
  echo "ERRO: Produto PU0025/CTC nao encontrado. Verifique o SKU no sistema."
  exit 1
fi

PRODUCT_ID=$(echo "$PRODUCT" | cut -d'|' -f1)

echo "==> Buscando vendedor Vinícius..."
VINICIUS_ID=$(curl -sf "$API/users" \
  -H "$AUTH" \
  2>/dev/null | python3 -c "
import sys, json
try:
    users = json.load(sys.stdin)
    match = next((u for u in users if 'Vin' in u.get('name','')), None)
    print(match['id'] if match else 'NOT_FOUND')
except:
    print('NOT_FOUND')
" 2>/dev/null || echo "NOT_FOUND")

# Fallback: usar admin se não encontrar Vinícius
if [ "$VINICIUS_ID" = "NOT_FOUND" ] || [ -z "$VINICIUS_ID" ]; then
  VINICIUS_ID=$(curl -sf "$API/auth/me" -H "$AUTH" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")
  echo "   Vinícius nao encontrado, usando usuario logado: $VINICIUS_ID"
else
  echo "   Vendedor ID: $VINICIUS_ID"
fi

echo "==> Verificando se cliente Sofia Mendes existe..."
CUSTOMER_ID=$(curl -sf "$API/customers?search=Sofia+Mendes" \
  -H "$AUTH" \
  | python3 -c "
import sys, json
customers = json.load(sys.stdin)
match = next((c for c in customers if c.get('cpf') == '10181524406'), None)
if not match:
    match = next((c for c in customers if 'Sofia' in c.get('name','')), None)
print(match['id'] if match else 'NOT_FOUND')
")

if [ "$CUSTOMER_ID" = "NOT_FOUND" ]; then
  echo "==> Criando cliente Sofia Mendes..."
  CUSTOMER_ID=$(curl -sf -X POST "$API/customers" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Sofia Mendes",
      "phone": "81999980049",
      "cpf": "10181524406",
      "email": "sofiambc93@gmail.com",
      "address": "Rua Setubal, 1346, Apt 1001, CEP 51130-010",
      "notes": "Nascimento: 14/12/1993"
    }' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  echo "   Cliente criado: $CUSTOMER_ID"
else
  echo "   Cliente existente: $CUSTOMER_ID"
fi

echo "==> Criando venda..."
SALE=$(curl -sf -X POST "$API/sales" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"$CUSTOMER_ID\",
    \"paymentMethod\": \"DINHEIRO\",
    \"discount\": 400,
    \"data\": \"2026-04-24T12:00:00.000Z\",
    \"notes\": \"Venda a vista. Valor bruto R\$ 3900,00 / liquido R\$ 3500,00. Vendedor: Vinicius.\",
    \"items\": [{
      \"productId\": \"$PRODUCT_ID\",
      \"quantity\": 1,
      \"unitPrice\": 3900
    }]
  }" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'id' in d:
    print('OK|' + d['id'] + '|' + str(d.get('number','')))
else:
    print('ERRO|' + json.dumps(d))
")

STATUS=$(echo "$SALE" | cut -d'|' -f1)
if [ "$STATUS" = "OK" ]; then
  SALE_ID=$(echo "$SALE" | cut -d'|' -f2)
  SALE_NUM=$(echo "$SALE" | cut -d'|' -f3)
  echo ""
  echo "============================================"
  echo "  VENDA CADASTRADA COM SUCESSO!"
  echo "  Numero: #$SALE_NUM"
  echo "  ID: $SALE_ID"
  echo "  Cliente: Sofia Mendes"
  echo "  Produto: PU0025/CTC  x1"
  echo "  Total: R$ 3.500,00"
  echo "  Pagamento: A VISTA (DINHEIRO)"
  echo "============================================"
  echo ""
  echo "==> Gerando PDF..."
  curl -sf "$API/sales/$SALE_ID/pdf" \
    -H "$AUTH" \
    --output "/tmp/venda-$SALE_NUM-sofia-mendes.pdf" \
    && echo "   PDF salvo em: /tmp/venda-$SALE_NUM-sofia-mendes.pdf" \
    || echo "   (PDF nao gerado)"
else
  echo "ERRO ao criar venda: $(echo "$SALE" | cut -d'|' -f2-)"
  exit 1
fi
