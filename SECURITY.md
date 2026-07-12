# Política de segurança

O LogiTrack é um projeto de portfólio com um perfil `demo` destinado apenas a
ambientes locais ou efêmeros. As credenciais de demonstração não devem ser
habilitadas em produção.

## Configuração segura

- Gere `LOGITRACK_JWT_SECRET` com pelo menos 32 bytes aleatórios e mantenha-o
  fora do repositório.
- Restrinja `LOGITRACK_ALLOWED_ORIGINS` aos domínios que realmente hospedam o
  frontend.
- Use o perfil `prod` sem o seed de demonstração.
- Termine TLS no proxy reverso e não publique a porta do PostgreSQL na internet.
- Rotacione imediatamente segredos que tenham sido compartilhados ou expostos.
- Faça backup do volume PostgreSQL antes de aplicar migrações em um ambiente
  persistente.

## Relato de vulnerabilidades

Não abra uma issue pública contendo tokens, credenciais ou dados pessoais.
Envie um relato privado ao mantenedor com a versão, o impacto observado e os
passos mínimos para reprodução. Não inclua dados reais de clientes.

## Escopo conhecido

O rastreamento exibido no perfil `demo` é uma simulação operacional baseada em
eventos persistidos; ele não representa telemetria GPS de produção. Integrações
externas devem usar credenciais próprias, limites de acesso e tratamento de
dados compatível com a LGPD.
