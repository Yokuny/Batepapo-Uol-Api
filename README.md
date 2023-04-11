Projeto de construção de uma API para uma aplicação de chat. A API será responsável por lidar com o armazenamento e manipulação de dados de participantes e mensagens. Através da API, será possível realizar as seguintes ações:
sr
    Adicionar um participante à sala de bate-papo
    Enviar mensagens para a sala de bate-papo
    Obter a lista de participantes ativos
    Obter a lista de mensagens enviadas para a sala de bate-papo

A API será construída utilizando o Node.js e o banco de dados MongoDB para persistência de dados. Será utilizado o framework Express para construção do servidor HTTP e a biblioteca Joi para validação dos dados enviados pelos clientes. A biblioteca Day.js será utilizada para manipulação de datas e horários. Para que o servidor seja iniciado corretamente, é necessário definir a porta 5000 e o arquivo app.js como ponto de entrada para a aplicação. Será utilizado o arquivo .env para armazenar as informações sensíveis da aplicação, como a URL de conexão com o banco de dados.