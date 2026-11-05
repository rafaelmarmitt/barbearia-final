# Barbearia Agenda

Aplicativo Android em React Native/Expo com API Express, MySQL, cadastro, JWT e dois níveis de acesso. Interface em grafite e cobre, escolhida pelo autor do projeto.

Esta entrega contém o projeto e a documentação, **sem APK**, conforme solicitado. A geração e a validação do APK serão feitas posteriormente pelo aluno. O código da autenticação, da API e da agenda está implementado e testado nos escopos descritos em VALIDACAO.md.

<p>
  <img src="docs/telas/01-login-mobile.png" width="200" alt="Entrada em grafite e cobre" />
  <img src="docs/telas/02-agenda-mobile.png" width="200" alt="Horários disponíveis para o cliente" />
  <img src="docs/telas/04-admin-mobile.png" width="200" alt="Painel administrativo da agenda" />
</p>

Capturas da versão web em largura de celular, com dados exclusivos de teste.

## Problema e proposta

Barbearias que organizam atendimentos por mensagens e anotações precisam repetir informações de disponibilidade e podem ter conflitos de horário. Clientes precisam descobrir vagas e confirmar reservas; o responsável precisa acompanhar a agenda e identificar quem será atendido.

A solução centraliza as vagas e permite que o próprio cliente reserve e cancele. O administrador abre, consulta, edita e exclui horários livres. Este é um projeto acadêmico; não há pesquisa de campo nem implantação comercial comprovada. A aplicação mantém a proposta original da entrega 1, agora com dados persistentes e autenticação real.

Escopo: um barbeiro, serviço de corte de cabelo e atendimentos de uma hora, sempre em hora cheia. Sem pagamentos, notificações ou múltiplos profissionais. Datas e horários representam o horário civil de São Paulo.

## Funcionalidades e permissões

| Ação | Cliente | Administrador |
|---|---|---|
| Cadastro público e login | Sim | Login; criação pelo terminal |
| Consultar disponibilidade | Sim, vagas livres e próprias reservas | Toda a agenda e nomes de clientes |
| Reservar | Vaga futura e livre | Não |
| Cancelar | Somente sua reserva futura | Não |
| Criar, editar e excluir vaga | Não | Sim; edição/exclusão apenas sem reserva |
| Ver histórico próprio | Sim | Toda a agenda pelo filtro Todos |

O backend verifica permissões em todas as rotas. Alterar o perfil no aplicativo ou no JSON de cadastro não concede privilégios. IDs de usuários são usados para propriedade; clientes com nomes iguais continuam separados. Duas reservas concorrentes resultam em uma única confirmação.

## Executar do zero

Pré-requisitos: Node.js 22.13+ (validado com 24.13.1), npm e MySQL 8.0.16+ rodando. Android: Expo Go compatível com SDK 58 ou build nativo. Para web, navegador atual.

1. Extraia o projeto e abra o terminal na pasta que contém `package.json`.
2. Execute `npm ci`.
3. No MySQL Workbench, conectado como usuário com permissão de criar banco, abra e execute `database/barbearia.sql`. Alternativa em terminal com o cliente MySQL: `mysql -u root -p` e, dentro dele, `SOURCE C:/caminho/database/barbearia.sql;`.
4. Crie um usuário de aplicação no MySQL e conceda SELECT, INSERT, UPDATE e DELETE nas tabelas de `barbearia_agenda`. Use uma senha local exclusiva; não publique credenciais.
5. Copie `backend/.env.example` para `backend/.env`; configure host, porta, nome, usuário e senha do MySQL. Gere um segredo com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e coloque em JWT_SECRET.
6. Execute `npm run criar-admin` e informe nome, e-mail e uma senha de pelo menos oito caracteres. Não existe administrador ou senha padrão. A senha digitada aparece no terminal, mas é persistida apenas como hash bcrypt.
7. Inicie a API com `npm run api`. `http://localhost:3000/saude` deve retornar status ok e banco MySQL.
8. Em outro terminal, execute `npm start` (Android) ou `npm run web` (navegador).
9. Na tela de entrada, use **Configurar conexão com a API**. No celular, informe `http://IP-DO-COMPUTADOR:3000`; aparelho e computador precisam estar na mesma rede, com porta 3000 acessível no firewall. No emulador Android padrão, use `http://10.0.2.2:3000`. No navegador deste computador, use `http://localhost:3000`.
10. Entre como administrador e abra horários futuros. Saia, crie uma conta de cliente e teste a reserva. No segundo perfil, acompanhe a ocupação da agenda.

Exemplo para o passo 4, executado por um administrador do MySQL (substitua a senha antes de executar):

```sql
CREATE USER 'barbearia'@'localhost' IDENTIFIED BY 'SUBSTITUA_POR_SUA_SENHA_LOCAL';
GRANT SELECT, INSERT, UPDATE, DELETE ON barbearia_agenda.* TO 'barbearia'@'localhost';
```

Se usar DB_HOST=127.0.0.1 e sua instalação distinguir esse host de localhost, crie/conceda acesso para o host correspondente. Para testes que criam bancos temporários, use uma conta separada com essa permissão.

Também é possível copiar `.env.example` da raiz para `.env` e definir EXPO_PUBLIC_API_URL antes de iniciar ou compilar. Essa variável é pública e contém somente a URL; nunca coloque segredos nela. A configuração feita na tela fica salva no aparelho e prevalece sobre o valor de build.

