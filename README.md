# Sistema de Estudos · Vinícius

Sistema pessoal de planejamento e registro de estudos — jornada de 30 meses rumo à especialização em IA aplicada à logística no agronegócio.

## Acesso

Acesse pelo GitHub Pages: `https://SEU_USUARIO.github.io/sistema-estudos-vinicius`

## Funcionalidades

- **Painel principal** — métricas em tempo real, progresso da jornada, mapa de atividade e distribuição por pilar
- **Registrar sessão** — data, pilar, horas, tópico, aprendizados, dúvidas e energia da sessão
- **Semana** — calendário semanal e prioridades da semana
- **Histórico** — todas as sessões com filtro por pilar e mês
- **Caderno** — registro de aprendizados em ordem cronológica
- **Revisão mensal** — seis perguntas guiadas para reflexão mensal
- **Backup** — exportar e importar dados em `.json`

## Estrutura

```
sistema-estudos-vinicius/
├── index.html        # Estrutura HTML
├── assets/
│   ├── style.css     # Tema verde terminal
│   └── app.js        # Lógica e armazenamento
└── README.md
```

## Armazenamento

Os dados ficam salvos no `localStorage` do navegador. Use o módulo **Backup** regularmente para exportar um arquivo `.json` de segurança.

## Como publicar no GitHub Pages

1. Crie um repositório público no GitHub chamado `sistema-estudos-vinicius`
2. Suba os arquivos:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/sistema-estudos-vinicius.git
   git push -u origin main
   ```
3. No repositório → **Settings** → **Pages** → Source: `main` / `/ (root)`
4. Aguarde 1-2 minutos e acesse a URL gerada

## Os quatro pilares da jornada

| Pilar | Foco |
|---|---|
| Logística | Supply chain, estoque, operações, agronegócio |
| Dados | SQL, Python, Power BI, análise |
| IA | Machine learning, IA generativa, automação |
| Negócio | Posicionamento, consultoria, visão de mercado |
