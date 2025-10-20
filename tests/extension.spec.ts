import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, '..', 'dist');

// AUMENTAMOS O TIMEOUT DO TESTE PARA 60 SEGUNDOS
test.setTimeout(60000); 

test('Popup da extensão carrega e exibe o título correto', async () => {
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
    ],
  });

  // --- CÓDIGO MAIS ROBUSTO PARA ENCONTRAR O SERVICE WORKER ---
  // 1. Primeiro, tentamos encontrar o service worker se ele JÁ estiver rodando.
  let serviceWorker = context.serviceWorkers().find(sw => sw.url().startsWith('chrome-extension://'));

  // 2. Se ele ainda não apareceu (for undefined), NÓS ESPERAMOS por ele (com um timeout de 10s).
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 10000 });
  }
  // ---------------------------------------------------------

  if (!serviceWorker) {
    throw new Error('Service Worker da extensão não foi encontrado. Verifique src/background/background.js por erros.');
  }

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