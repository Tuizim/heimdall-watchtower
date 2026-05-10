# 🪓 Valhalla Task Manager

Bem-vindo ao **Salão de Odin**, o sistema de gestão de missões definitivo para clãs vikings modernos. Forje seu destino, complete entregas gloriosas e suba na hierarquia do Batalhão.

## 🛡️ O Reino Visual

Este projeto é uma aplicação full-stack construída com a força do aço nórdico:
- **React 19** + **Vite**: Velocidade de um drakkar em mar aberto.
- **Tailwind CSS**: Estilo brutalista e elegante.
- **Supabase**: Nosso Oráculo de Dados para persistência em tempo real.
- **Motion**: Animações suaves como o vento do norte.
- **Express**: Servidor robusto para sustentar o reino.

## ⚔️ Como Iniciar a Jornada

Siga estes passos para rodar o projeto em suas próprias terras:

### 1. Clonar o Estandarte
Baixe o código e entre no diretório principal.

### 2. Preparar os Suprimentos
Instale as dependências com o gerenciador de pacotes:
```bash
npm install
```

### 3. O Oráculo de Supabase
Você precisará de uma instância do Supabase. 
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Execute o conteúdo do arquivo `supabase_schema.sql` no SQL Editor do Supabase para criar as tabelas (missões, perfis, etc).
3. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 4. Convocar o Servidor
Inicie o ambiente de desenvolvimento:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## 🏹 Comandos Sagrados

- `npm run dev`: Inicia o servidor de desenvolvimento (Express + Vite).
- `npm run build`: Compila o código para a batalha final (produção).
- `npm run lint`: Verifica a integridade do código com TypeScript.
- `npm run clean`: Remove os artefatos de builds anteriores.

## ⛈️ Ragnarök
No painel de entregas, o botão **Ragnarök** permite limpar todas as missões atuais para que o reino possa renascer das cinzas. Use com sabedoria, pois o fogo de Muspelheim é impiedoso.

---
*Que os deuses guiem seu código.* 🍻
