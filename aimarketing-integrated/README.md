# AI Marketing Generator

Uma aplicação web construída com Next.js, Shadcn/UI e Supabase para gerar anúncios de marketing com inteligência artificial.

## 🚀 Configuração Inicial

### 1. Configuração do Supabase

Antes de usar a aplicação, você precisa configurar suas credenciais do Supabase:

1. Vá ao seu Dashboard do Supabase
2. Acesse **Project Settings > API**
3. Na seção "Project API keys", copie a chave **public** (anon key)
4. Substitua `COLA_A_TUA_ANON_KEY_AQUI` no arquivo `.env.local` pela sua chave

### 1.1. Configuração da OpenAI

Para ativar a análise automática de imagens, configure sua chave da OpenAI:

1. Vá para [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma nova chave API se não tiver uma
3. Substitua `sk-...` no arquivo `.env.local` pela sua chave da OpenAI real

### 2. Configuração da Base de Dados

Crie uma tabela `jobs` no seu banco Supabase com a seguinte estrutura:

```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  analysis_result JSONB,
  generated_image_prompt JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configuração do Storage

1. No Supabase Dashboard, vá para **Storage**
2. Crie um novo bucket chamado `image-uploads`
3. Configure as políticas de acesso conforme necessário

## 💻 Como Usar

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Executar em Desenvolvimento:**
```bash
npm run dev
   ```

3. **Acessar:** Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 💡 Como Usar

1. **Preencha o prompt:** Descreva que tipo de anúncio quer criar
   ```
   Exemplo: "Criar um anúncio casual estilo UGC para mostrar este produto sendo usado no dia a dia"
   ```

2. **Envie uma imagem:** Faça upload de uma imagem do produto ou personagem

3. **Processamento automático:** O sistema irá:
   - Analisar a imagem automaticamente
   - Identificar produtos, cores, marcas
   - Gerar um prompt estruturado para criação de imagem
   
4. **Resultado:** Na base de dados terá:
   - `analysis_result`: Análise detalhada da imagem
   - `generated_image_prompt`: Prompt estruturado para gerar nova imagem

## 🔧 Funcionalidades

- ✅ Interface moderna com Shadcn/UI
- ✅ Upload de imagens para Supabase Storage
- ✅ Formulário com validação
- ✅ Server Actions do Next.js
- ✅ Integração completa com Supabase
- ✅ **🆕 Análise automática de imagens com OpenAI GPT-4o mini**
- ✅ **🆕 Detecção de produtos vs personagens**
- ✅ **🆕 Extração de esquemas de cores, marcas e estilos**
- ✅ **🆕 Geração automática de prompts de imagem estruturados**
- ✅ **🆕 Sistema de prompts otimizado para conteúdo UGC casual**
- ✅ Tratamento de erros

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Página principal
│   │   └── actions.ts        # Server Actions (createJob, analyzeImage, generateImagePrompt)
│   └── components/ui/        # Componentes Shadcn/UI
├── lib/
│   └── supabase/
│       ├── client.ts         # Cliente Supabase (browser)
│       └── server.ts         # Cliente Supabase (servidor)
└── .env.local               # Variáveis de ambiente
```

## 🔄 Fluxo de Processamento

Quando você submete um job com imagem, o sistema executa automaticamente:

1. **📤 Upload** → Imagem vai para Supabase Storage
2. **🔍 Análise** → OpenAI analisa e identifica produtos/personagens
3. **📝 Prompt** → IA gera prompt estruturado para criação de imagem
4. **✅ Completo** → Dados ficam prontos na base de dados

### Estados do Job:
- `pending` → Aguardando processamento
- `analyzing_image` → Analisando imagem
- `generating_image_prompt` → Gerando prompt
- `image_prompt_complete` → Processamento concluído
- `error` → Erro durante processamento

## 🌐 Próximos Passos

Agora você pode:
- Personalizar o design da interface
- Implementar visualização dos jobs processados
- Adicionar geração de imagens com DALL-E ou Midjourney
- Criar autenticação de usuários
- Adicionar histórico de jobs processados