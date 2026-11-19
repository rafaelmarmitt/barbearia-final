# Entregas e indicadores

Esta matriz relaciona cada indicador do projeto avaliativo às evidências presentes no repositório e no aplicativo.

## Entrega 1 — proposta e estrutura

| Indicador | Evidência |
|---|---|
| 1. Problema e solução | README: contexto, público, dificuldade de disponibilidade por mensagens e proposta da agenda |
| 2. Definição inicial | README: escopo, permissões, funcionalidades, telas e fluxo |
| 3. Estrutura do aplicativo | App.js, screens/, components/, services/; React Native com Expo |
| 4. Navegação e versionamento | Native Stack com fluxos de cliente e administrador; versão executável no Expo; repositório no GitHub |

## Entrega 2 — modelagem, banco e integração

| Indicador | Evidência |
|---|---|
| 1. Modelagem | database/barbearia.sql; usuários 1:N horários, FK, índice único, check de hora cheia |
| 2. API | backend/server.js, app.js, routes/, controllers/, middlewares/, repository.js e database.js |
| 3. Integração | services/api.js usa fetch; repository usa MySQL real; teste mysql.integration.js |
| 4. Evolução/documentação | ESPECIFICACAO.md, README e resultado de testes; repositório atualizado no GitHub |

## Entrega 3 — autenticação e sistema funcional

| Indicador | Evidência |
|---|---|
| 1. Cadastro, login, senha | auth controller; bcrypt custo 12; senha nunca retornada; cadastro sempre cliente |
| 2. JWT/sessão | JWT HS256 de 2h; Bearer; SecureStore Android; /auth/me; logout e tratamento 401 |
| 3. Controle de acesso | Middlewares autenticar, somenteAdmin e somenteCliente; usuário/nível atuais lidos no banco |
| 4. CRUD e integração | GET, POST, PUT e DELETE de horários pelo painel; reserva, cancelamento e liberação pelo admin; MySQL |
| 5. Testes e versionamento | Contratos HTTP e MySQL, teste web E2E, lint e tipos; correções registradas no CHANGELOG |

## Entrega 4 — finalização e defesa

| Indicador | Evidência e situação |
|---|---|
| 1. Atendimento ao problema | Agenda compartilhada, disponibilidade, proteção de vagas reservadas, reservas por identidade e liberação de vaga quando o barbeiro não puder atender |
| 2. Testes e APK | VALIDACAO.md: resultados reais da versão 1.1.0, erros encontrados e corrigidos, APK gerado; BUILD_ANDROID.md traz reprodução |
| 3. Demonstração/domínio | Tabela "Onde cada conceito está no código" no README; código comentado nos pontos de hash, JWT, Bearer e middleware; apresentação no Canva |
| 4. Documentação/versionamento/defesa | README, CHANGELOG, especificação e esta matriz; apresentação no Canva; versão final marcada com a tag v1.1.0 |

## Roteiro da apresentação

1. Problema identificado e público afetado.
2. Solução proposta e perfis de usuário.
3. Cadastro de cliente e login.
4. JWT, Bearer Token, middleware e permissões (tabela "Onde cada conceito está no código" no README).
5. Níveis de usuário: telas e operações do cliente e do administrador.
6. CRUD de horários, reserva, cancelamento e liberação de vaga.
7. Banco de dados MySQL com as tabelas usuarios e horarios.
8. Repositório e histórico de commits.
9. APK instalado no Android.
