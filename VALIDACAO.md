# Validação da versão 1.0.0

Data: 05/11/2026. Ambiente: Windows, Node.js 24.13.1, MySQL 8.0.46. Verificações executadas sobre a versão desta entrega, com Expo SDK 58 e dependências alinhadas por expo install --check.

## Resultados confirmados

| Verificação | Resultado |
|---|---|
| npm test | Aprovado: 12 testes contabilizados pelo node:test (11 cenários e seu agrupador), zero falhas |
| npm run test:mysql | Aprovado: o mesmo contrato com MySQL real, 12 testes contabilizados, zero falhas |
| npm run test:web | Aprovado: fluxo real de cadastro/login, reserva/cancelamento, logout, admin e CRUD; retorno à entrada após HTTP 401 |
| npm run lint | Aprovado, sem erros ou avisos |
| npm run typecheck | Aprovado, sem erros |
| npm run export:web | Aprovado, bundle de produção gerado |
| npx expo install --check | Dependências compatíveis, sem ajustes pendentes |
| Revisão visual | Aprovada no escopo das capturas web 390×844 e 1440×1000; sem problemas materiais identificados |

O MySQL de validação foi inicializado em diretório separado e porta 3307. Nenhuma credencial do banco existente do usuário foi utilizada e nenhuma tabela de seu banco foi alterada. Os testes criam bancos exclusivos terminados em _test e os removem ao encerrar. Não há banco em memória substituindo MySQL na aplicação entregue: o dublê em memória existe somente no teste HTTP.

## Cenários de API exercitados

- Cadastro inválido, cadastro válido, e-mail duplicado e tentativa de criar admin via corpo público.
- Hash diferente da senha e comparação bcrypt válida.
- Login incorreto e correto, ausência de hash na resposta, JWT emitido.
- Token ausente, adulterado ou expirado, e consulta de sessão válida.
- Cliente impedido de criar, editar ou excluir horários.
- Data impossível, data passada, minuto diferente de zero e duplicidade de data/hora.
- Criação, leitura, edição, identificador inválido e recurso inexistente.
- Duas reservas simultâneas: exatamente uma resposta 200 e uma 409.
- Reserva de terceiro ausente da lista do cliente, sem exposição de nome/ID do dono.
- Tentativa de cancelar reserva alheia rejeitada.
- Vaga reservada protegida contra edição/exclusão; admin não faz reserva como cliente.
- Cancelamento pelo dono, nova reserva, novo cancelamento e exclusão da vaga.
- JSON malformado e rota inexistente.

## Interface

O teste Playwright usa o frontend exportado, API Express e MySQL real. Preenche os formulários e executa as ações pelos controles da interface. Conferiu ausência de erro JavaScript e de overflow horizontal nos dois tamanhos. As capturas de docs/telas são da web em largura de celular, não de aparelho físico. O conteúdo tem rolagem; a captura do viewport não inclui toda a página.

## Evidências externas ao pacote

Commit, push, conferência do GitHub e defesa em sala não foram executados. Preserve o histórico original e publique a evolução real. Não foram fabricadas entregas retroativas ou registros de avaliação.

## Android

APK não incluído, conforme solicitação do usuário em 05/11/2026: a geração será feita pelo próprio aluno posteriormente. O projeto inclui eas.json, plugin de configuração Android e script de build local. Foram resolvidos ajustes de compatibilidade de dependências e de caminho do Windows durante a preparação; a compilação não foi concluída nem a instalação nativa validada.

O bundle JavaScript de produção para Android foi gerado com sucesso durante a tentativa local, mas isso não equivale a um APK instalável. SecureStore, teclado, barras do sistema e navegação no dispositivo ainda devem ser verificados no build final. Consulte docs/BUILD_ANDROID.md. A entrega 4 depende também do APK futuro, do push ao GitHub e da defesa do aluno.
