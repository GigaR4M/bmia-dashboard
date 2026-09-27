'use client'

import { useState, useMemo } from 'react'
import {
    TerminalSquare,
    Search,
    Swords,
    Tag,
    ShieldAlert,
    Gift,
    Trophy,
    Gamepad2,
    Sliders,
    Settings,
    HelpCircle,
    Copy,
    Check,
    Sparkles,
    ShieldCheck,
    Bot,
    MousePointerClick,
    Zap,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandParam {
    name: string
    description: string
    required: boolean
    type?: string
}

interface CommandItem {
    name: string
    syntax: string
    description: string
    detailedExplanation: string
    category: string
    categoryId: string
    permission: 'everyone' | 'moderator' | 'admin'
    type: 'slash' | 'context' | 'automod'
    params?: CommandParam[]
    example?: string
    tags?: string[]
}

interface CommandCategory {
    id: string
    name: string
    icon: any
    color: string
    borderAccent: string
    description: string
}

const CATEGORIES: CommandCategory[] = [
    {
        id: 'tournaments',
        name: 'Torneios & Campeonatos',
        icon: Swords,
        color: 'text-cyan-400',
        borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
        description: 'Gestão de torneios multijogo (1v1 a 5v5, Mata-mata e Pontos Corridos), geração de brackets visuais, sorteios de chaves e pódios.'
    },
    {
        id: 'steam',
        name: 'Steam & Jogos Monitorados',
        icon: Tag,
        color: 'text-emerald-400',
        borderAccent: 'border-emerald-500/40 hover:border-emerald-400/80',
        description: 'Calendário de festivais Steamworks e monitoramento de jogos da comunidade com histórico de menor preço.'
    },
    {
        id: 'security',
        name: 'Segurança, Dossiê & Moderação',
        icon: ShieldAlert,
        color: 'text-rose-400',
        borderAccent: 'border-rose-500/40 hover:border-rose-400/80',
        description: 'Dossiês confidenciais com Trust Score, denúncias por clique direito com deleção automática e AutoMod por IA Gemini.'
    },
    {
        id: 'giveaways',
        name: 'Sorteios & Premiações',
        icon: Gift,
        color: 'text-purple-400',
        borderAccent: 'border-purple-500/40 hover:border-purple-400/80',
        description: 'Criação e gerenciamento de sorteios com temporizador, apuração de ganhadores, rerolls e cancelamento.'
    },
    {
        id: 'stats',
        name: 'XP, Rank Cards & Estatísticas',
        icon: Trophy,
        color: 'text-yellow-400',
        borderAccent: 'border-yellow-500/40 hover:border-yellow-400/80',
        description: 'Rank Cards em imagem, pontuação por mensagens e voz, leaderboards persistentes, retrospectiva de destaques e gestão de XP.'
    },
    {
        id: 'games',
        name: 'Jogos & Enciclopédia RAWG',
        icon: Gamepad2,
        color: 'text-indigo-400',
        borderAccent: 'border-indigo-500/40 hover:border-indigo-400/80',
        description: 'Busca de fichas técnicas no RAWG com autocomplete em tempo real e rankings de jogos mais jogados no servidor.'
    },
    {
        id: 'roles',
        name: 'Cargos Automáticos',
        icon: Sliders,
        color: 'text-pink-400',
        borderAccent: 'border-pink-500/40 hover:border-pink-400/80',
        description: 'Configuração e sincronização automática de cargos atribuídos por nível de XP ou tempo de casa (dias no servidor).'
    },
    {
        id: 'config',
        name: 'Configurações & Moderação IA',
        icon: Settings,
        color: 'text-amber-400',
        borderAccent: 'border-amber-500/40 hover:border-amber-400/80',
        description: 'Configuração de canais pontuáveis, canais ignorados, canal de alertas da moderação e ativação do filtro de IA.'
    },
    {
        id: 'utils',
        name: 'Utilidades, GIFs & Info',
        icon: HelpCircle,
        color: 'text-sky-400',
        borderAccent: 'border-sky-500/40 hover:border-sky-400/80',
        description: 'Pesquisa rápida de GIFs animados via Giphy e guia explicativo do sistema de pontos.'
    }
]

const COMMANDS: CommandItem[] = [
    // ==========================================
    // 1. TORNEIOS & CAMPEONATOS (/torneio ...)
    // ==========================================
    {
        name: '/torneio criar',
        syntax: '/torneio criar [nome] [jogo] [formato] [tipo] [vagas] [premio] [canal]',
        description: 'Cria um novo torneio com embed interativo e botões de inscrição no canal.',
        detailedExplanation: 'Inicia um campeonato definindo formato (1v1 a 5v5), modalidade (Mata-mata ou Pontos Corridos), limite de 2 a 32 participantes, premiação opcional e canal de anúncios.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'nome', description: 'Nome oficial do torneio', required: true, type: 'texto' },
            { name: 'jogo', description: 'Jogo disputado', required: true, type: 'texto' },
            { name: 'formato', description: 'Formato do time (1v1, 2v2, 3v3, 4v4, 5v5)', required: true, type: 'opção' },
            { name: 'tipo', description: 'Mata-mata (eliminatórias) ou Pontos Corridos (liga)', required: true, type: 'opção' },
            { name: 'vagas', description: 'Quantidade máxima de vagas (2 a 32)', required: true, type: 'número' },
            { name: 'premio', description: 'Premiação do torneio (opcional)', required: false, type: 'texto' },
            { name: 'canal', description: 'Canal onde o painel será enviado (opcional)', required: false, type: 'canal' }
        ],
        example: '/torneio criar nome: Torneio de Verão jogo: Rocket League formato: 2v2 tipo: Mata-mata vagas: 8 premio: VIP 30 dias',
        tags: ['Torneios', 'Inscrições', 'Esports']
    },
    {
        name: '/torneio formulario',
        syntax: '/torneio formulario',
        description: 'Abre o assistente com formulário visual (Modal) para criar um torneio.',
        detailedExplanation: 'Abre uma janela modal intuitiva para preencher todos os dados do campeonato sem precisar digitar os parâmetros na linha de comando.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        example: '/torneio formulario',
        tags: ['Modal Interativo', 'Assistente']
    },
    {
        name: '/torneio resultado',
        syntax: '/torneio resultado [partida_id]',
        description: 'Abre modal para lançar placar e classificação da partida.',
        detailedExplanation: 'Interface visual para moderadores registrarem pontuações detalhadas de confrontos de mata-mata ou rodadas de liga.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'partida_id', description: 'ID da partida que deseja registrar o resultado', required: true, type: 'número' }
        ],
        example: '/torneio resultado partida_id: 12',
        tags: ['Placar', 'Modal']
    },
    {
        name: '/torneio chaveamento',
        syntax: '/torneio chaveamento [torneio_id]',
        description: 'Gera a imagem oficial do chaveamento/bracket do torneio (Mata-Mata).',
        detailedExplanation: 'Renderiza graficamente a árvore de confrontos completa com avanço de vencedores até a grande final.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio (opcional se houver apenas um ativo)', required: false, type: 'número' }
        ],
        example: '/torneio chaveamento torneio_id: 1',
        tags: ['Bracket', 'Imagem Visual']
    },
    {
        name: '/torneio tabela',
        syntax: '/torneio tabela [torneio_id]',
        description: 'Gera a imagem oficial da tabela de classificação da liga (Pontos Corridos).',
        detailedExplanation: 'Renderiza a tabela com jogos, vitórias, empates, derrotas, saldo e pontuação acumulada de cada participante.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio de liga', required: false, type: 'número' }
        ],
        example: '/torneio tabela torneio_id: 2',
        tags: ['Classificação', 'Liga']
    },
    {
        name: '/torneio sortear',
        syntax: '/torneio sortear [torneio_id]',
        description: 'Sorteia aleatoriamente as chaves eliminatórias ou rodadas da liga.',
        detailedExplanation: 'Distribui os competidores ou duplas inscritas nas chaves e gera as partidas da primeira rodada.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio a ser sorteado', required: true, type: 'número' }
        ],
        example: '/torneio sortear torneio_id: 1',
        tags: ['Sorteio de Chaves', 'Staff Only']
    },
    {
        name: '/torneio partida',
        syntax: '/torneio partida [partida_id] [vencedor] [placar]',
        description: 'Registra o placar de uma partida e avança a fase ou pontua na liga.',
        detailedExplanation: 'Define o vencedor do confronto, atualiza o placar e avança automaticamente o ganhador para a próxima fase no chaveamento.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'partida_id', description: 'ID numérico da partida', required: true, type: 'número' },
            { name: 'vencedor', description: 'Membro ou capitão vencedor', required: true, type: 'usuário' },
            { name: 'placar', description: 'Placar final (ex: 2x1, 16-10)', required: false, type: 'texto' }
        ],
        example: '/torneio partida partida_id: 5 vencedor: @Player placar: 2x0',
        tags: ['Avanço Automático', 'Partidas']
    },
    {
        name: '/torneio status',
        syntax: '/torneio status [torneio_id]',
        description: 'Exibe detalhes completos, regras e lista de inscritos de um torneio.',
        detailedExplanation: 'Mostra o status atual das inscrições, competidores cadastrados, duplas formadas e histórico de rodadas.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio', required: false, type: 'número' }
        ],
        example: '/torneio status torneio_id: 1',
        tags: ['Inscritos', 'Detalhes']
    },
    {
        name: '/torneio rodadas',
        syntax: '/torneio rodadas [torneio_id] [rodada]',
        description: 'Exibe o calendário de jogos e resultados das rodadas da liga.',
        detailedExplanation: 'Lista os confrontos programados e encerrados de uma rodada específica em torneios de pontos corridos.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio', required: false, type: 'número' },
            { name: 'rodada', description: 'Número da rodada', required: false, type: 'número' }
        ],
        example: '/torneio rodadas torneio_id: 2 rodada: 1',
        tags: ['Rodadas', 'Liga']
    },
    {
        name: '/torneio listar',
        syntax: '/torneio listar [status] [jogo]',
        description: 'Lista os torneios abertos ou recentes do servidor.',
        detailedExplanation: 'Exibe todos os campeonatos cadastrados com filtros opcionais por estado (open, active, finished) e jogo.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'status', description: 'Filtrar por status (open, active, finished)', required: false, type: 'opção' },
            { name: 'jogo', description: 'Filtrar por nome do jogo', required: false, type: 'texto' }
        ],
        example: '/torneio listar status: open',
        tags: ['Histórico', 'Listagem']
    },
    {
        name: '/torneio halldafama',
        syntax: '/torneio halldafama [jogo]',
        description: 'Exibe os maiores campeões e medalhistas de torneios do servidor.',
        detailedExplanation: 'Mostra o ranking histórico de títulos (ouro, prata e bronze) acumulados pelos membros da comunidade.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'jogo', description: 'Filtrar histórico por jogo específico', required: false, type: 'texto' }
        ],
        example: '/torneio halldafama',
        tags: ['Hall da Fama', 'Pódio']
    },
    {
        name: '/torneio encerrar',
        syntax: '/torneio encerrar [torneio_id] [vencedor] [segundo] [terceiro]',
        description: 'Encerra um torneio, define o pódio oficial e distribui pontos de XP.',
        detailedExplanation: 'Finaliza o campeonato, grava os campeões no banco de dados e concede as pontuações de premiação.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio a encerrar', required: true, type: 'número' },
            { name: 'vencedor', description: 'Membro campeão (1º lugar)', required: true, type: 'usuário' },
            { name: 'segundo', description: 'Membro vice-campeão (2º lugar)', required: false, type: 'usuário' },
            { name: 'terceiro', description: 'Membro em 3º lugar', required: false, type: 'usuário' }
        ],
        example: '/torneio encerrar torneio_id: 1 vencedor: @Ganhador segundo: @Vice',
        tags: ['Encerramento', 'Premiação']
    },
    {
        name: '/torneio cancelar',
        syntax: '/torneio cancelar [torneio_id] [motivo]',
        description: 'Cancela um torneio aberto ou em andamento.',
        detailedExplanation: 'Cancela o campeonato e notifica os participantes com a justificativa informada.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio', required: true, type: 'número' },
            { name: 'motivo', description: 'Motivo do cancelamento (opcional)', required: false, type: 'texto' }
        ],
        example: '/torneio cancelar torneio_id: 3 motivo: Falta de quórum',
        tags: ['Cancelamento', 'Staff Only']
    },
    {
        name: '/torneio participante_adicionar',
        syntax: '/torneio participante_adicionar [membro] [torneio_id] [dupla]',
        description: '[ADM] Inscreve manualmente um membro ou dupla no torneio.',
        detailedExplanation: 'Inscreve diretamente um jogador no torneio sem necessidade de clique no botão do painel.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que será inscrito', required: true, type: 'usuário' },
            { name: 'torneio_id', description: 'ID do torneio', required: true, type: 'número' },
            { name: 'dupla', description: 'Membro parceiro em torneios 2v2 (opcional)', required: false, type: 'usuário' }
        ],
        example: '/torneio participante_adicionar membro: @GigaR4M torneio_id: 1',
        tags: ['Gerência', 'Admin Only']
    },
    {
        name: '/torneio participante_remover',
        syntax: '/torneio participante_remover [membro] [torneio_id]',
        description: '[ADM] Remove manualmente um membro ou equipe do torneio.',
        detailedExplanation: 'Desinscreve um competidor liberando a vaga no torneio.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que será removido', required: true, type: 'usuário' },
            { name: 'torneio_id', description: 'ID do torneio', required: true, type: 'número' }
        ],
        example: '/torneio participante_remover membro: @Desistente torneio_id: 1',
        tags: ['Gerência', 'Admin Only']
    },
    {
        name: '/torneio participante_substituir',
        syntax: '/torneio participante_substituir [membro_antigo] [novo_membro] [torneio_id]',
        description: '[ADM] Substitui um jogador por outro mantendo as posições nas chaves.',
        detailedExplanation: 'Substitui um competidor sem reiniciar ou alterar o chaveamento já sorteado.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'membro_antigo', description: 'Membro atual que vai sair', required: true, type: 'usuário' },
            { name: 'novo_membro', description: 'Novo membro substituto', required: true, type: 'usuário' },
            { name: 'torneio_id', description: 'ID do torneio', required: true, type: 'número' }
        ],
        example: '/torneio participante_substituir membro_antigo: @Ausente novo_membro: @Substituto torneio_id: 1',
        tags: ['Substituição', 'Admin Only']
    },
    {
        name: '/torneio evento_vincular',
        syntax: '/torneio evento_vincular [torneio_id] [data_hora]',
        description: 'Cria um Discord Scheduled Event oficial vinculado ao torneio.',
        detailedExplanation: 'Gera um Evento Nativo do Discord no topo do servidor com contagem regressiva e aviso aos membros.',
        category: 'Torneios & Campeonatos',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio', required: true, type: 'número' },
            { name: 'data_hora', description: 'Data e hora do evento (ex: 28/09/2026 19:00)', required: false, type: 'texto' }
        ],
        example: '/torneio evento_vincular torneio_id: 1 data_hora: 30/09/2026 20:00',
        tags: ['Discord Event', 'Notificações']
    },

    // ==========================================
    // 2. STEAM & JOGOS MONITORADOS (/steam, /jogos)
    // ==========================================
    {
        name: '/steam eventos',
        syntax: '/steam eventos [limite]',
        description: 'Exibe o calendário oficial de eventos sazonais e festivais da Steam.',
        detailedExplanation: 'Lista os próximos festivais temáticos, Grandes Promoções Sazonais e Next Fest do calendário oficial da Valve Steamworks com contagem regressiva.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'limite', description: 'Quantidade de eventos para listar (1 a 10, padrão: 5)', required: false, type: 'número' }
        ],
        example: '/steam eventos limite: 5',
        tags: ['Steamworks', 'Festivais', 'Sazonal']
    },
    {
        name: '/steam evento_banner',
        syntax: '/steam evento_banner [evento_slug] [banner_url]',
        description: '[Admin] Atualiza a URL do banner visual para um evento da Steam.',
        detailedExplanation: 'Permite aos administradores personalizar a imagem de destaque de qualquer evento do calendário com autocomplete de slugs.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'evento_slug', description: 'Slug do evento (com autocomplete)', required: true, type: 'texto' },
            { name: 'banner_url', description: 'Link direto da imagem do banner', required: false, type: 'texto' }
        ],
        example: '/steam evento_banner evento_slug: autumn-sale-2026 banner_url: https://...',
        tags: ['Banners', 'Admin Only']
    },
    {
        name: '/jogos monitorados',
        syntax: '/jogos monitorados',
        description: 'Exibe os jogos monitorados pela comunidade e promoções ativas.',
        detailedExplanation: 'Lista todos os títulos cadastrados na lista de observação de ofertas do servidor, exibindo preço atual, desconto % e menor preço histórico.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        example: '/jogos monitorados',
        tags: ['Ofertas', 'Lista de Desejos']
    },
    {
        name: '/jogos adicionar',
        syntax: '/jogos adicionar [link_ou_id]',
        description: 'Adiciona um jogo da Steam à lista de monitoramento de ofertas.',
        detailedExplanation: 'Insere o AppID ou link da Steam. O bot passa a checar quedas de preço periodicamente e avisa o canal do servidor.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'link_ou_id', description: 'Link da loja Steam ou AppID numérico', required: true, type: 'texto' }
        ],
        example: '/jogos adicionar link_ou_id: https://store.steampowered.com/app/2680010/',
        tags: ['Adicionar Jogo', 'Monitoramento']
    },
    {
        name: '/jogos remover',
        syntax: '/jogos remover [link_ou_id]',
        description: '[Admin] Remove um jogo da lista de monitoramento do servidor.',
        detailedExplanation: 'Interrompe a checagem de preços para o jogo especificado.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'link_ou_id', description: 'Link da Steam ou AppID a ser removido', required: true, type: 'texto' }
        ],
        example: '/jogos remover link_ou_id: 2680010',
        tags: ['Remover Jogo', 'Admin Only']
    },
    {
        name: '/jogos verificar',
        syntax: '/jogos verificar',
        description: '[Admin] Força uma verificação imediata de preços em todos os jogos monitorados.',
        detailedExplanation: 'Atualiza instantaneamente os preços, descontos e menores preços históricos de todos os jogos cadastrados.',
        category: 'Steam & Jogos Monitorados',
        categoryId: 'steam',
        permission: 'admin',
        type: 'slash',
        example: '/jogos verificar',
        tags: ['Sincronização', 'Admin Only']
    },

    // ==========================================
    // 3. SEGURANÇA & MODERAÇÃO
    // ==========================================
    {
        name: '/seguranca dossie',
        syntax: '/seguranca dossie [membro]',
        description: 'Exibe o dossiê completo de reputação e histórico de um membro (Staff Only).',
        detailedExplanation: 'Consulta confidencial para moderadores. Mostra idade da conta, tempo de casa, convite utilizado, histórico de advertências/mutes/bans, mensagens deletadas pela IA e cálculo do Trust Score (0-100).',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que deseja analisar', required: true, type: 'usuário' }
        ],
        example: '/seguranca dossie membro: @Usuario',
        tags: ['Dossiê', 'Trust Score', 'Staff Only']
    },
    {
        name: '/report',
        syntax: '/report [membro]',
        description: 'Denuncie um usuário por má conduta ou violação de regras.',
        detailedExplanation: 'Abre um modal privado para denunciar infrações (spam, scam, nsfw, assédio, etc.) com justificativa e links de provas para a equipe de moderação.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que você deseja denunciar', required: true, type: 'usuário' }
        ],
        example: '/report membro: @Infrator',
        tags: ['Denúncias', 'Segurança']
    },
    {
        name: 'Reportar Mensagem (Context Menu)',
        syntax: 'Botão Direito na Mensagem -> Aplicativos -> Reportar Mensagem',
        description: 'Denuncia uma mensagem ofensiva diretamente com exclusão automática após aprovação.',
        detailedExplanation: 'Vincula a mensagem exata à denúncia. Quando aprovada pela moderação, a mensagem original é apagada automaticamente.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'context',
        example: 'Clique direito na mensagem -> Apps -> Reportar Mensagem',
        tags: ['Menu de Contexto', 'Auto Deleção']
    },
    {
        name: 'Reportar Usuário (Context Menu)',
        syntax: 'Botão Direito no Usuário -> Aplicativos -> Reportar Usuário',
        description: 'Denuncia um usuário diretamente através do seu perfil.',
        detailedExplanation: 'Atalho direto no perfil do Discord para abrir o formulário de denúncia.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'context',
        example: 'Clique direito no usuário -> Apps -> Reportar Usuário',
        tags: ['Menu de Contexto']
    },
    {
        name: 'AutoMod com IA (Gemini)',
        syntax: 'Automático em Segundo Plano',
        description: 'Análise contínua em lote com detecção de assédio, discurso de ódio e NSFW.',
        detailedExplanation: 'Modera mensagens ofensivas em tempo real, remove do canal, registra infração e notifica a administração com a justificativa.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'admin',
        type: 'automod',
        example: 'Execução contínua via tasks assíncronas',
        tags: ['IA Gemini', 'AutoMod', 'Auditoria']
    },

    // ==========================================
    // 4. SORTEIOS (/giveaway ...)
    // ==========================================
    {
        name: '/giveaway create',
        syntax: '/giveaway create [premio] [duracao] [vencedores] [imagem]',
        description: 'Cria um novo sorteio no canal com temporizador.',
        detailedExplanation: 'Inicia um sorteio com embed oficial, botão de participação e tempo personalizado (ex: 1h, 30m, 2d, 1w).',
        category: 'Sorteios & Premiações',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'premio', description: 'O que será sorteado', required: true, type: 'texto' },
            { name: 'duracao', description: 'Duração do sorteio (ex: 1h, 30m, 2d, 1w)', required: true, type: 'texto' },
            { name: 'vencedores', description: 'Número de vencedores (1 a 20, padrão: 1)', required: false, type: 'número' },
            { name: 'imagem', description: 'Imagem ou banner opcional para o sorteio', required: false, type: 'anexo' }
        ],
        example: '/giveaway create premio: Jogo Steam duracao: 1d vencedores: 1',
        tags: ['Sorteios', 'Premiações']
    },
    {
        name: '/giveaway end',
        syntax: '/giveaway end [message_id]',
        description: 'Finaliza um sorteio manualmente antes do prazo previsto.',
        detailedExplanation: 'Encerra o sorteio imediatamente e apura os ganhadores.',
        category: 'Sorteios & Premiações',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'message_id', description: 'ID da mensagem do sorteio', required: true, type: 'texto' }
        ],
        example: '/giveaway end message_id: 1327836428524191766',
        tags: ['Encerramento', 'Staff Only']
    },
    {
        name: '/giveaway reroll',
        syntax: '/giveaway reroll [message_id] [quantidade]',
        description: 'Sorteia novos vencedores para um sorteio já finalizado.',
        detailedExplanation: 'Realiza um novo sorteio entre os participantes caso o ganhador anterior não cumpra os requisitos.',
        category: 'Sorteios & Premiações',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'message_id', description: 'ID da mensagem do sorteio', required: true, type: 'texto' },
            { name: 'quantidade', description: 'Número de novos vencedores a sortear', required: false, type: 'número' }
        ],
        example: '/giveaway reroll message_id: 1327836428524191766 quantidade: 1',
        tags: ['Reroll', 'Staff Only']
    },
    {
        name: '/giveaway list',
        syntax: '/giveaway list',
        description: 'Lista todos os sorteios ativos do servidor.',
        detailedExplanation: 'Exibe os sorteios em andamento com prêmios, canais, participantes e tempo restante.',
        category: 'Sorteios & Premiações',
        categoryId: 'giveaways',
        permission: 'everyone',
        type: 'slash',
        example: '/giveaway list',
        tags: ['Listagem']
    },
    {
        name: '/giveaway delete',
        syntax: '/giveaway delete [message_id]',
        description: 'Cancela e deleta um sorteio do banco de dados.',
        detailedExplanation: 'Remove o sorteio e apaga a mensagem do canal.',
        category: 'Sorteios & Premiações',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'message_id', description: 'ID da mensagem do sorteio', required: true, type: 'texto' }
        ],
        example: '/giveaway delete message_id: 1327836428524191766',
        tags: ['Deleção', 'Staff Only']
    },

    // ==========================================
    // 5. XP, RANK CARDS & ESTATÍSTICAS
    // ==========================================
    {
        name: '/rank (ou /perfil)',
        syntax: '/rank [membro]',
        description: 'Exibe o seu Rank Card ou de outro membro em imagem de alta fidelidade.',
        detailedExplanation: 'Gera um card visual estilizado mostrando seu nível, barra de progresso de XP, posição no ranking do servidor, contagem de mensagens e minutos em voz.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que deseja visualizar o Rank Card (opcional)', required: false, type: 'usuário' }
        ],
        example: '/rank membro: @GigaR4M',
        tags: ['Rank Card', 'Imagem Visual', 'Níveis']
    },
    {
        name: '/destaques',
        syntax: '/destaques [ano]',
        description: 'Mostra a Retrospectiva e os Destaques do Ano do Servidor em Galeria Visual.',
        detailedExplanation: 'Gera uma galeria de imagens completa (MVP do ano, Tagarela, Rei da Call, O Corujão, Streamer, Top Gamers, etc.).',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'ano', description: 'Ano dos destaques para consulta (padrão: ano atual)', required: false, type: 'número' }
        ],
        example: '/destaques ano: 2026',
        tags: ['Retrospectiva', 'Destaques do Ano']
    },
    {
        name: '/stats rank',
        syntax: '/stats rank [membro]',
        description: 'Exibe o Rank Card de XP e nível de um membro.',
        detailedExplanation: 'Versão do comando de Rank Card dentro do grupo /stats.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que deseja consultar', required: false, type: 'usuário' }
        ],
        example: '/stats rank',
        tags: ['Rank Card']
    },
    {
        name: '/stats me',
        syntax: '/stats me [days]',
        description: 'Suas estatísticas pessoais e ficha de XP/Nível.',
        detailedExplanation: 'Exibe métricas detalhadas de atividade, mensagens enviadas e tempo em call.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'days', description: 'Número de dias para análise (padrão: Ano Atual)', required: false, type: 'número' }
        ],
        example: '/stats me',
        tags: ['Minhas Estatísticas']
    },
    {
        name: '/stats user',
        syntax: '/stats user [user] [days]',
        description: 'Estatísticas de um usuário específico (Apenas Staff).',
        detailedExplanation: 'Permite à equipe de moderação consultar o histórico de atividade detalhado de qualquer membro.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'user', description: 'Usuário para ver estatísticas', required: true, type: 'usuário' },
            { name: 'days', description: 'Dias para análise', required: false, type: 'número' }
        ],
        example: '/stats user user: @Membro days: 30',
        tags: ['Auditoria', 'Staff Only']
    },
    {
        name: '/stats server',
        syntax: '/stats server [days]',
        description: 'Estatísticas gerais de atividade do servidor.',
        detailedExplanation: 'Mostra total de mensagens, horas em canais de voz, canais mais movimentados e membros mais ativos.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'days', description: 'Número de dias para análise (padrão: 30)', required: false, type: 'número' }
        ],
        example: '/stats server days: 30',
        tags: ['Métricas do Servidor']
    },
    {
        name: '/stats leaderboard',
        syntax: '/stats leaderboard [limit] [days]',
        description: 'Mostra o ranking de XP e níveis dos membros.',
        detailedExplanation: 'Exibe o Top ranking de usuários com maior pontuação acumulada.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'limit', description: 'Número de usuários (1 a 25, padrão: 10)', required: false, type: 'número' },
            { name: 'days', description: 'Dias para análise (padrão: ano atual)', required: false, type: 'número' }
        ],
        example: '/stats leaderboard limit: 10',
        tags: ['Ranking', 'Top XP']
    },
    {
        name: '/stats top',
        syntax: '/stats top [limit] [days]',
        description: 'Top usuários mais ativos por mensagens de texto.',
        detailedExplanation: 'Lista os membros que mais enviaram mensagens nos canais de texto.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'limit', description: 'Quantidade de usuários (padrão: 10)', required: false, type: 'número' },
            { name: 'days', description: 'Período em dias', required: false, type: 'número' }
        ],
        example: '/stats top limit: 10 days: 7',
        tags: ['Top Mensagens']
    },
    {
        name: '/stats channels',
        syntax: '/stats channels [limit] [days]',
        description: 'Canais mais ativos do servidor.',
        detailedExplanation: 'Mostra os canais de texto com maior volume de tráfego.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'limit', description: 'Número de canais (padrão: 10)', required: false, type: 'número' },
            { name: 'days', description: 'Período em dias', required: false, type: 'número' }
        ],
        example: '/stats channels',
        tags: ['Canais Ativos']
    },
    {
        name: '/stats setup_leaderboard',
        syntax: '/stats setup_leaderboard',
        description: 'Configura um leaderboard persistente e auto-atualizável no canal.',
        detailedExplanation: 'Cria uma mensagem fixada de ranking que se atualiza automaticamente com os pontos dos membros.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'moderator',
        type: 'slash',
        example: '/stats setup_leaderboard',
        tags: ['Leaderboard Automático', 'Staff Only']
    },
    {
        name: '/stats xp_adicionar',
        syntax: '/stats xp_adicionar [membro] [xp] [motivo]',
        description: 'Adiciona XP manualmente a um membro (Apenas Administradores).',
        detailedExplanation: 'Concede pontos bônus de XP com registro de auditoria.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro beneficiado', required: true, type: 'usuário' },
            { name: 'xp', description: 'Quantidade de XP', required: true, type: 'número' },
            { name: 'motivo', description: 'Motivo da premiação', required: false, type: 'texto' }
        ],
        example: '/stats xp_adicionar membro: @Membro xp: 500 motivo: Vencedor do minigame',
        tags: ['Gerenciar XP', 'Admin Only']
    },
    {
        name: '/stats xp_remover',
        syntax: '/stats xp_remover [membro] [xp] [motivo]',
        description: 'Remove XP de um membro (Apenas Administradores).',
        detailedExplanation: 'Aplica penalidade removendo pontuação com registro no histórico.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro penalizado', required: true, type: 'usuário' },
            { name: 'xp', description: 'Quantidade de XP a remover', required: true, type: 'número' },
            { name: 'motivo', description: 'Motivo da penalidade', required: false, type: 'texto' }
        ],
        example: '/stats xp_remover membro: @Membro xp: 200 motivo: Spam',
        tags: ['Gerenciar XP', 'Admin Only']
    },

    // ==========================================
    // 6. JOGOS & RAWG
    // ==========================================
    {
        name: '/jogo',
        syntax: '/jogo [nome] [plataforma] [detalhes]',
        description: 'Pesquise jogos no banco de dados RAWG com autocomplete em tempo real.',
        detailedExplanation: 'Busca fichas técnicas completas com notas Metacritic, desenvolvedores, plataformas, tempo de jogo, requisitos de sistema para PC e links de lojas.',
        category: 'Jogos & Enciclopédia RAWG',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'nome', description: 'Digite as iniciais ou nome do jogo (use sugestões do menu)', required: true, type: 'texto' },
            { name: 'plataforma', description: 'Filtre por plataforma (PC, PlayStation, Xbox, Switch, etc.)', required: false, type: 'opção' },
            { name: 'detalhes', description: 'Exibir ficha técnica completa com requisitos e lojas', required: false, type: 'booleano' }
        ],
        example: '/jogo nome: God of War Ragnarök plataforma: PlayStation detalhes: True',
        tags: ['RAWG', 'Metacritic', 'Ficha Técnica']
    },
    {
        name: '/games top',
        syntax: '/games top [limit] [days]',
        description: 'Jogos mais jogados pelos membros no servidor.',
        detailedExplanation: 'Exibe o ranking de jogos com mais horas jogadas com base nas presenças e status do Discord.',
        category: 'Jogos & Enciclopédia RAWG',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'limit', description: 'Quantidade de jogos (padrão: 10)', required: false, type: 'número' },
            { name: 'days', description: 'Dias para análise', required: false, type: 'número' }
        ],
        example: '/games top limit: 10 days: 30',
        tags: ['Mais Jogados', 'Atividades']
    },
    {
        name: '/games user',
        syntax: '/games user [user] [days]',
        description: 'Jogos mais jogados por um usuário específico.',
        detailedExplanation: 'Mostra o tempo de jogo e títulos preferidos de um membro.',
        category: 'Jogos & Enciclopédia RAWG',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'user', description: 'Usuário para ver estatísticas de jogos', required: false, type: 'usuário' },
            { name: 'days', description: 'Período em dias', required: false, type: 'número' }
        ],
        example: '/games user user: @GigaR4M',
        tags: ['Histórico Gamer']
    },
    {
        name: '/games yearly',
        syntax: '/games yearly [year]',
        description: 'Retrospectiva anual de jogos do servidor.',
        detailedExplanation: 'Resumo dos jogos que dominaram a comunidade ao longo do ano.',
        category: 'Jogos & Enciclopédia RAWG',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'year', description: 'Ano da retrospectiva (padrão: ano atual)', required: false, type: 'número' }
        ],
        example: '/games yearly year: 2026',
        tags: ['Retrospectiva Gamer']
    },
    {
        name: '/games stats',
        syntax: '/games stats [days]',
        description: 'Estatísticas gerais de atividades de jogos.',
        detailedExplanation: 'Métricas agregadas de tempo jogado pela comunidade.',
        category: 'Jogos & Enciclopédia RAWG',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'days', description: 'Dias para análise', required: false, type: 'número' }
        ],
        example: '/games stats',
        tags: ['Métricas']
    },

    // ==========================================
    // 7. CARGOS AUTOMÁTICOS (/roles ...)
    // ==========================================
    {
        name: '/roles add',
        syntax: '/roles add [role] [type] [requirement]',
        description: 'Adiciona um cargo automático por tempo ou nível de XP.',
        detailedExplanation: 'Configura atribuição automática (ex: cargo por atingir nível 25, ou cargo por completar 180 dias no servidor).',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'role', description: 'Cargo a ser concedido', required: true, type: 'cargo' },
            { name: 'type', description: 'Tipo de requisito (level ou days)', required: true, type: 'opção' },
            { name: 'requirement', description: 'Valor necessário (ex: 20 para nível 20, 365 para 1 ano)', required: true, type: 'número' }
        ],
        example: '/roles add role: @Veterano type: days requirement: 365',
        tags: ['Cargos Dinâmicos', 'Admin Only']
    },
    {
        name: '/roles remove',
        syntax: '/roles remove [role] [type]',
        description: 'Remove um cargo automático configurado.',
        detailedExplanation: 'Desativa a regra de atribuição automática do cargo especificado.',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'role', description: 'Cargo a ser desvinculado', required: true, type: 'cargo' },
            { name: 'type', description: 'Tipo do requisito (level ou days)', required: true, type: 'opção' }
        ],
        example: '/roles remove role: @Veterano type: days',
        tags: ['Remover Regra', 'Admin Only']
    },
    {
        name: '/roles list',
        syntax: '/roles list',
        description: 'Lista todos os cargos automáticos configurados no servidor.',
        detailedExplanation: 'Exibe a tabela com todos os cargos por nível e tempo de casa ativos.',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'everyone',
        type: 'slash',
        example: '/roles list',
        tags: ['Lista de Cargos']
    },
    {
        name: '/roles check',
        syntax: '/roles check [member]',
        description: 'Verifica o status e elegibilidade de cargos de um membro.',
        detailedExplanation: 'Informa quais cargos automáticos o membro já conquistou e o progresso para os próximos.',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'member', description: 'Membro para checar (opcional)', required: false, type: 'usuário' }
        ],
        example: '/roles check member: @Amigo',
        tags: ['Status de Cargos']
    },
    {
        name: '/roles sync',
        syntax: '/roles sync',
        description: 'Força a sincronização de cargos para todos os membros existentes.',
        detailedExplanation: 'Varre todos os membros do servidor e atualiza os cargos de acordo com os níveis e tempo de cada um.',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        example: '/roles sync',
        tags: ['Sincronizar', 'Admin Only']
    },
    {
        name: '/roles explicar',
        syntax: '/roles explicar',
        description: 'Explica os requisitos e funcionamento dos cargos especiais do servidor.',
        detailedExplanation: 'Envia um guia explicativo no canal detalhando as regras de progressão.',
        category: 'Cargos Automáticos',
        categoryId: 'roles',
        permission: 'everyone',
        type: 'slash',
        example: '/roles explicar',
        tags: ['Guia de Cargos']
    },

    // ==========================================
    // 8. CONFIGURAÇÕES & MODERAÇÃO IA
    // ==========================================
    {
        name: '/config canal-pontos-adicionar',
        syntax: '/config canal-pontos-adicionar [canal]',
        description: 'Adiciona um canal à lista de canais que dão pontos de XP.',
        detailedExplanation: 'Habilita ganho de XP por mensagens no canal selecionado.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de texto que dará pontos', required: true, type: 'canal' }
        ],
        example: '/config canal-pontos-adicionar canal: #geral',
        tags: ['Canais de XP', 'Admin Only']
    },
    {
        name: '/config canal-pontos-remover',
        syntax: '/config canal-pontos-remover [canal]',
        description: 'Remove um canal da lista de canais que dão pontos de XP.',
        detailedExplanation: 'Desativa o acúmulo de XP para mensagens enviadas no canal.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de texto a ser removido', required: true, type: 'canal' }
        ],
        example: '/config canal-pontos-remover canal: #off-topic',
        tags: ['Canais de XP', 'Admin Only']
    },
    {
        name: '/config canais-pontos-listar',
        syntax: '/config canais-pontos-listar',
        description: 'Lista todos os canais que dão pontos de XP neste servidor.',
        detailedExplanation: 'Exibe a lista atual de canais com ganho de XP ativo.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        example: '/config canais-pontos-listar',
        tags: ['Listagem', 'Admin Only']
    },
    {
        name: '/config voz-ignorar-adicionar',
        syntax: '/config voz-ignorar-adicionar [canal]',
        description: 'Adiciona canal de voz à lista de canais ignorados (sem pontos).',
        detailedExplanation: 'Impede ganho de XP de voz em canais como AFK, Salas Privadas ou Staff.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de voz a ser ignorado', required: true, type: 'canal' }
        ],
        example: '/config voz-ignorar-adicionar canal: 🔇 AFK',
        tags: ['Voz AFK', 'Admin Only']
    },
    {
        name: '/config voz-ignorar-remover',
        syntax: '/config voz-ignorar-remover [canal]',
        description: 'Remove canal de voz da lista de ignorados.',
        detailedExplanation: 'Reativa ganho de XP de voz no canal especificado.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de voz a ser reativado', required: true, type: 'canal' }
        ],
        example: '/config voz-ignorar-remover canal: 🔊 Bate-Papo',
        tags: ['Voz', 'Admin Only']
    },
    {
        name: '/config canal-moderacao',
        syntax: '/config canal-moderacao [canal]',
        description: 'Define o canal onde serão enviados alertas de moderação e denúncias.',
        detailedExplanation: 'Configura o canal de anúncios restrito à equipe para receber os relatórios de mensagens moderadas por IA e denúncias de membros.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de moderação/anúncios da Staff', required: true, type: 'canal' }
        ],
        example: '/config canal-moderacao canal: #staff-logs',
        tags: ['Moderação Staff', 'Admin Only']
    },
    {
        name: '/config moderacao',
        syntax: '/config moderacao [ativar]',
        description: 'Ativa ou desativa a moderação por IA neste servidor.',
        detailedExplanation: 'Habilita ou pausa o processador em lote com IA Gemini para filtragem de mensagens impróprias.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'ativar', description: 'True para ativar, False para desativar', required: true, type: 'booleano' }
        ],
        example: '/config moderacao ativar: True',
        tags: ['Moderação IA', 'Admin Only']
    },
    {
        name: '/config ver',
        syntax: '/config ver',
        description: 'Mostra a configuração atual completa do bot neste servidor.',
        detailedExplanation: 'Exibe status da moderação por IA, canais de pontos, canais de voz ignorados e canal de staff.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        example: '/config ver',
        tags: ['Configuração Atual', 'Admin Only']
    },
    {
        name: '/moderacao ia',
        syntax: '/moderacao ia [ativar]',
        description: '[Alias] Ativa ou desativa a moderação por Inteligência Artificial.',
        detailedExplanation: 'Atalho alternativo para controle da moderação automática por IA.',
        category: 'Configurações & Moderação IA',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'ativar', description: 'True para ativar, False para desativar', required: true, type: 'booleano' }
        ],
        example: '/moderacao ia ativar: True',
        tags: ['Moderação IA', 'Admin Only']
    },

    // ==========================================
    // 9. UTILIDADES & INFO
    // ==========================================
    {
        name: '/gif',
        syntax: '/gif [busca]',
        description: 'Pesquisa e envia um GIF animado do GIPHY no canal.',
        detailedExplanation: 'Busca rápida de GIFs e memes com suporte a qualquer termo ou emoção.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'busca', description: 'Termo ou emoção para pesquisar o GIF (ex: comemoração, anime)', required: true, type: 'texto' }
        ],
        example: '/gif busca: vitoria gg',
        tags: ['Giphy', 'GIFs']
    },
    {
        name: '/sistema_xp (ou /sistema_pontos)',
        syntax: '/sistema_xp',
        description: 'Explica como funciona o sistema oficial de XP, níveis e recompensas.',
        detailedExplanation: 'Envia um guia completo detalhando regras de ganho de XP por texto, tempo em voz, multiplicadores e subida de nível.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        example: '/sistema_xp',
        tags: ['Guia de XP', 'Ajuda']
    }
]

