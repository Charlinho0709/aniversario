const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =============================================
// ELEMENTOS
// =============================================

const loginArea =
    document.getElementById("loginArea");

const adminArea =
    document.getElementById("adminArea");

const formLogin =
    document.getElementById("formLogin");

const campoEmail =
    document.getElementById("email");

const campoSenha =
    document.getElementById("senha");

const btnLogin =
    document.getElementById("btnLogin");

const btnLogout =
    document.getElementById("btnLogout");

const btnAtualizar =
    document.getElementById("btnAtualizar");

const btnDownload =
    document.getElementById("btnDownload");

const loginStatus =
    document.getElementById("loginStatus");

const adminStatus =
    document.getElementById("adminStatus");

const listaConfirmados =
    document.getElementById("listaConfirmados");


let confirmacoes = [];


// =============================================
// INICIALIZAÇÃO
// =============================================

iniciar();


async function iniciar() {

    const {
        data
    } = await supabaseClient.auth.getSession();


    if (
        data.session &&
        data.session.user
    ) {

        if (
            data.session.user.id ===
            ADMIN_USER_ID
        ) {

            abrirAdmin();

            await carregarConfirmacoes();

            return;

        }


        await supabaseClient.auth.signOut();

    }


    abrirLogin();

}


// =============================================
// LOGIN
// =============================================

formLogin.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        limparLoginStatus();


        const email =
            campoEmail.value.trim();

        const password =
            campoSenha.value;


        btnLogin.disabled =
            true;

        btnLogin.textContent =
            "🔐 IDENTIFICANDO...";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .auth
                .signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                throw error;

            }


            if (
                !data.user ||
                data.user.id !== ADMIN_USER_ID
            ) {

                await supabaseClient
                    .auth
                    .signOut();


                mostrarLoginErro(
                    "Este usuário não possui acesso administrativo."
                );

                return;

            }


            campoSenha.value =
                "";


            abrirAdmin();

            await carregarConfirmacoes();


        } catch (erro) {

            console.error(
                erro
            );

            mostrarLoginErro(
                "E-mail ou senha inválidos."
            );

        } finally {

            btnLogin.disabled =
                false;

            btnLogin.textContent =
                "🔐 ENTRAR";

        }

    }
);


// =============================================
// LOGOUT
// =============================================

btnLogout.addEventListener(
    "click",
    async function () {

        await supabaseClient
            .auth
            .signOut();


        confirmacoes =
            [];


        abrirLogin();

    }
);


// =============================================
// ATUALIZAR
// =============================================

btnAtualizar.addEventListener(
    "click",
    carregarConfirmacoes
);


// =============================================
// BAIXAR TXT
// =============================================

btnDownload.addEventListener(
    "click",
    baixarTXT
);


// =============================================
// CARREGAR CONFIRMAÇÕES
// =============================================

async function carregarConfirmacoes() {

    mostrarAdminStatus(
        "Carregando tripulação...",
        false
    );


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("confirmacoes")
            .select(`
                id,
                nome,
                quantidade_acompanhantes,
                nomes_acompanhantes,
                telefone,
                observacao,
                created_at
            `)
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            throw error;

        }


        confirmacoes =
            data || [];


        renderizarTabela();

        calcularTotais();


        esconderAdminStatus();


    } catch (erro) {

        console.error(
            erro
        );


        mostrarAdminStatus(
            "Não foi possível carregar as confirmações.",
            true
        );

    }

}


// =============================================
// TABELA
// =============================================

function renderizarTabela() {

    listaConfirmados.innerHTML =
        "";


    if (
        confirmacoes.length === 0
    ) {

        const linha =
            document.createElement("tr");


        const coluna =
            document.createElement("td");


        coluna.colSpan =
            6;

        coluna.className =
            "empty-table";

        coluna.textContent =
            "Nenhuma missão confirmada ainda.";


        linha.appendChild(
            coluna
        );


        listaConfirmados.appendChild(
            linha
        );


        return;

    }


    confirmacoes.forEach(
        function (convidado) {

            const linha =
                document.createElement("tr");


            adicionarCelula(
                linha,
                convidado.nome
            );


            adicionarCelula(
                linha,
                convidado.quantidade_acompanhantes || 0
            );


            adicionarCelula(
                linha,
                convidado.nomes_acompanhantes || "-"
            );


            adicionarCelula(
                linha,
                convidado.telefone || "-"
            );


            adicionarCelula(
                linha,
                convidado.observacao || "-"
            );


            adicionarCelula(
                linha,
                formatarData(
                    convidado.created_at
                )
            );


            listaConfirmados.appendChild(
                linha
            );

        }
    );

}


