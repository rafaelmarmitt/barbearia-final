# Histórico de versões

## 1.1.0 — Entrega 4 (versão final)

### Corrigido
- Navegação: "Escolher outro horário" empilhava uma nova tela de horários a cada toque (comportamento do `navigate` no React Navigation 7). Agora usa `popTo` e volta para a tela existente.
- Mensagens: avisos de sucesso/erro de ações anteriores permaneciam ao voltar para a tela de horários ou para o painel. Agora são limpos ao receber foco.

### Adicionado
- Administrador libera a reserva futura de um cliente (`DELETE /horarios/:id/reserva` com perfil admin), com confirmação na interface.
- Atalhos de dia (próximos 7 dias) e de hora (expediente) no formulário de horário; os campos de texto continuam disponíveis.
- Resumo de vagas livres e reservas futuras no painel administrativo.
- Botão "Voltar sem salvar" no formulário e validação de senha curta no cadastro.
- Testes: liberação pelo admin, esquema Bearer obrigatório, nível em `/auth/me`, validações (`validacoes.test.js`) e atalhos de data; teste web cobre a liberação de reserva.
- Script de build Android com parâmetro de arquiteturas (padrão arm64-v8a e x86_64).

### Alterado
- Backend reorganizado: rotas em `backend/routes/`, middlewares de autenticação/nível e de limite de tentativas separados, validação de cadastro reutilizada pelo comando `criar-admin`.
- Código das telas, serviços e backend formatado de forma legível, com comentários sobre hash, JWT, Bearer Token, middleware e SQL atômico.
- Removido código herdado do modelo de loja (função `moeda` e estilos sem uso).
- Documentação atualizada: README, especificação, indicadores, validação e build.

## 1.0.0 — Entrega 3

- Cadastro com hash bcrypt, login com JWT, Bearer Token, SecureStore, `/auth/me` e logout.
- Níveis cliente e administrador com autorização no backend.
- CRUD de horários, reserva atômica e cancelamento pelo proprietário.
- Testes HTTP, integração MySQL e teste web; APK de demonstração (commit `fc6d021`).
