const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const venom = require('venom-bot');
const xlsx = require('xlsx');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('enviar-mensagem', async (event, { mensagem, filePath }) => {
  if (!filePath) {
    event.reply('status-envio', '❌ Nenhum arquivo selecionado.');
    return;
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const contatos = xlsx.utils.sheet_to_json(sheet);

    event.reply('status-envio', 'Iniciando sessão no WhatsApp...');
    const client = await venom.create({
      session: 'samsender-session',
      multidevice: true,
      headless: false,
    });

    const delayMin = 3000;
    const delayMax = 6000;
    const tempoEstimado = Math.ceil((contatos.length * ((delayMin + delayMax) / 2)) / 1000);

    event.reply('status-envio', `✅ Sessão iniciada. Enviando ${contatos.length} mensagens...\n⏳ Tempo estimado: ~${tempoEstimado}s`);

    for (const contato of contatos) {
      const telefoneRaw = contato.telefone || contato.Telefone;
      const nome = contato.nome || contato.Nome || '';
      if (!telefoneRaw) continue;

      const telefone = telefoneRaw.toString().replace(/\D/g, '');
      const mensagemFinal = mensagem.replace(/\$nome/gi, nome);

      try {
        await client.sendText(`${telefone}@c.us`, mensagemFinal);
        console.log(`✅ Mensagem enviada para ${telefone}`);
      } catch (err) {
        console.error(`❌ Erro ao enviar para ${telefone}:`, err.message);
      }

      const delay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
      await new Promise((r) => setTimeout(r, delay));
    }

    event.reply('status-envio', `✅ Mensagens enviadas com sucesso.`) ;

  } catch (err) {
    event.reply('status-envio', `❌ Erro ao enviar mensagens: ${err.message}`);
  }
});
