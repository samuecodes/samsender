const { ipcRenderer } = require('electron');

document.getElementById('enviar-btn').addEventListener('click', () => {
  const mensagem = document.getElementById('mensagem').value;
  const fileInput = document.getElementById('file-input');

  if (!mensagem.trim()) {
    alert('Digite uma mensagem.');
    return;
  }

  if (!fileInput.files.length) {
    alert('Selecione uma planilha .xlsx.');
    return;
  }
  if (mensagem.includes('Mensagens enviadas com sucesso')) {
    statusGif.src = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHpjNWNhd3BpcHdmN2hsODh6dDVhaWxpNm92azhrZ3Jxa3F2NjVkNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gI0juDbJs3Lrmo5T2T/giphy.gif';
    statusGif.style.display = 'inline';
  }
  const filePath = fileInput.files[0].path;
  ipcRenderer.send('enviar-mensagem', { mensagem, filePath });

  document.getElementById('status').innerText = '⏳ Enviando mensagens...';
});

ipcRenderer.on('status-envio', (_, status) => {
  document.getElementById('status').innerText = status;
});
