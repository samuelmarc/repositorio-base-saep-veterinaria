// ============================================================
// public/js/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// A estrutura abaixo (elementos, eventos já conectados, nomes de
// função) já está pronta para vocês seguirem o mesmo padrão usado
// em outros projetos do curso (inicializar() no topo, funções
// carregarX() e renderizarX() separadas). O que falta é o conteúdo
// de cada função marcada com TODO.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela, botões Editar e
//                              Excluir, levar os dados para o formulário
//   - exemplo-fetch.js       : todos os tipos de fetch (GET, busca,
//                              POST, PUT e DELETE)
//
// Requisitos envolvidos neste arquivo: RF-12, RF-13, RF-14, RF-15, RF-17
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-tutores');
const tabela = document.getElementById('tabela-tutores');
const mensagemTutores = document.getElementById('mensagem-tutores');

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');

const formTutor = document.getElementById('form-tutor');
const tutorIdInput = document.getElementById('tutor-id');
const tutorNomeInput = document.getElementById('tutor-nome');
const tutorCpfInput = document.getElementById('tutor-cpf');
const tutorTelefoneInput = document.getElementById('tutor-telefone');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

inicializar();

async function inicializar() {
    await carregarTutores();
}

// ------------------------------------------------------------
// RF-12: listar tutores
// RF-14: também é usada para a busca (aceita um termo opcional)
// ------------------------------------------------------------
async function carregarTutores(termoBusca = '') {
    try {

        // TODO: monte a URL da requisição. Se termoBusca não for
        // vazio, inclua como query string, ex:
        //   /api/tutores?busca=' + encodeURIComponent(termoBusca)
        // Se for vazio, chame só /api/tutores

        // TODO: faça o fetch, trate resposta.status === 401
        // (redirecionar para /login.html), depois pegue o JSON

        // TODO: chame renderizarTutores(tutores) com o resultado

        const url = termoBusca ? `/api/tutores?busca=${encodeURIComponent(termoBusca)}` : '/api/tutores';

        const resposta = await fetch(url);
        const tutores = await resposta.json();
        renderizarTutores(tutores);
    } catch (erro) {
        mensagemTutores.textContent = 'Erro ao carregar tutores.';
        console.error(erro);
    }
}

// ------------------------------------------------------------
// Desenha a tabela de tutores na tela
// ------------------------------------------------------------
function renderizarTutores(tutores) {
    if (!tutores || tutores.length === 0) {
        mensagemTutores.classList.remove("d-none")
        tabela.classList.add("d-none");
        return
    }
    // TODO: se a lista estiver vazia, mantenha mensagemTutores
    // visível com um texto tipo "Nenhum tutor encontrado." e a
    // tabela escondida (classe d-none)
    mensagemTutores.classList.add("d-none")
    tabela.classList.remove("d-none")

    corpoTabela.innerHTML = '';

    tutores.forEach(tutor => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${tutor.nome}</td>
            <td>${tutor.cpf}</td>
            <td>${tutor.telefone}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-editar" data-id="${tutor.id}">Editar</button>
                <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${tutor.id}">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
    // TODO: caso contrário, esconda mensagemTutores, mostre a
    // tabela (remova d-none) e monte uma linha <tr> para cada
    // tutor dentro de corpoTabela.innerHTML, com:
    //   - nome, cpf (já vindo pronto para exibição - ver rota),
    //     telefone
    //   - um botão "Editar" com data-id="${tutor.id}"
    //   - um botão "Excluir" com data-id="${tutor.id}"
    //
    // Depois de montar o innerHTML, é necessário adicionar os
    // addEventListener nos botões recém-criados (igual ao exemplo
    // de "Remover" visto em aula) - eles ainda não existem no HTML
    // até esse innerHTML ser inserido.

    document.querySelectorAll('.btn-editar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const tutor = tutores.find((t) => t.id == botao.dataset.id);
            preencherFormularioParaEdicao(tutor);
        });
    });

    document.querySelectorAll('.btn-excluir').forEach((botao) => {
        botao.addEventListener('click', () => excluirTutor(botao.dataset.id));
    });
}

// ------------------------------------------------------------
// RF-14: busca
// ------------------------------------------------------------
btnBuscar.addEventListener('click', () => {
    carregarTutores(inputBusca.value);
});

// ------------------------------------------------------------
// RF-15 / RF-17: salvar (inserir novo ou editar existente)
// ------------------------------------------------------------
formTutor.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const tut = {
        nome: tutorNomeInput.value.trim(),
        cpf: tutorCpfInput.value.trim(),
        telefone: tutorTelefoneInput.value.trim()
    };

    const id = tutorIdInput.value;

    try {
        if (!id) {
            const resposta = await fetch(`/api/tutores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tut)
            })
            if (resposta.status == 401) {
                window.location.href = '/login.html';
                return;
            }
            if (resposta.status != 201) {
                alert("Não foi possível adicionar o tutor.")
                return
            }
        } else {
            const resposta = await fetch(`/api/tutores/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tut)
            })
            if (resposta.status == 401) {
                window.location.href = '/login.html';
                return;
            }
            if (resposta.status != 200) {
                alert("Não foi possível editar o tutor.")
                return
            }
        }

        formTutor.reset()
        btnCancelarEdicao.classList.add("d-none")
        carregarTutores()

        // TODO: se "id" estiver preenchido, é uma edição (RC-17) ->
        //   fetch PUT /api/tutores/{id}
        // Se estiver vazio, é um novo cadastro (RC-15) ->
        //   fetch POST /api/tutores
        // Em ambos os casos: enviar "tutor" como JSON no body,
        // conferir resposta.ok, e se der certo:
        //   - limpar o formulário (formTutor.reset())
        //   - esconder o botão de cancelar edição
        //   - chamar carregarTutores() de novo para atualizar a lista

    } catch (erro) {
        alert('Erro ao salvar tutor.');
        console.error(erro);
    }
});

btnCancelarEdicao.addEventListener('click', () => {
    formTutor.reset();
    tutorIdInput.value = '';
    btnCancelarEdicao.classList.add('d-none');
});

// ------------------------------------------------------------
// Chamada pelos botões "Editar" criados em renderizarTutores()
// ------------------------------------------------------------
function preencherFormularioParaEdicao(tutor) {
    // TODO: preencher tutorIdInput, tutorNomeInput, tutorCpfInput,
    // tutorTelefoneInput com os dados de "tutor", e mostrar o
    // botão btnCancelarEdicao (remover a classe d-none)

    tutorIdInput.value = tutor.id
    tutorNomeInput.value = tutor.nome
    tutorCpfInput.value = tutor.cpf
    tutorTelefoneInput.value = tutor.telefone
    btnCancelarEdicao.classList.remove("d-none")
}

// ------------------------------------------------------------
// RF-13: excluir tutor
// Chamada pelos botões "Excluir" criados em renderizarTutores()
// ------------------------------------------------------------
async function excluirTutor(id) {
    if (!confirm('Deseja realmente excluir este tutor?')) return;

    try {
        const response = await fetch(`/api/tutores/${id}`, {
            method: "DELETE"
        })
        if (response.status == 200) {
            carregarTutores()
        } else {
            alert('Não foi possível excluir o tutor.')
        }
    } catch (erro) {
        alert('Erro ao excluir tutor.');
        console.error(erro);
    }
}