export default function CommandsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [permissionFilter, setPermissionFilter] = useState<'all' | 'everyone' | 'moderator' | 'admin'>('all')
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(id)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const filteredCommands = useMemo(() => {
        return COMMANDS.filter((cmd) => {
            // Category filter
            if (selectedCategory !== 'all' && cmd.categoryId !== selectedCategory) {
                return false
            }

            // Permission filter
            if (permissionFilter !== 'all' && cmd.permission !== permissionFilter) {
                return false
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim()
                const matchesName = cmd.name.toLowerCase().includes(q)
                const matchesSyntax = cmd.syntax.toLowerCase().includes(q)
                const matchesDesc = cmd.description.toLowerCase().includes(q)
                const matchesExpl = cmd.detailedExplanation.toLowerCase().includes(q)
                const matchesCategory = cmd.category.toLowerCase().includes(q)
                const matchesTags = cmd.tags?.some((t) => t.toLowerCase().includes(q))
                return matchesName || matchesSyntax || matchesDesc || matchesExpl || matchesCategory || matchesTags
            }

            return true
        })
    }, [searchQuery, selectedCategory, permissionFilter])

    // Grouping by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {}
        filteredCommands.forEach((cmd) => {
            if (!groups[cmd.categoryId]) {
                groups[cmd.categoryId] = []
            }
            groups[cmd.categoryId].push(cmd)
        })
        return groups
    }, [filteredCommands])

    const totalPublicCount = useMemo(() => COMMANDS.filter(c => c.permission === 'everyone').length, [])
    const totalStaffCount = useMemo(() => COMMANDS.filter(c => c.permission === 'moderator' || c.permission === 'admin').length, [])

    const getPermissionBadge = (perm: 'everyone' | 'moderator' | 'admin') => {
        switch (perm) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-rose-950/80 text-rose-300 border border-rose-500/50">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        ADMIN
                    </span>
                )
            case 'moderator':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-amber-950/80 text-amber-300 border border-amber-500/50">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        STAFF / MOD
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                        <Users className="w-3 h-3 text-emerald-400" />
                        TODOS
                    </span>
                )
        }
    }

    const getTypeBadge = (type: 'slash' | 'context' | 'automod') => {
        switch (type) {
            case 'context':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-sky-950/80 text-sky-300 border border-sky-500/50">
                        <MousePointerClick className="w-3 h-3 text-sky-400" />
                        MENU DE CONTEXTO
                    </span>
                )
            case 'automod':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-purple-950/80 text-purple-300 border border-purple-500/50">
                        <Bot className="w-3 h-3 text-purple-400" />
                        IA GEMINI
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold font-orbitron bg-indigo-950/80 text-indigo-300 border border-indigo-500/50">
                        <TerminalSquare className="w-3 h-3 text-indigo-400" />
                        SLASH COMMAND
                    </span>
                )
        }
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Hero */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-orbitron tracking-widest uppercase mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        DOCUMENTAÇÃO OFICIAL DO BOT
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight">
                        Central de Comandos
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base font-rajdhani font-medium max-w-2xl mt-1">
                        Catálogo consolidado de todos os slash commands, menus de contexto e recursos de moderação por IA reais do BMIA.
                    </p>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Comandos</span>
                        <span className="text-xl font-black font-orbitron text-cyan-400">{COMMANDS.length}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Categorias</span>
                        <span className="text-xl font-black font-orbitron text-purple-400">{CATEGORIES.length}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Públicos</span>
                        <span className="text-xl font-black font-orbitron text-emerald-400">{totalPublicCount}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Staff / Admin</span>
                        <span className="text-xl font-black font-orbitron text-amber-400">{totalStaffCount}</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="cyber-card rounded-2xl p-5 border border-slate-700/60 bg-slate-900/80 backdrop-blur-xl space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar comando, funcionalidade, parâmetro ou tag (ex: /torneio, steam, dossie, rank, give)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-rajdhani font-medium focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-orbitron text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
                            >
                                LIMPAR
                            </button>
                        )}
                    </div>

                    {/* Permission Filter */}
                    <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto shrink-0 overflow-x-auto">
                        {(['all', 'everyone', 'moderator', 'admin'] as const).map((perm) => {
                            const labels = {
                                all: 'Todas Permissões',
                                everyone: 'Públicos',
                                moderator: 'Staff / Mod',
                                admin: 'Administrador'
                            }
                            const isActive = permissionFilter === perm
                            return (
                                <button
                                    key={perm}
                                    onClick={() => setPermissionFilter(perm)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold font-orbitron transition-all whitespace-nowrap",
                                        isActive
                                            ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/20"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {labels[perm]}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs font-bold font-orbitron transition-all whitespace-nowrap border flex items-center gap-2 shrink-0",
                            selectedCategory === 'all'
                                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30"
                                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                        )}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        TODOS ({COMMANDS.length})
                    </button>

                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon
                        const count = COMMANDS.filter(c => c.categoryId === cat.id).length
                        const isSelected = selectedCategory === cat.id

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-xl text-xs font-bold font-orbitron transition-all whitespace-nowrap border flex items-center gap-2 shrink-0",
                                    isSelected
                                        ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-cyan-400 shadow-lg shadow-purple-600/30"
                                        : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : cat.color)} />
                                {cat.name.toUpperCase()} ({count})
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Results Output */}
            {filteredCommands.length === 0 ? (
                <div className="cyber-card rounded-2xl p-12 text-center border border-dashed border-slate-700 flex flex-col items-center justify-center space-y-3">
                    <HelpCircle className="w-12 h-12 text-slate-600" />
                    <h3 className="text-xl font-bold font-orbitron text-slate-300">Nenhum comando encontrado</h3>
                    <p className="text-sm font-rajdhani text-slate-500 max-w-md">
                        Nenhum comando correspondeu aos filtros atuais. Tente buscar por outros termos como &quot;torneio&quot;, &quot;steam&quot;, &quot;rank&quot; ou limpe os filtros.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setPermissionFilter('all')
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-orbitron tracking-wider transition-colors"
                    >
                        REDEFINIR FILTROS
                    </button>
                </div>
            ) : (
                <div className="space-y-10">
                    {CATEGORIES.map((category) => {
                        const commandsInGroup = groupedCommands[category.id]
                        if (!commandsInGroup || commandsInGroup.length === 0) return null

                        const CatIcon = category.icon

                        return (
                            <div key={category.id} className="space-y-4">
                                {/* Category Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2.5 rounded-xl bg-slate-900 border", category.borderAccent)}>
                                            <CatIcon className={cn("w-5 h-5", category.color)} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron tracking-tight flex items-center gap-2">
                                                {category.name}
                                                <span className="text-xs font-rajdhani font-semibold text-slate-500">({commandsInGroup.length})</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm font-rajdhani font-medium text-slate-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Commands Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {commandsInGroup.map((cmd) => {
                                        const cardKey = `${cmd.categoryId}-${cmd.name}`
                                        const isCopied = copiedIndex === cardKey

                                        return (
                                            <div
                                                key={cardKey}
                                                className="cyber-card rounded-2xl p-6 border border-slate-800/90 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
                                            >
                                                {/* Top Badges & Action */}
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {getTypeBadge(cmd.type)}
                                                            {getPermissionBadge(cmd.permission)}
                                                        </div>

                                                        {/* Quick Copy Command */}
                                                        <button
                                                            onClick={() => handleCopy(cmd.syntax, cardKey)}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border shrink-0",
                                                                isCopied
                                                                    ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                                                                    : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                                                            )}
                                                            title="Copiar sintaxe"
                                                        >
                                                            {isCopied ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                    <span className="font-orbitron font-bold">Copiado!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    <span className="font-orbitron">Copiar</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Command Title & Syntax Box */}
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-black text-white font-orbitron group-hover:text-cyan-300 transition-colors tracking-wide">
                                                            {cmd.name}
                                                        </h3>
                                                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 font-bold overflow-x-auto shadow-inner">
                                                            <code>{cmd.syntax}</code>
                                                        </div>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-sm font-rajdhani font-semibold text-slate-300 leading-relaxed">
                                                        {cmd.detailedExplanation}
                                                    </p>
                                                </div>

                                                {/* Parameters Section (if any) */}
                                                {cmd.params && cmd.params.length > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                                                        <span className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-wider block">
                                                            Parâmetros:
                                                        </span>
                                                        <div className="space-y-1.5">
                                                            {cmd.params.map((p, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="flex items-baseline gap-2 text-xs font-rajdhani bg-slate-950/40 p-2 rounded-lg border border-slate-800/60"
                                                                >
                                                                    <span className="font-mono font-bold text-purple-300">
                                                                        {p.name}
                                                                    </span>
                                                                    <span className={cn(
                                                                        "text-[10px] font-orbitron px-1.5 py-0.2 rounded uppercase",
                                                                        p.required
                                                                            ? "bg-rose-950/60 text-rose-400 border border-rose-500/30 font-bold"
                                                                            : "bg-slate-800 text-slate-400"
                                                                    )}>
                                                                        {p.required ? 'Obrigatório' : 'Opcional'}
                                                                    </span>
                                                                    <span className="text-slate-400 flex-1">
                                                                        {p.description}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Example Box & Tags Footer */}
                                                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                                                    {cmd.example && (
                                                        <div className="text-xs font-rajdhani">
                                                            <span className="text-slate-500 font-semibold block mb-1">Exemplo de uso:</span>
                                                            <code className="text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 font-mono text-[11px] block overflow-x-auto">
                                                                {cmd.example}
                                                            </code>
                                                        </div>
                                                    )}

                                                    {/* Tags */}
                                                    {cmd.tags && (
                                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                            {cmd.tags.map((tag, tIdx) => (
                                                                <span
                                                                    key={tIdx}
                                                                    className="text-[10px] font-orbitron px-2 py-0.5 rounded-md bg-slate-800/70 text-slate-400 border border-slate-700/50"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
