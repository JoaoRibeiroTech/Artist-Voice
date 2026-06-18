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

    // MELHORIA: agora o modal também fecha pressionando a tecla Esc,
    // que é o comportamento padrão esperado pelos usuários em qualquer
    // modal/popup. Antes só era possível fechar clicando no "✕" ou fora da caixa.
    document.addEventListener("keydown", fecharModalComEsc);
}

function fecharModalComEsc(e) {
    if (e.key === "Escape") {
        fecharModal();
    }
}

function fecharModal() {
    const existente = document.getElementById("av-modal-overlay");
    if (existente) existente.remove();

    // MELHORIA: remove o listener de Esc junto, para não acumular
    // múltiplos listeners idênticos cada vez que um modal é aberto/fechado.
    document.removeEventListener("keydown", fecharModalComEsc);
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

    // MELHORIA: agora dá para confirmar o cadastro apertando Enter em
    // qualquer um dos campos, e não só clicando no botão. Comportamento
    // padrão esperado em formulários.
    ["cad-nome", "cad-email", "cad-senha"].forEach(id => {
        document.getElementById(id).addEventListener("keydown", (e) => {
            if (e.key === "Enter") realizarCadastro();
        });
    });
}

function realizarCadastro() {
    const nome = document.getElementById("cad-nome").value.trim();
    const email = document.getElementById("cad-email").value.trim().toLowerCase();
    const senha = document.getElementById("cad-senha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos para se cadastrar.");
        return;
    }

    // MELHORIA: validação básica de formato de e-mail. Antes, qualquer
    // texto era aceito no campo de e-mail (ex: "abc"), o que não faz
    // sentido para um cadastro real.
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        alert("Digite um e-mail válido.");
        return;
    }

    // MELHORIA: tamanho mínimo de senha. O SRS não especifica regras de
    // senha, mas aceitar senhas de 1 caractere é uma falha óbvia de
    // usabilidade/segurança mesmo em um projeto acadêmico.
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
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

// MELHORIA: a função login() antes misturava duas responsabilidades
// (decidir entre logout ou abrir o modal de login). Agora cada
// comportamento tem sua própria função, o que facilita manutenção e leitura.
function login() {
    const sessao = getSession();

    if (sessao) {
        fazerLogout(sessao);
        return;
    }

    abrirLogin();
}

function fazerLogout(sessao) {
    const confirmaSaida = confirm(`Você está logado como ${sessao.nome}. Deseja sair?`);
    if (confirmaSaida) {
        clearSession();
        atualizarBotaoLogin();
        alert("Logout realizado com sucesso.");
    }
}

