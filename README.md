# TaskInsight – Gestão de Produtividade

## Breve descrição do sistema
[cite_start]O Taskinsight nasceu do desafio de unir a gestão operacional de tarefas à inteligência de dados[cite: 269]. [cite_start]O sistema permite que usuários gerenciem suas atividades diárias em um ambiente seguro, enquanto um motor em Python processa essas informações para gerar insights sobre padrões de produtividade[cite: 270].

## Objetivo da plataforma
[cite_start]No ambiente corporativo moderno, a gestão de tarefas vai além do simples registro de atividades; exige-se segurança no tráfego de informações e inteligência para entender gargalos de produtividade[cite: 4, 5]. [cite_start]O desafio consiste em desenvolver uma solução Full Stack que permita o controle de fluxo de trabalho de usuários autenticados, transformando dados operacionais em métricas acionáveis[cite: 6].

## Estrutura inicial do projeto
* **Front-end:** Interface de usuário construída como Single Page Application (SPA) em React, responsável pela interação, roteamento e consumo da API.
* [cite_start]**Back-end / API:** Um sistema seguro para cadastro de usuários e gerenciamento de tarefas (CRUD), em que a segurança é garantida por autenticação JWT e camadas de proteção (Middlewares)[cite: 9].
* [cite_start]**Banco de Dados:** Base de dados NoSQL na nuvem para persistência de dados [cite: 81][cite_start], com coleções para Users (dados de acesso criptografados) e Tasks (vinculadas ao ID do usuário)[cite: 20].
* [cite_start]**Python & Análise de Dados:** Um motor em Python integrado ao banco de dados MongoDB, responsável por realizar a limpeza de dados e gerar insights sobre o desempenho[cite: 10].

## Tecnologias previstas
* **Front-end:** HTML5, CSS3, JavaScript (ES6) e React.
* [cite_start]**Back-end:** Node.js, Express.js[cite: 277].
* [cite_start]**Banco de Dados:** MongoDB (via Mongoose ODM)[cite: 277].
* [cite_start]**Dados e Segurança:** JWT (JSON Web Token), Bcrypt.js, Python 3, Pandas, Matplotlib, PyMongo[cite: 277].
