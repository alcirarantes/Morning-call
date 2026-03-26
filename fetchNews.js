name: Morning Call Generator

on:
  # Roda automaticamente de segunda a sexta
  schedule:
    - cron: '0 10 * * 1-5'   # 7h00 BRT (horário de verão = UTC-3)
    - cron: '0 17 * * 1-5'   # 14h00 BRT (horário de verão = UTC-3)
    # ATENÇÃO: no horário de inverno (UTC-3), usar:
    # - cron: '0 11 * * 1-5'   # 8h00 BRT
    # - cron: '0 18 * * 1-5'   # 15h00 BRT

  # Permite rodar manualmente pelo GitHub (Actions > Run workflow)
  workflow_dispatch:
    inputs:
      motivo:
        description: 'Motivo da execução manual (opcional)'
        required: false
        default: 'Execução manual'

jobs:
  generate:
    name: Gerar Morning Call
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      # 1. Baixa o código do repositório
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      # 2. Configura Node.js 20
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 3. Instala dependências
      - name: Install dependencies
        run: npm ci

      # 4. Roda o gerador
      - name: Generate Morning Call
        run: node scripts/generate.js
        env:
          FRED_API_KEY:       ${{ secrets.FRED_API_KEY }}
          ANTHROPIC_API_KEY:  ${{ secrets.ANTHROPIC_API_KEY }}

      # 5. Faz commit do HTML gerado de volta para o repositório
      - name: Commit HTML gerado
        run: |
          git config user.email "morning-call-bot@github-actions"
          git config user.name "Morning Call Bot"
          git add public/index.html
          
          # Só commita se houver mudança
          if git diff --staged --quiet; then
            echo "Sem mudanças para commitar"
          else
            DATA=$(TZ="America/Sao_Paulo" date '+%d/%m/%Y %H:%M')
            git commit -m "Morning Call: $DATA BRT"
            git push
            echo "✅ HTML commitado e enviado"
          fi