// MELHORIA: antes não havia nenhuma indicação visual de que o usuário
// estava logado — o botão "Sign in" sempre mostrava o mesmo texto. Agora
// o botão do header é atualizado para mostrar o nome de quem está logado.
function atualizarBotaoLogin() {
    const botaoLogin = document.querySelector(".btn-login");
    if (!botaoLogin) return;

    const sessao = getSession();
    botaoLogin.textContent = sessao ? `👤 ${sessao.nome}` : "👤 Sign in";
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

    // MELHORIA: mesmo recurso de Enter-to-submit aplicado ao login.
    ["log-email", "log-senha"].forEach(id => {
        document.getElementById(id).addEventListener("keydown", (e) => {
            if (e.key === "Enter") realizarLogin();
        });
    });
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

    // MELHORIA: atualiza o botão do header imediatamente após o login,
    // sem precisar recarregar a página.
    atualizarBotaoLogin();

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

    // MELHORIA: busca se o usuário já avaliou este artista antes, para
    // exibir a nota atual já marcada, em vez de sempre abrir zerado.
    const avaliacoes = getDB(DB_KEYS.RATINGS);
    const avaliacaoExistente = avaliacoes.find(
        a => a.artista === nomeArtista && a.usuario === sessao.email
    );
    let notaSelecionada = avaliacaoExistente ? avaliacaoExistente.nota : 0;

    criarModal(`
        <h2>Avaliar ${nomeArtista}</h2>
        ${avaliacaoExistente ? `<p style="color:#999; font-size:14px; margin-top:8px;">Você já avaliou este artista. Selecione uma nova nota para atualizar.</p>` : ""}
        <div id="estrelas" style="font-size: 32px; margin-top: 15px; cursor: pointer;">
            <span data-valor="1">★</span>
            <span data-valor="2">★</span>
            <span data-valor="3">★</span>
            <span data-valor="4">★</span>
            <span data-valor="5">★</span>
        </div>
        <button id="btn-confirmar-avaliacao" style="${estiloBotaoPrimario}">Confirmar Avaliação</button>
    `);

    const estrelas = document.querySelectorAll("#estrelas span");

    function pintarEstrelas(valor) {
        estrelas.forEach(e => {
            e.style.color = Number(e.dataset.valor) <= valor ? "royalblue" : "#555";
        });
    }

    // Pinta o estado inicial (zerado ou com a nota já existente)
    pintarEstrelas(notaSelecionada);

    estrelas.forEach(estrela => {
        estrela.addEventListener("mouseenter", () => {
            pintarEstrelas(estrela.dataset.valor);
        });

        estrela.addEventListener("click", () => {
            notaSelecionada = Number(estrela.dataset.valor);
            pintarEstrelas(notaSelecionada);
        });
    });

    // MELHORIA: ao tirar o mouse de cima das estrelas sem clicar, elas
    // voltavam pintadas com o valor do hover (bug). Agora, ao sair da
    // área, repinta de volta para a nota realmente selecionada.
    document.getElementById("estrelas").addEventListener("mouseleave", () => {
        pintarEstrelas(notaSelecionada);
    });

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

// MELHORIA: o filtro antigo usava textoLower.includes(palavra), que
// bloqueia até substrings inofensivas dentro de outras palavras maiores.
// Agora usamos regex com \b (borda de palavra), então só bloqueia a
// palavra inteira, não qualquer trecho de texto que a contenha.
function contemPalavraBloqueada(texto) {
    const textoLower = texto.toLowerCase();
    return PALAVRAS_BLOQUEADAS.some(palavra => {
        const regex = new RegExp(`\\b${palavra}\\b`, "i");
        return regex.test(textoLower);
    });
}

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

        // MELHORIA: troca da verificação ingênua por contemPalavraBloqueada(),
        // que usa borda de palavra (\b) em vez de simples includes().
        if (contemPalavraBloqueada(texto)) {
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

        // MELHORIA: antes os comentários eram só salvos no localStorage e
        // nunca apareciam em lugar nenhum da página. Agora, depois de
        // publicar, a lista de comentários do card correspondente é
        // atualizada na tela imediatamente (resolve RF04 de fato).
        renderizarComentarios(nomeArtista);

        alert("Comentário publicado com sucesso!");
        fecharModal();
    };
}

// =====================================================================
// MELHORIA (peça antes ausente): renderiza na tela os comentários de um
// artista, dentro do container .lista-comentarios do card correspondente.
// Sem isso, RF04 (publicação de comentários) ficava incompleto — os
// comentários eram salvos mas nunca visíveis — e RF08/RF09 (denúncia e
// moderação) ficavam desconectados da interface, pois não havia nenhum
// comentário visível para denunciar.
// =====================================================================
function renderizarComentarios(nomeArtista) {
    const cardInfo = ARTIST_CARDS.find(c => c.nome === nomeArtista);
    if (!cardInfo) return;

    const card = document.getElementById(cardInfo.id);
    if (!card) return;

    const container = card.querySelector(".lista-comentarios");
    if (!container) return;

    const comentarios = getDB(DB_KEYS.COMMENTS).filter(c => c.artista === nomeArtista);

    if (comentarios.length === 0) {
        container.innerHTML = `<p style="color:#999; font-size:13px;">Nenhum comentário ainda.</p>`;
        return;
    }

    container.innerHTML = comentarios
        .map(c => `
            <div class="comentario-item" data-id="${c.id}">
                <span class="comentario-autor">${escaparHTML(c.usuario)}:</span>
                <span>${escaparHTML(c.texto)}</span>
                <br>
                <button class="btn-denunciar" data-id="${c.id}">Denunciar</button>
            </div>
        `)
        .join("");

    container.querySelectorAll(".btn-denunciar").forEach(btn => {
        btn.onclick = () => denunciarComentario(Number(btn.dataset.id));
    });
}

