# Entregas e indicadores

Esta é uma matriz de evidências, não uma declaração de nota ou de aprovação. As evidências no GitHub, o APK e a defesa precisam corresponder à versão apresentada. O histórico anterior não foi recriado artificialmente.

## Entrega 1 — proposta e estrutura

| Indicador | Evidência |
|---|---|
| 1. Problema e solução | README: contexto, público, dificuldade de disponibilidade por mensagens e proposta da agenda |
| 2. Definição inicial | README: escopo, permissões, funcionalidades, telas e fluxo |
| 3. Estrutura do aplicativo | App.js, screens/, components/, services/; React Native com Expo |
| 4. Navegação e versionamento | Native Stack, seis fluxos principais; preservar histórico da primeira entrega e publicar alterações |

## Entrega 2 — modelagem, banco e integração

| Indicador | Evidência |
|---|---|
| 1. Modelagem | database/barbearia.sql; usuários 1:N horários, FK, índice único, check de hora cheia |
| 2. API | backend/app.js, controllers/, middlewares/, repository.js, database.js e server.js |
| 3. Integração | services/api.js usa fetch; repository usa MySQL real; teste mysql.integration.js |
| 4. Evolução/documentação | ESPECIFICACAO.md, README e resultado de testes; commit e push da evolução real pelo aluno |

## Entrega 3 — autenticação e sistema funcional

| Indicador | Evidência |
|---|---|
| 1. Cadastro, login, senha | auth controller; bcrypt custo 12; senha nunca retornada; cadastro sempre cliente |
| 2. JWT/sessão | JWT HS256 de 2h; Bearer; SecureStore Android; /auth/me; logout e tratamento 401 |
| 3. Controle de acesso | Middleware autenticar e somenteAdmin; usuário/nível atuais lidos no banco |
| 4. CRUD e integração | GET, POST, PUT e DELETE de horários pelo painel; reserva/cancelamento; MySQL |
| 5. Testes e versionamento | Contratos HTTP e MySQL, teste web E2E, lint e tipos; histórico real a preservar no GitHub |

## Entrega 4 — finalização e defesa

| Indicador | Evidência e situação |
|---|---|
| 1. Atendimento ao problema | Agenda compartilhada, disponibilidade, proteção de vagas reservadas e reservas por identidade |
| 2. Testes e APK | VALIDACAO.md contém resultados reais e status do APK; BUILD_ANDROID.md traz reprodução |
| 3. Demonstração/domínio | APRESENTACAO.md com fluxo de demonstração e conceitos para explicar |
| 4. Documentação/versionamento/defesa | README, modelo, matriz e material de apresentação; push e defesa são feitos pelo aluno |

## Conferência antes de entregar

- Instalar e abrir a versão final no aparelho Android.
- Configurar API acessível pelo aparelho; demonstrar MySQL e persistência.
- Demonstrar cadastro, dois perfis, reserva e CRUD.
- Revisar status do APK e limitações registradas em VALIDACAO.md.
- Copiar fontes para o repositório original, preservando .git e histórico.
- Conferir que arquivos .env, node_modules e dados locais não aparecem em git status.
- Fazer commit e push; abrir GitHub e conferir a versão remota.
- Publicar/anexar APK da mesma versão e registrar o hash/commit correspondente.
- Preparar os dados da identificação do aluno, turma e professor na apresentação.
