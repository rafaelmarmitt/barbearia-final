# Material da apresentação e defesa

Preencha seu nome, turma e professor antes de apresentar. Use este roteiro como conteúdo dos slides ou como guia da demonstração. Tempo sugerido: 8 a 10 minutos.

## 1. Problema atual

Organizar cortes apenas por mensagens exige combinar disponibilidade repetidamente. Anotações dispersas dificultam acompanhar quem vem e quais vagas continuam livres. Público: clientes e administrador de uma barbearia com um profissional.

Fala: o projeto parte desse problema; não apresenta pesquisa de campo ou números de impacto que não foram medidos.

## 2. Solução

Barbearia Agenda centraliza vagas. O cliente reserva e consulta seus cortes. O administrador acompanha ocupação e organiza horários. Escopo: um barbeiro, corte de uma hora, sem pagamento ou notificações.

Mostre a tela de entrada e a identidade grafite/cobre.

## 3. Arquitetura

React Native/Expo + React Navigation → fetch com Bearer Token → API Express → MySQL.

Explique que o celular não acessa diretamente o banco. A API valida regras e permissões. Mostre services/api.js, backend/app.js e repository.js.

## 4. Modelagem

Mostre o diagrama de ESPECIFICACAO.md e as tabelas no MySQL Workbench. usuarios guarda hash e nível; horarios guarda data/hora e cliente_id opcional. A combinação data/hora é única. NULL significa vaga livre.

Explique por que reserva é um relacionamento no horário, sem uma tabela que duplicaria o estado. A evolução para vários barbeiros exigiria modelar profissional.

## 5. Cadastro e proteção da senha

Crie uma conta de cliente pelo aplicativo. Mostre no banco somente um hash bcrypt, sem expor senhas de contas reais. O cadastro público sempre gera cliente; administrador é criado por comando local autorizado.

Hash é uma transformação de mão única com salt, não criptografia reversível. O login compara a senha com o hash usando bcrypt.compare.

## 6. JWT e sessão

Faça login. Mostre no código o retorno de JWT e o cabeçalho Authorization. Não publique um token válido em captura de tela.

JWT assinado permite verificar integridade; o conteúdo não é sigiloso. Middleware verifica assinatura, expiração, emissor e audiência e consulta usuário/nível no MySQL. No Android o token é persistido em SecureStore. Logout remove a sessão local; token já copiado continua válido até expirar em duas horas.

## 7. Demonstração do cliente

Consulte vagas, filtre por data, reserve uma e abra Meus agendamentos. Atualize a página/lista para mostrar persistência. Cancele com confirmação e mostre a vaga liberada.

Explique que cancelamento exige o ID do cliente autenticado e horário futuro; nomes iguais não misturam reservas.

## 8. Demonstração do administrador e CRUD

Saia e entre com conta administrativa. Crie vaga futura, consulte-a, edite hora e exclua com confirmação. Mostre uma reserva existente e explique por que edição/exclusão ficam bloqueadas.

CRUD: Create=POST, Read=GET, Update=PUT, Delete=DELETE. Ocultar botão não protege API: middleware também bloqueia cliente tentando executar ação administrativa.

## 9. Testes e concorrência

Mostre os resultados reais em VALIDACAO.md e execute npm test. Se o ambiente permitir, execute test:mysql usando uma conta de teste.

Explique o UPDATE condicional: duas tentativas para a mesma vaga resultam em 200 e 409. Não é só um botão desabilitado na tela. Mostre o teste de reserva concorrente e a restrição UNIQUE de data/hora.

## 10. APK e repositório

Mostre o status efetivo do build, instale o APK quando disponível e faça login pelo aparelho com API acessível. Mostre o GitHub atualizado e seu histórico real, com o commit correspondente ao pacote.

Conclua relacionando funcionalidades ao problema: disponibilidade compartilhada, reserva única e acompanhamento centralizado. Possíveis evoluções: vários profissionais, serviços com durações diferentes, notificações, recuperação de senha e trilha de auditoria.

## Perguntas que você precisa saber responder

| Pergunta | Resposta essencial |
|---|---|
| Por que JWT? | Autenticar chamadas após login, verificando assinatura e expiração |
| JWT é criptografado? | O token usado é assinado; payload pode ser lido |
| O que é Bearer? | Esquema de envio do token no cabeçalho Authorization |
| Para que middleware? | Interceptar chamada antes do controller e validar sessão/permissão |
| Onde impedir elevação para admin? | Backend ignora nível no cadastro e usa comando separado |
| Como evitar duas reservas? | UPDATE condicional atômico no MySQL/InnoDB |
| Por que não usar nome do cliente como chave? | Nomes repetem e mudam; ID é estável e único |
| Por que MySQL? | Persistência relacional, FK e unicidade de data/hora |
| Por que localhost não funciona no telefone? | Aponta para o telefone; usar IP da máquina ou domínio da API |
| O que falta para produção comercial? | Hospedagem HTTPS, operação/backup, observabilidade, revogação e demais requisitos de negócio |