// MELHORIA: pequena função de segurança. Os comentários eram inseridos
// direto via innerHTML com o texto do usuário, o que abre brecha para
// XSS (ex.: um usuário comentando "<img src=x onerror=alert(1)>"). Essa
// função escapa caracteres especiais de HTML antes de exibir.
function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

// MELHORIA: renderiza os comentários de todos os artistas já existentes
// assim que a página carrega, e não só depois de publicar um novo.
function renderizarTodosComentarios() {
    ARTIST_CARDS.forEach(({ nome }) => renderizarComentarios(nome));
}

// =====================================================================
// MELHORIA: antes, buscarArtista(), categoria() e filtrarPorAvaliacaoMinima()
// cada uma resetava o display dos cards do zero, então usar uma depois da
// outra fazia o filtro anterior ser perdido (ex.: buscar por nome e depois
// filtrar por categoria limpava a busca). Agora existe um único objeto de
// estado com os 3 filtros, e uma função central que aplica todos juntos.
// =====================================================================
const filtrosAtivos = {
    busca: "",
    categoria: "",
    notaMinima: 0,
};

function aplicarFiltros() {
    ARTIST_CARDS.forEach(({ id, nome }) => {
        const card = document.getElementById(id);
        if (!card) return;

        const catCard = card.querySelector(".categoria")?.textContent.trim().toLowerCase() || "";
        const media = calcularMediaArtista(nome);

        const passaBusca = filtrosAtivos.busca === "" ||
            nome.toLowerCase().includes(filtrosAtivos.busca);

        const passaCategoria = filtrosAtivos.categoria === "" ||
            catCard === filtrosAtivos.categoria;

        const passaNota = filtrosAtivos.notaMinima === 0 ||
            media >= filtrosAtivos.notaMinima;

        const visivel = passaBusca && passaCategoria && passaNota;
        card.style.display = visivel ? "block" : "none";
    });
}

