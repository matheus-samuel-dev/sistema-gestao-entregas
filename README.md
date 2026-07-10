# LogiTrack - Gestao de Entregas

LogiTrack e uma plataforma web full stack para gestao de entregas, criada como projeto de portfolio com aparencia de SaaS real. O sistema cobre pedidos, entregas, motoristas, veiculos, rotas, ocorrencias, relatorios operacionais, dashboard analitico e mapa interativo com dados demo de Sao Paulo.

## Stack

- Frontend: React, Vite, TypeScript, Material UI, React Router, Recharts, Leaflet/OpenStreetMap.
- Backend: Java 17, Spring Boot, Spring Security, JWT, JPA/Hibernate, Bean Validation, Swagger/OpenAPI.
- Banco: PostgreSQL em Docker e H2 para testes.
- Infra: Docker, docker-compose, seed idempotente, `.env.example`.

## Como rodar com Docker

```bash
cp .env.example .env
docker compose up --build
```

Depois acesse:

- Frontend: http://localhost
- API: http://localhost:18080/api
- Swagger: http://localhost:18080/swagger-ui.html
- PostgreSQL publicado em `localhost:55432` por padrao

Credenciais demo:

- E-mail: `admin@logitrack.com`
- Senha: `Admin@123`

## Como rodar localmente

Backend:

```bash
cd backend
mvn test
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Com o Vite, acesse `http://localhost:5173`.

## Estrutura

```text
.
├── backend
│   ├── src/main/java/com/logitrack
│   │   ├── config
│   │   ├── controller
│   │   ├── domain
│   │   ├── dto
│   │   ├── exception
│   │   ├── repository
│   │   ├── security
│   │   └── service
│   └── src/test/java/com/logitrack
├── frontend
│   ├── public
│   ├── scripts
│   └── src
│       ├── api
│       ├── components
│       ├── contexts
│       ├── pages
│       ├── test
│       └── theme
├── docker-compose.yml
└── .env.example
```

## Funcionalidades implementadas

- Autenticacao JWT com login, rota `/auth/me`, logout no frontend e persistencia de sessao.
- Protecao de rotas no React Router.
- Dashboard com cards, graficos, entregas em tempo real, proximas entregas, ocorrencias recentes e tabela operacional.
- Mapa Leaflet/OpenStreetMap com marcadores por status, rotas desenhadas, legenda e modo expandido.
- CRUD de pedidos com busca, filtros, criacao, edicao, detalhes via listagem e cancelamento.
- CRUD operacional de entregas com motorista, veiculo, rota, progresso, timeline, ocorrencia e marcar como entregue.
- CRUD de motoristas com disponibilidade, veiculo atual e desempenho.
- CRUD de veiculos com status operacional, capacidade e motorista vinculado.
- CRUD de rotas com coordenadas e visualizacao no mapa.
- CRUD de ocorrencias com tipo, prioridade, status, responsavel e resolucao.
- Relatorios com graficos, exportacao PDF via impressao e Excel compativel `.xls`.
- Configuracoes com dados da empresa, parametros, usuarios demo, categorias e preferencias visuais.
- Favicon completo: ICO, PNG 16/32, Apple Touch, Android 192/512 e manifest.
- Responsividade: sidebar mobile, tabelas virando cards e controles confortaveis para toque.
- Acessibilidade: labels em inputs, aria-label em botoes de icone, foco visivel e contraste adequado.

## Seed demo

O seed e idempotente: cria o administrador e os dados demo somente quando ainda nao existem.

Dados criados:

- 1 administrador
- 5 motoristas
- 5 veiculos
- 15 pedidos
- 10 entregas
- 5 rotas
- 8 ocorrencias
- timelines de entrega

## Regras de negocio validadas no backend

- Pedido e obrigatorio para criar entrega.
- Motorista indisponivel, em rota ou inativo nao recebe nova entrega.
- Veiculo em manutencao, em rota ou inativo nao pode ser atribuido.
- Pedido entregue nao pode ser cancelado.
- Entrega entregue libera motorista e veiculo.
- Ocorrencia precisa estar vinculada a entrega ou pedido.
- DTOs usam Bean Validation para obrigatoriedade, datas, numeros e formatos.

## Endpoints principais

Base: `/api`

- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard`
- `GET|POST /orders`
- `GET|PUT|DELETE /orders/{id}`
- `GET|POST /deliveries`
- `GET|PUT|DELETE /deliveries/{id}`
- `PUT /deliveries/{id}/status`
- `POST /deliveries/{id}/mark-delivered`
- `GET|POST /drivers`
- `GET|PUT|DELETE /drivers/{id}`
- `GET|POST /vehicles`
- `GET|PUT|DELETE /vehicles/{id}`
- `GET|POST /routes`
- `GET|PUT|DELETE /routes/{id}`
- `GET|POST /incidents`
- `GET|PUT|DELETE /incidents/{id}`

## Testes

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
npm run test
```

## Proximos passos opcionais

- Permissoes por perfil alem do administrador.
- WebSocket/SSE para telemetria em tempo real.
- Integracao com APIs de roteirizacao.
- Upload de comprovante de entrega.
- Auditoria detalhada por usuario.
