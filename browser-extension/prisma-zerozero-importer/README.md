# Prisma ZeroZero Importer

Extensão local para Chrome/Edge que permite ao Prisma Workspace ler plantéis do ZeroZero usando o browser do próprio utilizador.

Não usa Browserless, proxies pagos ou serviços externos.

## Instalar no Microsoft Edge

1. Abre \`edge://extensions\`.
2. Ativa **Developer mode / Modo de programador**.
3. Carrega em **Load unpacked / Carregar descompactada**.
4. Seleciona esta pasta:
   \`browser-extension/prisma-zerozero-importer\`
5. Recarrega a página do Prisma Workspace.

## Instalar no Chrome

1. Abre \`chrome://extensions\`.
2. Ativa **Developer mode**.
3. Carrega em **Load unpacked**.
4. Seleciona esta pasta.
5. Recarrega o Prisma Workspace.

## Como funciona

1. No Prisma, abre uma equipa.
2. Cola o URL da equipa no ZeroZero.
3. Carrega em **Pré-visualizar plantel** / **Atualizar do ZeroZero**.
4. A extensão abre o ZeroZero num separador em background.
5. Lê apenas a informação pública do plantel no DOM renderizado.
6. Fecha o separador.
7. Devolve nome, número, posição e URL de perfil ao Prisma.
8. O Prisma mostra a pré-visualização antes de qualquer gravação.

Os contactos, Instagram, email e notas continuam guardados apenas no Supabase da Prisma e não são lidos/enviados para o ZeroZero.