function adicionarCelula(
    linha,
    texto
) {

    const coluna =
        document.createElement("td");


    coluna.textContent =
        texto;


    linha.appendChild(
        coluna
    );

}


// =============================================
// TOTAIS
// =============================================

function calcularTotais() {

    const quantidadeConfirmacoes =
        confirmacoes.length;


    let totalAcompanhantes =
        0;


    confirmacoes.forEach(
        function (item) {

            totalAcompanhantes +=
                Number(
                    item.quantidade_acompanhantes || 0
                );

        }
    );


    const totalPessoas =
        quantidadeConfirmacoes +
        totalAcompanhantes;


    document.getElementById(
        "totalConfirmacoes"
    ).textContent =
        quantidadeConfirmacoes;


    document.getElementById(
        "totalAcompanhantes"
    ).textContent =
        totalAcompanhantes;


    document.getElementById(
        "totalPessoas"
    ).textContent =
        totalPessoas;

}


// =============================================
// TXT
// =============================================

function baixarTXT() {

    if (
        confirmacoes.length === 0
    ) {

        alert(
            "Não existem confirmações para baixar."
        );

        return;

    }


    let totalAcompanhantes =
        0;


    let texto =
`LISTA DE CONFIRMADOS
========================================

Data: ${FESTA.data}
Horário: ${FESTA.horario}
Local: ${FESTA.endereco}

========================================

`;


    confirmacoes.forEach(
        function (convidado, index) {

            const acompanhantes =
                Number(
                    convidado.quantidade_acompanhantes || 0
                );


            totalAcompanhantes +=
                acompanhantes;


            texto +=
`${index + 1}. ${convidado.nome}
Acompanhantes: ${acompanhantes}
`;


            if (
                convidado.nomes_acompanhantes
            ) {

                texto +=
`Nomes: ${convidado.nomes_acompanhantes}
`;

            }


            if (
                convidado.telefone
            ) {

                texto +=
`Telefone: ${convidado.telefone}
`;

            }


            if (
                convidado.observacao
            ) {

                texto +=
`Mensagem: ${convidado.observacao}
`;

            }


            texto +=
`Confirmado em: ${formatarData(convidado.created_at)}

----------------------------------------

`;

        }
    );


    const totalPessoas =
        confirmacoes.length +
        totalAcompanhantes;


    texto +=
`RESUMO
========================================

Confirmações: ${confirmacoes.length}
Acompanhantes: ${totalAcompanhantes}
TOTAL DE PESSOAS: ${totalPessoas}
`;


    const blob =
        new Blob(
            [texto],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;

    link.download =
        "confirmados.txt";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =============================================
// DATA
// =============================================

function formatarData(data) {

    if (!data) {

        return "-";

    }


    return new Date(data)
        .toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

}


// =============================================
// INTERFACE
// =============================================

function abrirLogin() {

    loginArea.style.display =
        "block";

    adminArea.style.display =
        "none";

}


function abrirAdmin() {

    loginArea.style.display =
        "none";

    adminArea.style.display =
        "block";

}


function mostrarLoginErro(
    mensagem
) {

    loginStatus.textContent =
        mensagem;

    loginStatus.className =
        "status error";

    loginStatus.style.display =
        "block";

}


function limparLoginStatus() {

    loginStatus.style.display =
        "none";

}


function mostrarAdminStatus(
    mensagem,
    erro
) {

    adminStatus.textContent =
        mensagem;

    adminStatus.className =
        erro
            ? "status error"
            : "status info";

    adminStatus.style.display =
        "block";

}


function esconderAdminStatus() {

    adminStatus.style.display =
        "none";

}