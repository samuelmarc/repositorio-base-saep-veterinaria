// ============================================================
// routes/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta, seguindo o mesmo padrão
// usado em routes/auth.js. O que falta em cada uma é a lógica
// específica (marcada com TODO).
//
// Lembretes importantes:
//   - Cada rota abaixo já vem protegida pelo middleware
//     verificarSessao (segundo parâmetro) - vocês não precisam
//     mexer nisso, só saber que é por isso que o sistema exige
//     login para usar essas rotas.
//   - O CPF do tutor deve ser CRIPTOGRAFADO ao salvar/atualizar, e
//     DESCRIPTOGRAFADO ao listar/exibir - use as funções prontas em
//     utils/crypto-utils.js (criptografarCPF / descriptografarCPF)
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo
// de cada uma dessas funcionalidades.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// GET / -> listar tutores (RF-12)
// GET /?busca=termo -> listar tutores filtrados (RF-14)
// ─────────────────────────────────────────
router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const query = req.query.busca;
        let result

        if (query) {
            result = await client.query(`SELECT t.id, t.nome, t.cpf, t.telefone FROM tutores t WHERE t.nome ILIKE '%' || $1 || '%'`, [query]);
        } else {
            result = await client.query('SELECT id, nome, cpf, telefone FROM tutores');
        }

        // TODO: req.query.busca contém o termo digitado (se houver).
        // Monte a query de acordo: se não houver busca, traga todos
        // os tutores; se houver, filtre pelo nome.

        // TODO: ajustar

        // TODO: antes de responder, percorra resultado.rows e troque
        // o campo "cpf" de cada tutor pelo valor descriptografado
        // (descriptografarCPF), senão o CPF aparece ilegível na tela.
        
        if (!result) {
            return res.send({
                'status': 500,
                'message': ''
            })
        }

        for (const tutor of result.rows) {
            tutor.cpf = descriptografarCPF(tutor.cpf);
        }

        res.send(result.rows)
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// POST / -> inserir novo tutor (RF-15)
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { nome, cpf, telefone } = req.body;

        if (!nome || !cpf || !telefone) {
            return res.status(400).json({ erro: 'Informe nome, CPF e telefone do tutor.' });
        }

        // TODO: criptografar o CPF antes de salvar
        // const cpfCriptografado = criptografarCPF(cpf);

        const cpfCriptografado = criptografarCPF(cpf);
        const result = await client.query(
            'INSERT INTO tutores (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, cpfCriptografado, telefone]
        );

        res.status(201).json(result.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// PUT /:id -> editar tutor existente (RF-17)
// ─────────────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;
        const { nome, cpf, telefone } = req.body;

        const cpfCrypt = criptografarCPF(cpf)

        const resultado = await client.query("UPDATE tutores SET nome = $1, cpf = $2, telefone = $3 WHERE id = $4 RETURNING *", [nome.trim(), cpfCrypt.trim(), telefone.trim(), id])
        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// DELETE /:id -> excluir tutor (RF-13)
// ─────────────────────────────────────────
router.delete('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;

        const resultado = await client.query(
            'DELETE FROM tutores WHERE id = $1 RETURNING nome',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: `"${resultado.rows[0].nome}" removido com sucesso.` });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
