import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '..', 'dist');

// Aumenta o timeout do teste para 60 segundos
test.setTimeout(60000); 

test('Popup da extensão carrega e exibe o título correto', async () => {
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
    ],
  });

  // --- ESTE É O BLOCO DE CÓDIGO CORRIGIDO (MAIS ROBUSTO) ---
  // 1. Espera pelo "target" do tipo "service_worker". Esta é a forma mais confiável.
  const backgroundTarget = await context.waitForTarget(
    (target) => target.type() === 'service_worker',
    { timeout: 15000 } // Aumentar um pouco o timeout para o CI
  );

  // 2. Pega o service worker a partir desse target.
  const serviceWorker = await backgroundTarget.serviceWorker();

  if (!serviceWorker) {
    throw new Error('Service Worker da extensão não foi encontrado (método robusto).');
  }
  // ---------------------------------------------------------

  const extensionId = serviceWorker.url().split('/')[2];
  const popupUrl = `chrome-extension://${extensionId}/src/popup/popup.html`;
  const popupPage = await context.newPage();
  await popupPage.goto(popupUrl);

  const headerTitle = await popupPage.locator('header h1').textContent();
  expect(headerTitle).toBe('Task Manager');

  await expect(popupPage.locator('#task-form')).toBeVisible();
  await expect(popupPage.locator('button[type="submit"]')).toHaveText('Adicionar Tarefa');

  await context.close();
});
