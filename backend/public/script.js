const IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/25/municipios';

const select = document.getElementById('select-municipio');
const svg = document.getElementById('mapa-svg');
const nomeMunicipio = document.getElementById('nome-municipio');

async function carregarMunicipios() {
    const resposta = await fetch(IBGE_URL);
    const municipio = await resposta.json();

    select.innerHTML = '<option value=">Selecione...</option>';

    municipio.forEach(m => {
        const option = document.createElement('option');
        option.value = m.nome;
        option.textContent = m.nome;
        select.appendChild(option);
    });
}

select.addEventListener('change', async () => {
    const nome = select.value;

    if (!nome) {
        svg.innerHTML = '';
        nomeMunicipio.textContent = '';
        return;
    }

    nomeMunicipio.textContent = 'Carregando...';

    const resposta = await fetch(`/municipios/${encodeURIComponent(nome)}/svg`);
    const dados = await resposta.json();

    nomeMunicipio.textContent = dados.municipio;
    svg.setAttribute('viewBox', dados.viewBox);
    svg.innerHTML = `<path d="${dados.path}" />`;
});

carregarMunicipios();