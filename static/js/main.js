const DB_KEYS = {
    USERS: "av_usuarios",
    SESSION: "av_sessao",
    RATINGS: "av_avaliacoes",
    COMMENTS: "av_comentarios",
    REPORTS: "av_denuncias",
};

function getDB(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getSession() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SESSION)) || null;
}

function setSession(usuario) {
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(usuario));
}

function clearSession() {
    localStorage.removeItem(DB_KEYS.SESSION);
}

const ARTIST_CARDS = [
    { id: "cardZe", nome: "Zé Neto & Cristiano" },
    { id: "cardLinkin", nome: "Linkin Park" },
    { id: "cardHariel", nome: "Mc Hariel" },
    { id: "cardMenosMais", nome: "Menos é Mais" },
    { id: "cardJB", nome: "Justin Bieber" },
    { id: "cardMcDaniel", nome: "Mc Daniel" },
    { id: "cardLamar", nome: "Kendrick Lamar" },
    { id: "cardRet", nome: "Filipe Ret" },
];

function criarModal(conteudoHTML) {
    fecharModal();

    const overlay = document.createElement("div");
    overlay.id = "av-modal-overlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.7); display: flex; align-items: center;
        justify-content: center; z-index: 1000;
    `;

    const box = document.createElement("div");
    box.id = "av-modal-box";
    box.style.cssText = `
        background: black; color: white; padding: 30px; border-radius: 20px;
        width: 90%; max-width: 400px; position: relative; font-family: inherit;
        max-height: 85vh; overflow-y: auto;
    `;
    box.innerHTML = conteudoHTML;

    const btnFechar = document.createElement("button");
    btnFechar.textContent = "✕";
    btnFechar.style.cssText = `
        position: absolute; top: 10px; right: 15px; background: none;
        border: none; color: royalblue; font-size: 20px; cursor: pointer;
    `;
    btnFechar.onclick = fecharModal;
    box.appendChild(btnFechar);

    overlay.appendChild(box);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) fecharModal();
    });

    document.body.appendChild(overlay);
}

function fecharModal() {
    const existente = document.getElementById("av-modal-overlay");
    if (existente) existente.remove();
}

const estiloInput = `
    width: 100%; padding: 10px; margin-top: 10px; border-radius: 8px;
    border: none; font-size: 16px; box-sizing: border-box;
`;
const estiloBotaoPrimario = `
    width: 100%; padding: 12px; margin-top: 15px; border: none;
    border-radius: 10px; background-color: royalblue; color: white;
    font-size: 16px; cursor: pointer;
`;

function abrirCadastro() {
    criarModal(`
        <h2>Criar Conta</h2>
        <input type="text" id="cad-nome" placeholder="Nome" style="${estiloInput}">
        <input type="email" id="cad-email" placeholder="E-mail" style="${estiloInput}">
        <input type="password" id="cad-senha" placeholder="Senha" style="${estiloInput}">
        <button id="btn-confirmar-cadastro" style="${estiloBotaoPrimario}">Cadastrar</button>
        <p style="margin-top:15px; font-size: 14px;">
            Já tem conta?
            <a href="#" id="ir-para-login" style="color: royalblue;">Entrar</a>
        </p>
    `);

    document.getElementById("btn-confirmar-cadastro").onclick = realizarCadastro;
    document.getElementById("ir-para-login").onclick = (e) => {
        e.preventDefault();
        abrirLogin();
    };
}

function realizarCadastro() {
    const nome = document.getElementById("cad-nome").value.trim();
    const email = document.getElementById("cad-email").value.trim().toLowerCase();
    const senha = document.getElementById("cad-senha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos para se cadastrar.");
        return;
    }

    const usuarios = getDB(DB_KEYS.USERS);

    if (usuarios.some(u => u.email === email)) {
        alert("Já existe uma conta cadastrada com esse e-mail.");
        return;
    }

    usuarios.push({ nome, email, senha });
    setDB(DB_KEYS.USERS, usuarios);

    alert("Cadastro realizado com sucesso! Agora faça login.");
    abrirLogin();
}

function login() {
    const sessao = getSession();

    if (sessao) {
        // Usuário já logado: oferece logout
        const confirmaSaida = confirm(`Você está logado como ${sessao.nome}. Deseja sair?`);
        if (confirmaSaida) {
            clearSession();
            alert("Logout realizado com sucesso.");
        }
        return;
    }

    abrirLogin();
}

function abrirLogin() {
    criarModal(`
        <h2>Entrar</h2>
        <input type="email" id="log-email" placeholder="E-mail" style="${estiloInput}">
        <input type="password" id="log-senha" placeholder="Senha" style="${estiloInput}">
        <button id="btn-confirmar-login" style="${estiloBotaoPrimario}">Entrar</button>
        <p style="margin-top:15px; font-size: 14px;">
            Não tem conta?
            <a href="#" id="ir-para-cadastro" style="color: royalblue;">Cadastre-se</a>
        </p>
    `);

    document.getElementById("btn-confirmar-login").onclick = realizarLogin;
    document.getElementById("ir-para-cadastro").onclick = (e) => {
        e.preventDefault();
        abrirCadastro();
    };
}

function realizarLogin() {
    const email = document.getElementById("log-email").value.trim().toLowerCase();
    const senha = document.getElementById("log-senha").value;

    const usuarios = getDB(DB_KEYS.USERS);
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        alert("E-mail ou senha incorretos.");
        return;
    }

    setSession({ nome: usuario.nome, email: usuario.email });
    alert(`Bem-vindo(a), ${usuario.nome}!`);
    fecharModal();
}

function exigirLogin() {
    const sessao = getSession();
    if (!sessao) {
        alert("Você precisa estar logado para realizar essa ação.");
        abrirLogin();
        return null;
    }
    return sessao;
}

function abrirAvaliacao(nomeArtista) {
    const sessao = exigirLogin();
    if (!sessao) return;

    criarModal(`
        <h2>Avaliar ${nomeArtista}</h2>
        <div id="estrelas" style="font-size: 32px; margin-top: 15px; cursor: pointer;">
            <span data-valor="1">★</span>
            <span data-valor="2">★</span>
            <span data-valor="3">★</span>
            <span data-valor="4">★</span>
            <span data-valor="5">★</span>
        </div>
        <button id="btn-confirmar-avaliacao" style="${estiloBotaoPrimario}">Confirmar Avaliação</button>
    `);

    let notaSelecionada = 0;
    const estrelas = document.querySelectorAll("#estrelas span");

    estrelas.forEach(estrela => {
        estrela.style.color = "#555"; // não selecionada

        estrela.addEventListener("mouseenter", () => {
            pintarEstrelas(estrela.dataset.valor);
        });

        estrela.addEventListener("click", () => {
            notaSelecionada = Number(estrela.dataset.valor);
            pintarEstrelas(notaSelecionada);
        });
    });

    function pintarEstrelas(valor) {
        estrelas.forEach(e => {
            e.style.color = Number(e.dataset.valor) <= valor ? "royalblue" : "#555";
        });
    }

    document.getElementById("btn-confirmar-avaliacao").onclick = () => {
        if (notaSelecionada < 1 || notaSelecionada > 5) {
            alert("Selecione uma nota de 1 a 5 estrelas.");
            return;
        }
        salvarAvaliacao(nomeArtista, notaSelecionada, sessao.email);
    };
}

function salvarAvaliacao(nomeArtista, nota, emailUsuario) {
    const avaliacoes = getDB(DB_KEYS.RATINGS);
    const indexExistente = avaliacoes.findIndex(
        a => a.artista === nomeArtista && a.usuario === emailUsuario
    );

    if (indexExistente >= 0) {
        avaliacoes[indexExistente].nota = nota;
    } else {
        avaliacoes.push({ artista: nomeArtista, nota, usuario: emailUsuario });
    }

    setDB(DB_KEYS.RATINGS, avaliacoes);
    alert(`Você avaliou ${nomeArtista} com ${nota} estrela(s)!`);
    fecharModal();
}

function calcularMediaArtista(nomeArtista) {
    const avaliacoes = getDB(DB_KEYS.RATINGS).filter(a => a.artista === nomeArtista);
    if (avaliacoes.length === 0) return 0;

    const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
    return soma / avaliacoes.length;
}

const PALAVRAS_BLOQUEADAS = ["idiota", "burro", "lixo", "merda"];

function abrirComentario(nomeArtista) {
    const sessao = exigirLogin();
    if (!sessao) return;

    criarModal(`
        <h2>Comentar sobre ${nomeArtista}</h2>
        <textarea id="texto-comentario" placeholder="Escreva seu feedback..."
            style="${estiloInput} height: 100px; resize: vertical;"></textarea>
        <button id="btn-enviar-comentario" style="${estiloBotaoPrimario}">Enviar</button>
    `);

    document.getElementById("btn-enviar-comentario").onclick = () => {
        const texto = document.getElementById("texto-comentario").value.trim();

        if (!texto) {
            alert("Escreva algo antes de enviar.");
            return;
        }

        const textoLower = texto.toLowerCase();
        const contemPalavraBloqueada = PALAVRAS_BLOQUEADAS.some(p => textoLower.includes(p));

        if (contemPalavraBloqueada) {
            alert("Seu comentário contém termos inadequados e não pode ser publicado.");
            return;
        }

        const comentarios = getDB(DB_KEYS.COMMENTS);
        comentarios.push({
            id: Date.now(),
            artista: nomeArtista,
            usuario: sessao.nome,
            texto,
            denunciado: false,
        });
        setDB(DB_KEYS.COMMENTS, comentarios);

        alert("Comentário publicado com sucesso!");
        fecharModal();
    };
}

function buscarArtista() {
    const termo = prompt("Digite o nome do artista que deseja buscar:");
    if (termo === null) return;

    const termoLower = termo.trim().toLowerCase();

    ARTIST_CARDS.forEach(({ id, nome }) => {
        const card = document.getElementById(id);
        if (!card) return;

        const corresponde = termoLower === "" || nome.toLowerCase().includes(termoLower);
        card.style.display = corresponde ? "block" : "none";
    });

    if (termoLower !== "") {
        const algumVisivel = ARTIST_CARDS.some(({ nome }) =>
            nome.toLowerCase().includes(termoLower)
        );
        if (!algumVisivel) {
            alert("Nenhum artista encontrado com esse nome.");
        }
    }
}

function categoria() {
    const categoriasDisponiveis = [...new Set(
        ARTIST_CARDS.map(({ id }) => {
            const card = document.getElementById(id);
            return card?.querySelector(".categoria")?.textContent.trim();
        }).filter(Boolean)
    )];

    const escolha = prompt(
        "Filtrar por categoria:\n" + categoriasDisponiveis.join(", ") +
        "\n\n(Deixe em branco para mostrar todos)"
    );

    if (escolha === null) return;

    const escolhaLower = escolha.trim().toLowerCase();

    ARTIST_CARDS.forEach(({ id }) => {
        const card = document.getElementById(id);
        if (!card) return;

        const catCard = card.querySelector(".categoria")?.textContent.trim().toLowerCase();
        const corresponde = escolhaLower === "" || catCard === escolhaLower;
        card.style.display = corresponde ? "block" : "none";
    });
}

function filtrarPorAvaliacaoMinima() {
    const minimo = prompt("Mostrar apenas artistas com nota média a partir de quantas estrelas? (1 a 5)");
    if (minimo === null) return;

    const minimoNum = Number(minimo);
    if (isNaN(minimoNum) || minimoNum < 1 || minimoNum > 5) {
        alert("Digite um número de 1 a 5.");
        return;
    }

    ARTIST_CARDS.forEach(({ id, nome }) => {
        const card = document.getElementById(id);
        if (!card) return;

        const media = calcularMediaArtista(nome);
        card.style.display = media >= minimoNum ? "block" : "none";
    });
}

function topart() {
    const ranking = ARTIST_CARDS
        .map(({ nome }) => ({
            nome,
            media: calcularMediaArtista(nome),
            total: getDB(DB_KEYS.RATINGS).filter(a => a.artista === nome).length,
        }))
        .sort((a, b) => b.media - a.media);

    const listaHTML = ranking
        .map((item, i) =>
            `${i + 1}º - ${item.nome}: ${item.media.toFixed(1)} ★ (${item.total} avaliação(ões))`
        )
        .join("\n");

    criarModal(`
        <h2>🏆 Top Artistas</h2>
        <pre style="margin-top: 15px; white-space: pre-wrap; font-family: inherit; font-size: 15px;">${listaHTML}</pre>
    `);
}

function denunciarComentario(idComentario) {
    const sessao = exigirLogin();
    if (!sessao) return;

    const motivo = prompt("Por que você está denunciando este comentário?");
    if (motivo === null || motivo.trim() === "") return;

    const denuncias = getDB(DB_KEYS.REPORTS);
    denuncias.push({
        id: Date.now(),
        comentarioId: idComentario,
        denunciante: sessao.email,
        motivo,
    });
    setDB(DB_KEYS.REPORTS, denuncias);

    alert("Denúncia enviada para análise da moderação. Obrigado por ajudar a manter a comunidade segura.");
}

function abrirModeracao() {
    const denuncias = getDB(DB_KEYS.REPORTS);
    const comentarios = getDB(DB_KEYS.COMMENTS);

    if (denuncias.length === 0) {
        criarModal(`<h2>Moderação</h2><p style="margin-top:15px;">Nenhuma denúncia pendente.</p>`);
        return;
    }

    const itensHTML = denuncias
        .map(d => {
            const comentario = comentarios.find(c => c.id === d.comentarioId);
            const textoComentario = comentario ? comentario.texto : "(comentário já removido)";
            return `
                <div style="border-bottom: 1px solid #333; padding: 10px 0;">
                    <p><strong>Comentário:</strong> ${textoComentario}</p>
                    <p style="color: royalblue;"><strong>Motivo:</strong> ${d.motivo}</p>
                    <button data-denuncia="${d.id}" data-comentario="${d.comentarioId}"
                        class="btn-remover-comentario" style="${estiloBotaoPrimario} margin-top: 8px;">
                        Remover comentário
                    </button>
                </div>
            `;
        })
        .join("");

    criarModal(`<h2>Painel de Moderação</h2>${itensHTML}`);

    document.querySelectorAll(".btn-remover-comentario").forEach(btn => {
        btn.onclick = () => {
            removerComentarioDenunciado(
                Number(btn.dataset.comentario),
                Number(btn.dataset.denuncia)
            );
        };
    });
}

function removerComentarioDenunciado(comentarioId, denunciaId) {
    let comentarios = getDB(DB_KEYS.COMMENTS);
    comentarios = comentarios.filter(c => c.id !== comentarioId);
    setDB(DB_KEYS.COMMENTS, comentarios);

    let denuncias = getDB(DB_KEYS.REPORTS);
    denuncias = denuncias.filter(d => d.id !== denunciaId);
    setDB(DB_KEYS.REPORTS, denuncias);

    alert("Comentário removido com sucesso.");
    abrirModeracao();
}

function sobre() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function configurarBotoesPortfolio() {
    ARTIST_CARDS.forEach(({ id, nome }) => {
        const card = document.getElementById(id);
        if (!card) return;

        const botao = card.querySelector(".info button");
        if (!botao) return;

        botao.addEventListener("click", () => {
            const media = calcularMediaArtista(nome);
            const mediaTexto = media > 0 ? `${media.toFixed(1)} ★` : "Sem avaliações ainda";

            criarModal(`
                <h2>${nome}</h2>
                <p style="margin-top: 10px; color: royalblue;">Média atual: ${mediaTexto}</p>
                <button id="btn-ir-avaliar" style="${estiloBotaoPrimario}">⭐ Avaliar Artista</button>
                <button id="btn-ir-comentar" style="${estiloBotaoPrimario}">💬 Deixar Comentário</button>
            `);

            document.getElementById("btn-ir-avaliar").onclick = () => abrirAvaliacao(nome);
            document.getElementById("btn-ir-comentar").onclick = () => abrirComentario(nome);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    configurarBotoesPortfolio();
});