O app precisa de API e banco disponíveis; instalar o APK não instala MySQL no celular. Para acesso fora da rede local, hospede a API com HTTPS e configure a URL. HTTP foi habilitado no Android para demonstração em rede local; use HTTPS com dados reais.

## Fluxo e telas

```text
Entrada → Criar conta → Entrada
Entrada → Cliente → Horários → Meus agendamentos → Cancelar
Entrada → Administrador → Painel → Abrir/Editar horário
Painel → Excluir vaga livre (com confirmação)
Sair / JWT expirado → Entrada
```

As listas têm atualização manual e são recarregadas ao receber foco. Há filtros por data no cliente e por próximos/reservados/todos no painel. Cancelamento e exclusão pedem confirmação dentro da tela. Campos têm rótulos, botões com área mínima de 48 pontos e estados de carregamento, erro e vazio.

## Arquitetura

```text
React Native + Navigation → services/api.js → fetch + Bearer JWT
  → Express (routes em app.js) → controllers → repository.js
  → mysql2/promise → MySQL (InnoDB)
```

| Pasta/arquivo | Responsabilidade |
|---|---|
| App.js | Navegação, restauração e encerramento da sessão, estado da agenda |
| screens/ | Login/cadastro, vagas, reservas, painel e formulário |
| components/ | Componentes visuais e elementos compartilhados da agenda |
| services/ | fetch, armazenamento e contexto |
| backend/app.js | Routers REST, limites de tentativas e tratamento de erros |
| backend/controllers/ | Validação e regras das operações |
| backend/middlewares/ | JWT e autorização administrativa |
| backend/repository.js | Consultas SQL parametrizadas e mutações atômicas |
| database/barbearia.sql | Esquema, chave estrangeira, índices e restrições |
| backend/tests/ e scripts/testar-web.js | Testes HTTP, integração MySQL e interface |
| docs/ | Requisitos, modelagem, critérios e material de defesa |

## Autenticação e sessão

Cadastro público cria clientes com bcrypt (custo 12). O login retorna JWT HS256 com validade de duas horas, emissor e audiência verificados. O aplicativo envia `Authorization: Bearer TOKEN` nas chamadas protegidas. O middleware lê o usuário atual do banco, inclusive o nível, a cada requisição. Hash nunca é retornado ao app.

No Android, o token fica no Expo SecureStore e a sessão é restaurada consultando `/auth/me`. Na web, fica apenas em memória: recarregar exige novo login. Logout apaga a sessão local; como os JWTs são stateless, um token previamente copiado continua válido até expirar. Erros 401 levam à tela de entrada. O limite simples de tentativas é por IP e processo (30 em 15 minutos), adequado à demonstração; uma publicação com múltiplas instâncias precisa de limitação compartilhada.

## Testes

```bash
npm test
npm run lint
npm run typecheck
npm run export:web
```

MySQL real, com usuário autorizado a criar banco:

```bash
npm run test:mysql
npx playwright install chromium
npm run test:web
```

Os dois últimos testes usam as credenciais de backend/.env ou variáveis de ambiente. `test:mysql` cria e remove `barbearia_agenda_test`; `test:web` cria e remove `barbearia_visual_test`, usa portas 3000 e 8080 e exige `dist/` gerado por `export:web`. Pare a API antes do teste web. Eles recusam banco de teste já existente, sem apagá-lo. Não use a conta restrita de produção nesses testes. Os resultados e limites de verificação estão em [VALIDACAO.md](VALIDACAO.md).

## APK

Consulte [docs/BUILD_ANDROID.md](docs/BUILD_ANDROID.md) para build local ou EAS. O perfil preview em eas.json gera APK; production gera AAB. A URL da API pode ser ajustada no app após instalar. O status real do build desta entrega fica em VALIDACAO.md e não deve ser confundido com a existência de uma configuração EAS.

## As quatro entregas

Os requisitos das quatro etapas e todos os indicadores foram mapeados em [docs/ENTREGAS.md](docs/ENTREGAS.md). O enunciado traz quatro indicadores nas etapas 1, 2 e 4, e **cinco na etapa 3**; o mapeamento contempla os 17.

Material para apresentação: [docs/APRESENTACAO.md](docs/APRESENTACAO.md), com sequência de demonstração e perguntas de defesa. Modelagem e contrato: [docs/ESPECIFICACAO.md](docs/ESPECIFICACAO.md).

## Enviar ao GitHub

Preserve o repositório e o histórico da entrega 1. Copie o conteúdo deste projeto para a raiz do clone, incluindo .gitignore e arquivos .env.example. Não copie node_modules nem arquivos .env reais. Revise `git status` e `git diff`, execute as verificações e então:

```bash
git add .
git commit -m "Completa API MySQL, JWT, agenda e interface da barbearia"
git push
```

Confira os arquivos no GitHub. Publique o APK como anexo de uma Release, junto da identificação do commit correspondente, se o professor aceitar essa organização. Não crie commits retroativos para simular etapas: o histórico precisa refletir a evolução real. Este pacote não cria repositório remoto nem executa push. A atualização do GitHub e a apresentação são evidências do aluno, não algo que um ZIP comprove.

## Origem

A proposta de agendamento e o protótipo pertencem ao projeto fornecido pelo usuário. A loja-jwt é referência didática de estrutura e autenticação; esta aplicação usa regras próprias de disponibilidade, propriedade, concorrência e agenda, sem catálogo ou compra. A licença original foi preservada em LICENSE.
