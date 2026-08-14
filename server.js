const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 4300;
const OUTPUT_FILE = path.join(__dirname, 'inspector-changes.json');

/**
 * Configura os cabeçalhos de CORS nas respostas HTTP para permitir acesso do frontend.
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Envia uma resposta JSON padronizada com código de status HTTP especificável.
 */
function sendJsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

/**
 * Trata o recebimento de requisições POST para salvar alterações do inspetor visual.
 */
async function handleSaveChanges(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const changes = JSON.parse(body);
      changes.timestamp = new Date().toISOString();

      // Gravação assíncrona para não bloquear o Event Loop do Node.js
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(changes, null, 2), 'utf-8');
      console.log(`[Inspector Bridge] Alterações salvas com sucesso em: ${OUTPUT_FILE}`);

      sendJsonResponse(res, 200, {
        success: true,
        message: 'Alterações registradas com sucesso na ponte local!',
        path: OUTPUT_FILE
      });
    } catch (error) {
      console.error('[Inspector Bridge] Erro ao processar alterações:', error);
      sendJsonResponse(res, 400, {
        success: false,
        error: 'JSON inválido recebido no payload.'
      });
    }
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  // Trata requisição de pré-voo (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Rota para salvamento das alterações
  if (req.method === 'POST' && req.url === '/api/changes') {
    await handleSaveChanges(req, res);
  } else {
    sendJsonResponse(res, 404, { error: 'Endpoint não encontrado.' });
  }
});

server.listen(PORT, () => {
  console.log('=======================================================');
  console.log(`🚀 Servidor Ponte do Visual Inspector rodando na porta ${PORT}`);
  console.log(`💾 Salvando alterações em: ${OUTPUT_FILE}`);
  console.log('=======================================================');
});
