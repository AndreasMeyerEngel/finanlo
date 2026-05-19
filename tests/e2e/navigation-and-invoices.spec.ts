import { expect, test } from '@playwright/test';

test('sidebar is consolidated under transactions on desktop', async ({ page, isMobile }) => {
  await page.goto('/');

  if (isMobile) {
    await expect(page.getByRole('navigation').last()).toContainText('Transações');
    return;
  }

  const sidebar = page.locator('aside');
  await expect(sidebar.getByRole('button', { name: 'Transações' })).toBeVisible();
  await expect(sidebar.getByRole('button', { name: 'Lançamentos' })).toHaveCount(0);
  await expect(sidebar.getByRole('button', { name: 'Gastos Diários' })).toHaveCount(0);
  await expect(sidebar.getByRole('button', { name: 'Despesas' })).toHaveCount(0);
});

test('card invoice appears on invoices page and not as a debt', async ({ page, isMobile }) => {
  await page.goto('/');

  const openPage = async (name: string) => {
    if (isMobile) {
      await page.getByRole('navigation').last().getByRole('button', { name }).click({ force: true });
      return;
    }

    await page.locator('aside').getByRole('button', { name }).click();
  };

  await openPage('Faturas');
  await expect(page.getByRole('heading', { name: 'Faturas mensais' })).toBeVisible();
  await expect(page.locator('td', { hasText: 'Cartão Teste' }).first()).toBeVisible();
  await expect(page.getByText('Compra Teste Cartão')).toBeVisible();

  await openPage(isMobile ? 'Dívidas' : 'Gestão de Dívidas');
  await expect(page.getByRole('heading', { name: 'Lista de dívidas' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Dívida Teste' })).toBeVisible();
  await expect(page.getByText('Compra Teste Cartão')).toHaveCount(0);
  await expect(page.getByText('Cartão Teste')).toHaveCount(0);
});
