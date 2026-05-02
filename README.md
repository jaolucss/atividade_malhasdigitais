# Atividade Prática – Malhas Digitais da Paraíba

Aplicação web para visualização da malha digital dos municípios da Paraíba em formato SVG.

## Tecnologias Utilizadas

- **Frontend:** HTML, CSS e JavaScript Vanilla
- **Backend:** Node.js + Express.js
- **Banco de Dados:** PostgreSQL com extensão PostGIS
- **API Externa:** IBGE Localidades

## Estrutura do Projeto

atividade_malhasdigitais/
├── backend/
│   ├── public/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── shapefiles/
└── README.md

## Como Executar

### Pré-requisitos

- Node.js instalado
- PostgreSQL com extensão PostGIS instalada

### 1. Configurar o Banco de Dados

Acesse o PostgreSQL e execute:

```sql
CREATE DATABASE malhas_pb;
\c malhas_pb
CREATE EXTENSION postgis;
```

Importe o shapefile dos municípios da Paraíba:

```bash
shp2pgsql -s 4674 -W UTF-8 shapefiles/PB_Municipios_2022.shp municipio | psql -U postgres -d malhas_pb
```

Renomeie a coluna de nome:

```sql
ALTER TABLE municipio RENAME COLUMN nm_mun TO nome;
```

Crie as funções PostGIS:

```sql
CREATE OR REPLACE FUNCTION getviewbox(nome_municipio TEXT)
RETURNS TEXT LANGUAGE sql AS $$
  SELECT
    ST_XMin(ST_Envelope(geom)) || ' ' ||
    (ST_YMax(ST_Envelope(geom)) * -1) || ' ' ||
    (ST_XMax(ST_Envelope(geom)) - ST_XMin(ST_Envelope(geom))) || ' ' ||
    (ST_YMax(ST_Envelope(geom)) - ST_YMin(ST_Envelope(geom)))
  FROM municipio
  WHERE nome ILIKE nome_municipio;
$$;

CREATE OR REPLACE FUNCTION getsvgpath(nome_municipio TEXT)
RETURNS TEXT LANGUAGE sql AS $$
  SELECT ST_AsSVG(geom)
  FROM municipio
  WHERE nome ILIKE nome_municipio;
$$;
```

### 2. Configurar as Variáveis de Ambiente

Dentro da pasta `backend`, crie um arquivo `.env` baseado no `.env.example`:

DB_USER=postgres
DB_HOST=localhost
DB_NAME=malhas_pb
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432
PORT=3000

### 3. Instalar as Dependências

```bash
cd backend
npm install
```

### 4. Iniciar o Servidor

```bash
node server.js
```

Acesse no navegador: [http://localhost:3000](http://localhost:3000)

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/municipios/:nome/svg` | Retorna o viewBox e path SVG do município |

### Exemplo de Resposta

```json
{
  "municipio": "Cajazeiras",
  "viewBox": "-38.67 -7.63 0.28 0.26",
  "path": "M -38.42 6.91 L -38.42 ..."
}
```