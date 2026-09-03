// =============================================
// CLIENTE SUPABASE
// =============================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }
);


// =============================================
// ELEMENTOS
// =============================================

const form = document.getElementById("formConfirmacao");

const campoNome =
    document.getElementById("nome");

const campoAcompanhantes =
    document.getElementById("acompanhantes");

const campoNomesAcompanhantes =
    document.getElementById("nomesAcompanhantes");

const grupoNomesAcompanhantes =
    document.getElementById("grupoNomesAcompanhantes");

const campoTelefone =
    document.getElementById("telefone");

const campoObservacao =
    document.getElementById("observacao");

const btnConfirmar =
    document.getElementById("btnConfirmar");

const status =
    document.getElementById("status");

const sucesso =
    document.getElementById("sucesso");


// =============================================
// DADOS DA FESTA
// =============================================

document.getElementById("festaData").textContent =
    FESTA.data;

document.getElementById("festaHorario").textContent =
    FESTA.horario;

document.getElementById("festaEndereco").textContent =
    FESTA.endereco;

document.getElementById("sucessoData").textContent =
    FESTA.data;

document.getElementById("sucessoHorario").textContent =
    FESTA.horario;


// =============================================
// ACOMPANHANTES
// =============================================

campoAcompanhantes.addEventListener(
    "change",
    function () {

        const quantidade =
            Number(campoAcompanhantes.value);

        if (quantidade > 0) {

            grupoNomesAcompanhantes.style.display =
                "block";

            campoNomesAcompanhantes.required =
                true;

        } else {

            grupoNomesAcompanhantes.style.display =
                "none";

            campoNomesAcompanhantes.required =
                false;

            campoNomesAcompanhantes.value =
                "";

        }

    }
);


// =============================================
// CONFIRMAR
// =============================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        limparStatus();


        const nome =
            campoNome.value.trim();

        const quantidade =
            Number(campoAcompanhantes.value);

        const nomesAcompanhantes =
            campoNomesAcompanhantes.value.trim();

        const telefone =
            campoTelefone.value.trim();

        const observacao =
            campoObservacao.value.trim();


        if (!nome) {

            mostrarErro(
                "Informe o seu nome."
            );

            return;
        }


        if (
            quantidade > 0 &&
            !nomesAcompanhantes
        ) {

            mostrarErro(
                "Informe o nome dos acompanhantes."
            );

            return;
        }


        bloquearFormulario(true);


        try {

            const {
                error
            } = await supabaseClient
                .from("confirmacoes")
                .insert({
                    nome: nome,
                    quantidade_acompanhantes: quantidade,
                    nomes_acompanhantes:
                        nomesAcompanhantes || null,
                    telefone:
                        telefone || null,
                    observacao:
                        observacao || null
                });


            if (error) {

                console.error(
                    "Erro Supabase:",
                    error
                );

                throw error;

            }


            mostrarSucesso();


        } catch (erro) {

            console.error(erro);

            mostrarErro(
                "Não conseguimos registrar sua presença. " +
                "Verifique sua conexão e tente novamente."
            );


            bloquearFormulario(false);

        }

    }
);


// =============================================
// FUNÇÕES
// =============================================

function bloquearFormulario(bloquear) {

    const elementos =
        form.querySelectorAll(
            "input, select, textarea, button"
        );


    elementos.forEach(
        function (elemento) {

            elemento.disabled =
                bloquear;

        }
    );


    if (bloquear) {

        btnConfirmar.textContent =
            "🚀 REGISTRANDO MISSÃO...";

    } else {

        btnConfirmar.textContent =
            "🚀 CONFIRMAR PRESENÇA";

    }

}


function mostrarSucesso() {

    form.style.display =
        "none";

    status.style.display =
        "none";

    sucesso.style.display =
        "block";

}


function mostrarErro(mensagem) {

    status.textContent =
        mensagem;

    status.className =
        "status error";

    status.style.display =
        "block";

}


function limparStatus() {

    status.textContent =
        "";

    status.style.display =
        "none";

}