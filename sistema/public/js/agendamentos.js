// ============================================================
// public/js/agendamentos.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// Requisitos envolvidos: RF-19 (listar ordenado, com dados de
// tutor e pet) e RF-20 (atualizar data de um agendamento).
//
// Sugestão de estrutura por linha da tabela: cada linha mostra
// os dados do agendamento, e na coluna "Ações" um campo de data
// (input type="date", já preenchido com a data atual do
// agendamento) mais um botão "Salvar" - ao clicar, atualiza
// aquele agendamento. Isso evita precisar de modal/popup.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela e formatar datas
//   - exemplo-fetch.js       : GET, PUT e os demais tipos de fetch
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-agendamentos');
const tabela = document.getElementById('tabela-agendamentos');
const mensagemAgendamentos = document.getElementById('mensagem-agendamentos');

inicializar();

async function inicializar() {
    await carregarAgendamentos();
}

// ------------------------------------------------------------
// RF-19: listar agendamentos ordenados por data, com dados de
// pet e tutor (join)
// ------------------------------------------------------------
async function carregarAgendamentos() {
    try {
        const url = '/api/agendamentos';

        const resposta = await fetch(url);

        if (resposta.status == 401) {
            window.location.href = '/login.html';
            return;
        }

        const dados = await resposta.json();
        renderizarAgendamentos(dados);

    } catch (erro) {
        mensagemAgendamentos.textContent = 'Erro ao carregar agendamentos.';
        console.error(erro);
    }
}

function renderizarAgendamentos(agendamentos) {
    // TODO: se a lista estiver vazia, mantenha a mensagem visível
    // e a tabela escondida (classe d-none)

    // TODO: caso contrário, esconda a mensagem, mostre a tabela, e
    // monte uma linha <tr> para cada agendamento dentro de
    // corpoTabela.innerHTML, com as colunas: data, nome do pet,
    // espécie, nome do tutor, telefone do tutor, observação, e uma
    // célula de ação contendo:
    //   <input type="date" value="DATA NO FORMATO AAAA-MM-DD" data-id="${agendamento.id}">
    // ATENÇÃO: a data chega do banco como "2026-09-20T03:00:00.000Z", e o
    // <input type="date"> só aceita "2026-09-20". Veja o item F de
    // exemplos/exemplo-montar-tela.js antes de preencher o value.
    //   <button data-id="${agendamento.id}">Salvar</button>
    //
    // Depois de montar o innerHTML, adicione os addEventListener
    // nos botões "Salvar" recém-criados (eles não existem até esse
    // innerHTML ser inserido).

    if (!agendamentos || agendamentos.length === 0) {
        mensagemAgendamentos.classList.remove("d-none");
        tabela.classList.add("d-none");
        return;
    }

    mensagemAgendamentos.classList.add("d-none");
    tabela.classList.remove("d-none");

    corpoTabela.innerHTML = '';

    agendamentos.forEach(agendamento => {
        const linha = document.createElement('tr');
        const dataFormatada = formatarData(agendamento.data_agendamento);
        
        // pra evitar xss
        const data = document.createElement('td').textContent = dataFormatada;

        const nomePet = document.createElement('td').textContent = agendamento.nome_pet;

        const especie = document.createElement('td').textContent = agendamento.especie;

        const nomeTutor = document.createElement('td').textContent = agendamento.nome_tutor;

        const telefoneTutor = document.createElement('td').textContent = agendamento.telefone_tutor;

        const observacao = document.createElement('td').textContent = agendamento.observacao;

        const input = document.createElement('input');
        input.type = 'date';
        input.value = dataParaInput(agendamento.data_agendamento);
        input.setAttribute('data-id', agendamento.id);
        
        const botaoSalvar = document.createElement('button');
        botaoSalvar.textContent = 'Salvar';
        botaoSalvar.setAttribute('data-id', agendamento.id);
        botaoSalvar.classList.add('btn-salvar');

        const acoes = document.createElement('td');
        acoes.appendChild(input);
        acoes.appendChild(botaoSalvar);

        linha.appendChild(data);
        linha.appendChild(nomePet);
        linha.appendChild(especie);
        linha.appendChild(nomeTutor);
        linha.appendChild(telefoneTutor);
        linha.appendChild(observacao);
        linha.appendChild(acoes);

        corpoTabela.appendChild(linha);
    });

    const botoesSalvar = corpoTabela.querySelectorAll('.btn-salvar');
    
    botoesSalvar.forEach(botao => {
        botao.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const inputData = this.parentElement.querySelector('input[type="date"]');
            const novaData = inputData.value;
            atualizarDataAgendamento(id, novaData);
        });
    });
}

// ------------------------------------------------------------
// RF-20: atualizar a data de um agendamento
// Chamada pelos botões "Salvar" criados em renderizarAgendamentos()
// ------------------------------------------------------------
async function atualizarDataAgendamento(id, novaData) {
    try {
        const resposta = await fetch(`/api/agendamentos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "data_agendamento": novaData
            })
        })
        if (resposta.status == 401) {
            window.location.href = '/login.html';
            return;
        }
        if (resposta.status != 200) {
            alert("Não foi possível editar o agendamento.")
            return
        }

        carregarAgendamentos()
    } catch (erro) {
        alert('Erro ao atualizar data do agendamento.');
        console.error(erro);
    }
}

function dataParaInput(valor) {
    if (!valor) return '';
    return valor.substring(0, 10);
}

function formatarData(valor) {
    if (!valor) return '-';
    return dataParaInput(valor).split('-').reverse().join('/');
}
