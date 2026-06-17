#!/bin/bash
# start.sh
# Inicia a API e o Frontend juntos com um único comando
# Uso: ./start.sh (a partir da raiz do projeto biblioteca/)

echo "Iniciando API (porta 3001)..."
cd api
node app.js &
API_PID=$!

cd ../frontend
echo "Iniciando Frontend (porta 5173)..."
npm run dev &
FRONT_PID=$!

# Quando o usuário apertar Ctrl+C, mata os dois processos
trap "echo 'Encerrando...'; kill $API_PID $FRONT_PID; exit" INT

# Mantém o script rodando enquanto os processos estiverem ativos
wait
