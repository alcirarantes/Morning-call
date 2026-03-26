# Banco Central do Brasil — sem necessidade de chave
# Documentação: https://olinda.bcb.gov.br/

# FRED API — gratuita, cadastro em fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=sua_chave_aqui

# Anthropic API — para geração do texto analítico
# Obtenha em: console.anthropic.com
ANTHROPIC_API_KEY=sua_chave_aqui

# Segredo para proteger o endpoint do cron no Vercel
# Gere com: openssl rand -hex 32
CRON_SECRET=string_aleatoria_segura_aqui

# CoinGecko — opcional, somente necessário para mais de 50 req/min
# COINGECKO_API_KEY=opcional
