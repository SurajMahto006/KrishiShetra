const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generatePdf() {
  const htmlPath = path.resolve(__dirname, '..', 'krishishetra_dossier.html');
  const pdfPath = path.resolve(__dirname, '..', 'KrishiShetra_Product_Presentation_QA_Dossier.pdf');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  const chromePath = 'C:\\Program Files\\Google\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBinary = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Using browser binary:', browserBinary);
  console.log('Target HTML URL:', fileUrl);
  console.log('Output PDF Path:', pdfPath);

  const port = 9333;
  const browserProcess = spawn(browserBinary, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(__dirname, '..', '.chrome-temp')
  ]);

  // Wait for remote debugging to be ready
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // Retrying
    }
  }

  if (!wsUrl) {
    browserProcess.kill();
    throw new Error('Failed to connect to Chrome DevTools Protocol');
  }

  console.log('Connected to DevTools WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, (res) => {
        if (res.error) reject(new Error(JSON.stringify(res.error)));
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create a new target / page
  const { targetId } = await sendCommand('Target.createTarget', { url: 'about:blank' });
  
  // Attach to target
  const { sessionId } = await sendCommand('Target.attachToTarget', { targetId, flatten: true });

  function sendSessionCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, (res) => {
        if (res.error) reject(new Error(JSON.stringify(res.error)));
        else resolve(res.result);
      });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSessionCommand('Page.enable');
  await sendSessionCommand('Page.navigate', { url: fileUrl });

  // Wait for page load
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Rendering PDF with print background and custom A4 settings...');
  const printResult = await sendSessionCommand('Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27, // A4 width in inches
    paperHeight: 11.69, // A4 height in inches
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
    scale: 0.95
  });

  const buffer = Buffer.from(printResult.data, 'base64');
  fs.writeFileSync(pdfPath, buffer);
  console.log(`Successfully generated PDF (${(buffer.length / 1024).toFixed(1)} KB) at:\n${pdfPath}`);

  ws.close();
  browserProcess.kill();

  // Cleanup temp dir
  try {
    fs.rmSync(path.join(__dirname, '..', '.chrome-temp'), { recursive: true, force: true });
  } catch (e) {}
}

generatePdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
