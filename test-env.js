// Teste simples para verificar se as variáveis de ambiente estão sendo carregadas
console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=====================================');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida!');
  console.log('Tentando carregar .env manualmente...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envPath)) {
      console.log('✅ Arquivo .env encontrado em:', envPath);
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Conteúdo do .env (primeiras 5 linhas):');
      console.log(envContent.split('\n').slice(0, 5).join('\n'));
    } else {
      console.log('❌ Arquivo .env não encontrado em:', envPath);
    }
  } catch (error) {
    console.error('Erro ao ler .env:', error.message);
  }
} else {
  console.log('✅ DATABASE_URL está definida!');
}