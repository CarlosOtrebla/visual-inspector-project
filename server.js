const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4300;
const OUTPUT_FILE = path.join(__dirname, 'inspector-changes.json');

const server = http.createServer((req, res) => {
  // Configuração básica de CORS para permitir requisições do frontend Angular
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Trata requisição de pré-voo (preflight OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Rota para salvar alterações
  if (req.method === 'POST' && req.url === '/api/changes') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const changes = JSON.parse(body);
        
        // Adiciona timestamp local para auditoria
        changes.timestamp = new Date().toISOString();

        // Escreve os dados de alteração de forma amigável no arquivo JSON
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(changes, null, 2), 'utf-8');
        console.log(`[Inspector Bridge] Alterações salvas com sucesso em: ${OUTPUT_FILE}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Alterações registradas com sucesso na ponte local!',
          path: OUTPUT_FILE 
        }));
      } catch (error) {
        console.error('[Inspector Bridge] Erro ao processar alterações:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'JSON inválido recebido.' }));
      }
    });
  } else {
    // Rota padrão ou 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Servidor Ponte do Visual Inspector rodando na porta ${PORT}`);
  console.log(`💾 Salvando alterações em: ${OUTPUT_FILE}`);
  console.log(`=======================================================`);
});
