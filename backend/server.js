require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/municipios/:nome/svg', async (req, res) => {
    const { nome } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT
        getviewbox($1) AS viewbox,
        getsvgpath($1) AS path
      FROM municipio
      WHERE nome ILIKE $1`,
            [nome]
        );

        if (resultado.rows.lenght === 0) {
            return res.status(404).json({ erro: 'Município não encontrado' });
        }

        const { viewbox, path: svgPath } = resultado.rows[0];

        res.json({
            municipio: nome,
            viewBox: viewbox,
            path: svgPath,
        });

    } catch (err) {
        console.error('Erro na consulta:', err);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});