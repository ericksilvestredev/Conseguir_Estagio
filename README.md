# Backend Tracker - Lista de Estágios

Este projeto é uma ferramenta para rastrear e gerenciar candidaturas de estágio em empresas com foco em desenvolvimento Backend.

## Funcionalidades

- **Visualização Dual**: Alternância entre visualização em tabela (lista) e grade (cards).
- **Busca Dinâmica**: Filtre empresas por nome, stack tecnológica ou setor.
- **Gerenciamento de Status**: Acompanhe o progresso de cada candidatura (Para Aplicar, Aplicado, Entrevista, Recusado, Aprovado).
- **Exportação de Dados**: Baixe a lista atualizada em formato CSV.
- **Design Premium**: Interface moderna com modo escuro e animações sutis.

## Como Executar

Como o projeto utiliza módulos JavaScript (ESM), ele não pode ser aberto diretamente como um arquivo local (`file://`) em alguns navegadores devido a restrições de segurança (CORS).

Para rodar localmente, utilize um servidor web simples:

### Usando Python
```bash
python -m http.server 8000
```
Após isso, abra seu navegador em: `http://localhost:8000`

## Estrutura do Projeto

- `index.html`: Estrutura principal da página.
- `css/style.css`: Estilização e design system.
- `js/script.js`: Lógica da aplicação e manipulação do DOM.
- `js/data.js`: Base de dados das empresas gerada a partir do CSV.
- `lista_200_empresas_estagio_backend.csv`: Fonte original dos dados.

## Atualização de Dados

Os dados são carregados a partir do arquivo `js/data.js`. Para atualizar a lista a partir do CSV, utilize um script de extração (como o `extract.py` fornecido).