function buscarArtista() {
    const termo = prompt("Digite o nome do artista que deseja buscar:");
    if (termo === null) return;

    filtrosAtivos.busca = termo.trim().toLowerCase();
    aplicarFiltros();

    if (filtrosAtivos.busca !== "") {
        const algumVisivel = ARTIST_CARDS.some(({ nome }) =>
            nome.toLowerCase().includes(filtrosAtivos.busca)
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

    // MELHORIA: agora só atualiza o filtro de categoria no estado
    // compartilhado e chama aplicarFiltros(), preservando busca e nota
    // mínima que já estivessem ativos.
    filtrosAtivos.categoria = escolha.trim().toLowerCase();
    aplicarFiltros();
}

function filtrarPorAvaliacaoMinima() {
    const minimo = prompt("Mostrar apenas artistas com nota média a partir de quantas estrelas? (1 a 5)");
    if (minimo === null) return;

    const minimoNum = Number(minimo);
    if (isNaN(minimoNum) || minimoNum < 1 || minimoNum > 5) {
        alert("Digite um número de 1 a 5.");
        return;
    }

    // MELHORIA: idem acima — preserva busca e categoria já ativas.
    filtrosAtivos.notaMinima = minimoNum;
    aplicarFiltros();
}

function topart() {
    const ranking = ARTIST_CARDS
        .map(({ nome }) => ({
            nome,
            media: calcularMediaArtista(nome),
            total: getDB(DB_KEYS.RATINGS).filter(a => a.artista === nome).length,
        }))
        .sort((a, b) => b.media - a.media);

    // MELHORIA: antes a lista era exibida em uma <pre> de texto puro,
    // visualmente destoante do resto do site (que usa cards arredondados
    // em preto/royalblue). Agora cada posição do ranking é um mini-card
    // com o mesmo estilo visual do restante da página.
    const itensHTML = ranking
        .map((item, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center;
                        background: rgba(255,255,255,0.07); border-radius: 10px;
                        padding: 10px 14px; margin-top: 10px;">
                <span><strong style="color: royalblue;">${i + 1}º</strong> &nbsp; ${escaparHTML(item.nome)}</span>
                <span>${item.media > 0 ? item.media.toFixed(1) + " ★" : "—"}</span>
            </div>
        `)
        .join("");

    criarModal(`
        <h2>🏆 Top Artistas</h2>
        ${itensHTML}
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
    // MELHORIA: precisamos saber de qual artista era o comentário ANTES de
    // removê-lo, para poder atualizar a lista exibida no card certo depois.
    const comentarios = getDB(DB_KEYS.COMMENTS);
    const comentarioRemovido = comentarios.find(c => c.id === comentarioId);

    let comentariosAtualizados = comentarios.filter(c => c.id !== comentarioId);
    setDB(DB_KEYS.COMMENTS, comentariosAtualizados);

    let denuncias = getDB(DB_KEYS.REPORTS);
    denuncias = denuncias.filter(d => d.id !== denunciaId);
    setDB(DB_KEYS.REPORTS, denuncias);

    // MELHORIA: atualiza a lista de comentários exibida no card do
    // artista correspondente, para refletir a remoção imediatamente.
    if (comentarioRemovido) {
        renderizarComentarios(comentarioRemovido.artista);
    }

    alert("Comentário removido com sucesso.");
    abrirModeracao();
}

function sobre() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function abrirModalComentarios(nomeArtista) {
    const comentarios = getDB(DB_KEYS.COMMENTS).filter(c => c.artista === nomeArtista);

    const listaHTML = comentarios.length === 0
        ? `<p style="color:#999; margin-top:15px;">Nenhum comentário ainda. Seja o primeiro!</p>`
        : comentarios.map(c => `
            <div style="background: rgba(255,255,255,0.07); border-radius: 10px;
                        padding: 12px; margin-top: 12px;">
                <p style="color: royalblue; font-weight: bold; font-size: 14px;">
                    ${escaparHTML(c.usuario)}
                </p>
                <p style="margin-top: 6px; font-size: 15px; line-height: 1.4;">
                    ${escaparHTML(c.texto)}
                </p>
                <button class="btn-denunciar-modal" data-id="${c.id}"
                    style="background: none; border: none; color: #666; font-size: 12px;
                           cursor: pointer; text-decoration: underline; margin-top: 8px; padding: 0;">
                    ⚑ Denunciar comentário
                </button>
            </div>
        `).join("");

    criarModal(`
        <h2>💬 Comentários — ${escaparHTML(nomeArtista)}</h2>
        ${listaHTML}
        <button id="btn-comentar-do-modal" style="${estiloBotaoPrimario}">
            ✏️ Deixar um Comentário
        </button>
    `);

    // Botões de denúncia dentro do modal de comentários
    document.querySelectorAll(".btn-denunciar-modal").forEach(btn => {
        btn.onclick = () => denunciarComentario(Number(btn.dataset.id));
    });

    // Botão para comentar sem fechar o modal de visualização
    document.getElementById("btn-comentar-do-modal").onclick = () => abrirComentario(nomeArtista);
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

            // MELHORIA: o modal de ações agora também mostra quantos
            // comentários o artista já tem, dando mais contexto ao
            // usuário antes de decidir avaliar ou comentar.
            const totalComentarios = getDB(DB_KEYS.COMMENTS).filter(c => c.artista === nome).length;

            criarModal(`
                <h2>${nome}</h2>
                <p style="margin-top: 10px; color: royalblue;">Média atual: ${mediaTexto}</p>
                <p style="margin-top: 4px; color: #999; font-size: 14px;">${totalComentarios} comentário(s)</p>
                <button id="btn-ir-avaliar" style="${estiloBotaoPrimario}">⭐ Avaliar Artista</button>
                <button id="btn-ir-comentar" style="${estiloBotaoPrimario}">💬 Deixar Comentário</button>
                <button id="btn-ver-comentarios" style="${estiloBotaoPrimario} background-color: transparent; border: 1px solid royalblue; color: royalblue;">
                    🗨️ Ver Comentários (${totalComentarios})
                </button>
            `);

            document.getElementById("btn-ir-avaliar").onclick = () => abrirAvaliacao(nome);
            document.getElementById("btn-ir-comentar").onclick = () => abrirComentario(nome);
            document.getElementById("btn-ver-comentarios").onclick = () => abrirModalComentarios(nome);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    configurarBotoesPortfolio();

    // MELHORIA: ao carregar a página, renderiza os comentários já
    // existentes em cada card (antes nada era exibido até o usuário
    // comentar algo na mesma sessão) e atualiza o texto do botão de
    // login caso já exista uma sessão salva.
    renderizarTodosComentarios();
    atualizarBotaoLogin();
});