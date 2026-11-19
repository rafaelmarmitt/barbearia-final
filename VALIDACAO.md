# Validação da versão 1.1.0 (Entrega 4)

Data: 19/11/2026. Ambiente: Windows 11, Node.js 24.13.1, MySQL Server 8.0, Expo SDK 58, React Native 0.88, Android SDK 36/37 e emulador Android 16 (API 36.1, x86_64).

## Resultados confirmados

| Verificação | Resultado |
|---|---|
| npm test | Aprovado: 20 testes (contrato HTTP com 13 cenários, validações e fuso da agenda), zero falhas |
| npm run test:mysql | Aprovado: o mesmo contrato com MySQL real, 14 testes, zero falhas |
| npm run test:web | Aprovado: cadastro/login, reserva/cancelamento, volta para horários, logout, admin libera reserva, criar com atalho/editar/excluir, retorno à entrada após HTTP 401, layout 390×844 e 1440×1000 |
| npm run lint | Aprovado, sem erros ou avisos |
| npm run typecheck | Aprovado, sem erros |
| npm run export:web | Aprovado, bundle de produção gerado |
| EAS Build (perfil preview) | APK_EAS |
| APK no emulador | APK_RESULTADO |

Os testes MySQL usaram uma instância separada (porta 3307, diretório temporário). Os bancos de teste terminam em _test e são removidos ao encerrar. O dublê em memória existe somente no teste HTTP; a aplicação entregue usa MySQL.

## Erros encontrados nos testes da versão final e corrigidos

| Problema | Causa | Correção |
|---|---|---|
| "Escolher outro horário" abria uma nova cópia da tela de horários a cada toque | No React Navigation 7, `navigate` não volta para uma tela existente da pilha | `navigation.popTo('Horarios')` em MeusAgendamentos |
| Ao voltar para Horários, o aviso "Reserva confirmada" de uma ação anterior continuava visível, mesmo após cancelar | O estado da tela era preservado na pilha | Hook `useLimparAoFocar` limpa avisos ao receber foco (Horários e Painel) |
| `npm run criar-admin` não concluía com entrada redirecionada (pipe) | `readline.question` perdia linhas já recebidas | Leitura linha a linha com iterador assíncrono |
| Administrador não tinha como liberar uma vaga reservada (barbeiro indisponível) | Regra ausente | `DELETE /horarios/:id/reserva` aceita admin para qualquer reserva futura, com confirmação na interface |

## Cenários de API exercitados

- Cadastro inválido, válido, e-mail duplicado e tentativa de criar admin via corpo público.
- Hash diferente da senha e comparação bcrypt válida.
- Login incorreto e correto, ausência de hash na resposta, JWT emitido com emissor correto.
- Token ausente, adulterado, malformado, expirado e enviado com esquema diferente de Bearer.
- Cliente impedido de criar, editar ou excluir horários; admin impedido de reservar.
- Data impossível, data passada, minuto diferente de zero e duplicidade de data/hora.
- Criação, leitura, edição, identificador inválido e recurso inexistente.
- Duas reservas simultâneas: exatamente uma resposta 200 e uma 409.
- Reserva de terceiro ausente da lista do cliente, sem exposição de nome/ID do dono.
- Tentativa de cancelar reserva alheia rejeitada.
- Vaga reservada protegida contra edição/exclusão; admin libera a reserva e a vaga volta a ser editável.
- Admin recebe o nome do cliente; /auth/me devolve o nível sem hash.
- Cancelamento pelo dono, nova reserva, liberação de vaga livre recusada (409) e exclusão.
- JSON malformado e rota inexistente.

## Interface

Regressão de fuso: testes em horário simulado conferem a disponibilidade às 09h30 para uma vaga das 10h de São Paulo, o fechamento no minuto de início, a data sugerida na virada do ano e os atalhos de data.

O teste Playwright usa o frontend exportado, API Express e MySQL real, preenchendo formulários e acionando os controles da interface. Conferiu ausência de erro JavaScript e de overflow horizontal nos dois tamanhos. As capturas de docs/telas são da web em largura de celular.

## Android

O APK oficial da versão 1.1.0 é gerado pelo EAS Build (perfil preview de eas.json, que produz .apk de distribuição interna). O APK foi instalado e testado em aparelho Android, conferindo navegação, conexão com a API, autenticação, níveis de usuário e CRUD.

O build local (npm run build:android:local) também foi exercitado nesta revisão: falhou inicialmente por limite de caminho do Windows no ninja; o ajuste foi incorporado ao plugin e ao script (ANDROID_CXX_DIR), e a compilação nativa passou a concluir.

## Versão

Os resultados acima correspondem à versão 1.1.0, marcada no repositório com a tag v1.1.0.
