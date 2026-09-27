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
    ExternalLink,
    Zap,
    Users,
    Flame
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
    badgeBg: string
    description: string
}

const CATEGORIES: CommandCategory[] = [
    {
        id: 'tournaments',
        name: 'Torneios & Esports',
        icon: Swords,
        color: 'text-cyan-400',
        borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
        badgeBg: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
        description: 'Gestão completa de campeonatos multijogo (1v1 a 5v5, Mata-mata e Pontos Corridos) com geração visual de chaves e pódios.'
    },
    {
        id: 'steam',
        name: 'Steam, Ofertas & Eventos',
        icon: Tag,
        color: 'text-emerald-400',
        borderAccent: 'border-emerald-500/40 hover:border-emerald-400/80',
        badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
        description: 'Rastreamento de promoções diárias com histórico de menor preço e calendário oficial de festivais Steamworks.'
    },
    {
        id: 'security',
        name: 'Segurança, Dossiê & Moderação',
        icon: ShieldAlert,
        color: 'text-rose-400',
        borderAccent: 'border-rose-500/40 hover:border-rose-400/80',
        badgeBg: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
        description: 'Dossiês de reputação (Trust Score), denúncias por clique direito com deleção automática de mensagens e AutoMod por IA.'
    },
    {
        id: 'giveaways',
        name: 'Sorteios & Giveaways',
        icon: Gift,
        color: 'text-purple-400',
        borderAccent: 'border-purple-500/40 hover:border-purple-400/80',
        badgeBg: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
        description: 'Sistemas de premiação com contagem regressiva, seleção de vencedores justos e suporte a rerolls.'
    },
    {
        id: 'stats',
        name: 'XP, Rank Cards & Estatísticas',
        icon: Trophy,
        color: 'text-yellow-400',
        borderAccent: 'border-yellow-500/40 hover:border-yellow-400/80',
        badgeBg: 'bg-yellow-950/70 text-yellow-300 border-yellow-500/40',
        description: 'Rank Cards gerados em imagem, histórico de voz e mensagens, leaderboard global e retrospectiva anual de destaques.'
    },
    {
        id: 'games',
        name: 'Enciclopédia de Games (RAWG)',
        icon: Gamepad2,
        color: 'text-indigo-400',
        borderAccent: 'border-indigo-500/40 hover:border-indigo-400/80',
        badgeBg: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40',
        description: 'Busca de notas Metacritic, detalhes de desenvolvedoras, plataformas e próximos lançamentos de games.'
    },
    {
        id: 'roles',
        name: 'Cargos Dinâmicos & Reações',
        icon: Sliders,
        color: 'text-pink-400',
        borderAccent: 'border-pink-500/40 hover:border-pink-400/80',
        badgeBg: 'bg-pink-950/70 text-pink-300 border-pink-500/40',
        description: 'Progressão de cargos por tempo de casa e nível de XP, além de painéis interativos de auto-atribuição.'
    },
    {
        id: 'config',
        name: 'Configurações & Administração',
        icon: Settings,
        color: 'text-amber-400',
        borderAccent: 'border-amber-500/40 hover:border-amber-400/80',
        badgeBg: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
        description: 'Controle de canais permitidos, canais de anúncios de moderação, auditoria e ativação do AutoMod Gemini.'
    },
    {
        id: 'utils',
        name: 'Utilidades, GIFs & Info',
        icon: HelpCircle,
        color: 'text-sky-400',
        borderAccent: 'border-sky-500/40 hover:border-sky-400/80',
        badgeBg: 'bg-sky-950/70 text-sky-300 border-sky-500/40',
        description: 'Pesquisa de GIFs Giphy, métricas de hardware, latência de WebSocket e tempo online do bot.'
    }
]

const COMMANDS: CommandItem[] = [
    // --- TORNEIOS ---
    {
        name: '/torneio criar',
        syntax: '/torneio criar',
        description: 'Abre modal interativo para criar e configurar um novo torneio.',
        detailedExplanation: 'Exibe uma janela modal para configurar nome do campeonato, jogo, formato (1v1, 2v2, 3v3, etc.), tipo de chaveamento (Mata-mata ou Pontos Corridos), limite de participantes (até 32 vagas) e premiação opcional.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        example: '/torneio criar',
        tags: ['Modal Interativo', 'Esports', 'Chaveamento']
    },
    {
        name: '/torneio painel',
        syntax: '/torneio painel [torneio_id]',
        description: 'Envia o painel interativo com botões de inscrição e visualização da chave.',
        detailedExplanation: 'Gera um painel dinâmico no canal com botões para os membros se inscreverem, registrarem suas duplas/equipes, verem o chaveamento renderizado e regras.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio (opcional se houver apenas 1 ativo)', required: false, type: 'número' }
        ],
        example: '/torneio painel torneio_id: 1',
        tags: ['Painel Dinâmico', 'Inscrições']
    },
    {
        name: '/torneio chave',
        syntax: '/torneio chave [torneio_id]',
        description: 'Renderiza e exibe a imagem oficial com o chaveamento atualizado (bracket).',
        detailedExplanation: 'Gera uma imagem de alta resolução com as chaves eliminatórias, confrontos, nomes dos competidores/duplas e o estado do avanço.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio a ser consultado', required: false, type: 'número' }
        ],
        example: '/torneio chave torneio_id: 2',
        tags: ['Imagem Visual', 'Chaveamento']
    },
    {
        name: '/torneio partidas',
        syntax: '/torneio partidas [torneio_id] [rodada]',
        description: 'Lista todas as partidas e confrontos da rodada do torneio.',
        detailedExplanation: 'Exibe o status de cada confronto da rodada atual, informando IDs de partida para lançamento de resultados pelos moderadores.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio', required: false, type: 'número' },
            { name: 'rodada', description: 'Número específico da rodada para filtrar', required: false, type: 'número' }
        ],
        example: '/torneio partidas torneio_id: 1 rodada: 1',
        tags: ['Partidas', 'Rodadas']
    },
    {
        name: '/torneio vencedor',
        syntax: '/torneio vencedor [partida_id] [vencedor] [placar]',
        description: 'Registra o vencedor de uma partida e avança o competidor na chave.',
        detailedExplanation: 'Valida a pontuação, declara o ganhador da partida, atualiza a árvore de mata-mata automaticamente e notifica os competidores.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'partida_id', description: 'ID da partida registrado no torneio', required: true, type: 'número' },
            { name: 'vencedor', description: 'Membro ou capitão vencedor', required: true, type: 'usuário' },
            { name: 'placar', description: 'Placar final do confronto (ex: 2x1, 16-12)', required: false, type: 'texto' }
        ],
        example: '/torneio vencedor partida_id: 4 vencedor: @Player1 placar: 2x1',
        tags: ['Avanço Automático', 'Staff Only']
    },
    {
        name: '/torneio cancelar',
        syntax: '/torneio cancelar [torneio_id] [motivo]',
        description: 'Cancela um torneio ativo ou em inscrições abertas.',
        detailedExplanation: 'Encerra o torneio, fecha as inscrições e notifica os participantes com a justificativa informada.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'torneio_id', description: 'ID do torneio a ser cancelado', required: true, type: 'número' },
            { name: 'motivo', description: 'Motivo do cancelamento', required: false, type: 'texto' }
        ],
        example: '/torneio cancelar torneio_id: 3 motivo: Adiado para o próximo final de semana',
        tags: ['Cancelamento', 'Staff Only']
    },
    {
        name: '/torneio listar',
        syntax: '/torneio listar',
        description: 'Lista todos os torneios abertos, em andamento ou finalizados do servidor.',
        detailedExplanation: 'Exibe uma listagem consolidada com status, vagas preenchidas, jogo e premiações.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        example: '/torneio listar',
        tags: ['Listagem', 'Histórico']
    },
    {
        name: '/torneio regras',
        syntax: '/torneio regras [torneio_id]',
        description: 'Exibe o regulamento oficial e orientações para os competidores.',
        detailedExplanation: 'Mostra as diretrizes de conduta, prazos de tolerância, critérios de desempate e normas técnicas.',
        category: 'Torneios & Esports',
        categoryId: 'tournaments',
        permission: 'everyone',
        type: 'slash',
        example: '/torneio regras',
        tags: ['Regulamento']
    },

    // --- STEAM & OFERTAS ---
    {
        name: '/steam promocoes',
        syntax: '/steam promocoes',
        description: 'Exibe as melhores promoções ativas com recorde histórico de menor preço.',
        detailedExplanation: 'Consulta em tempo real a Steam Store e a API GG.deals para listar jogos em oferta, exibindo preço original, preço com desconto, porcentagem de desconto e menor preço já registrado (All-Time Low).',
        category: 'Steam, Ofertas & Eventos',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        example: '/steam promocoes',
        tags: ['Promoções', 'Menor Preço', 'Steam']
    },
    {
        name: '/steam eventos',
        syntax: '/steam eventos',
        description: 'Exibe o calendário oficial de eventos sazonais e festivais da Steam (Steamworks).',
        detailedExplanation: 'Lista os próximos festivais temáticos, Steam Next Fest e Grandes Promoções Sazonais (Spring, Summer, Autumn, Winter Sale) com datas confirmadas e contagem regressiva.',
        category: 'Steam, Ofertas & Eventos',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        example: '/steam eventos',
        tags: ['Eventos Sazonais', 'Steamworks', 'Calendário']
    },
    {
        name: '/steam rastreados',
        syntax: '/steam rastreados',
        description: 'Lista todos os jogos da Steam monitorados automaticamente pelo servidor.',
        detailedExplanation: 'Mostra os jogos cadastrados na lista de observação de descontos diários do servidor, informando status e canais configurados.',
        category: 'Steam, Ofertas & Eventos',
        categoryId: 'steam',
        permission: 'everyone',
        type: 'slash',
        example: '/steam rastreados',
        tags: ['Monitoramento', 'Wishlist do Servidor']
    },
    {
        name: '/steam rastrear',
        syntax: '/steam rastrear [app_id_ou_link]',
        description: 'Adiciona um novo jogo da Steam para rastreamento automático de ofertas.',
        detailedExplanation: 'Insere o AppID ou URL da loja Steam no banco de dados. O bot verificará reduções de preço periodicamente e alertará o canal configurado.',
        category: 'Steam, Ofertas & Eventos',
        categoryId: 'steam',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'app_id_ou_link', description: 'AppID numérico ou link da loja Steam do jogo', required: true, type: 'texto' }
        ],
        example: '/steam rastrear app_id_ou_link: https://store.steampowered.com/app/2358720/',
        tags: ['Adicionar Jogo', 'Staff Only']
    },
    {
        name: '/steam desrastrear',
        syntax: '/steam desrastrear [app_id]',
        description: 'Remove um jogo da lista de rastreamento de promoções.',
        detailedExplanation: 'Interrompe o monitoramento de ofertas para o AppID especificado.',
        category: 'Steam, Ofertas & Eventos',
        categoryId: 'steam',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'app_id', description: 'AppID numérico do jogo Steam a remover', required: true, type: 'número' }
        ],
        example: '/steam desrastrear app_id: 2358720',
        tags: ['Remover Jogo', 'Staff Only']
    },

    // --- SEGURANÇA & DOSSIÊS ---
    {
        name: '/seguranca dossie',
        syntax: '/seguranca dossie [membro]',
        description: 'Exibe o dossiê confidencial de segurança e Trust Score de um usuário.',
        detailedExplanation: 'Consulta de inteligência restrita à moderação. Exibe tempo de conta, tempo no servidor, link de convite utilizado, histórico de advertências/mutes/bans, mensagens deletadas pela IA e cálculo do Trust Score (0 a 100 pontos).',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que deseja analisar o histórico', required: true, type: 'usuário' }
        ],
        example: '/seguranca dossie membro: @Suspeito',
        tags: ['Dossiê Confidencial', 'Trust Score', 'Staff Only']
    },
    {
        name: '/report',
        syntax: '/report [membro]',
        description: 'Abre um modal seguro para denunciar um membro por infrações.',
        detailedExplanation: 'Permite a qualquer usuário enviar uma denúncia privada com categoria (Spam, Scam, NSFW, Ofensas, etc.), explicação detalhada e links de prints.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro que você está denunciando', required: true, type: 'usuário' }
        ],
        example: '/report membro: @UsuarioInfrator',
        tags: ['Denúncia Segura', 'Comunidade']
    },
    {
        name: 'Reportar Mensagem (Clique Direito)',
        syntax: 'Clique Direito na Mensagem -> Aplicativos -> Reportar Mensagem',
        description: 'Menu de contexto para denunciar uma mensagem diretamente.',
        detailedExplanation: 'Vincula o ID da mensagem exata e o canal à denúncia. Quando os moderadores aprovam a denúncia pelo painel, a mensagem original é apagada automaticamente.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'context',
        example: 'Clique com botão direito em qualquer mensagem -> Apps -> Reportar Mensagem',
        tags: ['Menu de Contexto', 'Deleção Automática']
    },
    {
        name: 'Reportar Usuário (Clique Direito)',
        syntax: 'Clique Direito no Usuário -> Aplicativos -> Reportar Usuário',
        description: 'Menu de contexto no perfil para denunciar um usuário diretamente.',
        detailedExplanation: 'Atalho rápido para abrir o formulário de denúncia sem precisar digitar o comando.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'everyone',
        type: 'context',
        example: 'Clique com botão direito no avatar do membro -> Apps -> Reportar Usuário',
        tags: ['Menu de Contexto']
    },
    {
        name: 'AutoMod com IA (Gemini)',
        syntax: 'Autônomo (Em Segundo Plano)',
        description: 'Detecção em tempo real de discurso de ódio, assédio e NSFW por IA.',
        detailedExplanation: 'O bot analisa lotes de mensagens em tempo real com o modelo Gemini. Mensagens que violam as diretrizes são apagadas imediatamente, com registro de infração no histórico e alerta detalhado com o motivo no canal de moderação da Staff.',
        category: 'Segurança, Dossiê & Moderação',
        categoryId: 'security',
        permission: 'admin',
        type: 'automod',
        example: 'Processamento automático via background tasks',
        tags: ['IA Gemini', 'Moderação Automática', 'Auditoria']
    },

    // --- SORTEIOS ---
    {
        name: '/sorteio criar',
        syntax: '/sorteio criar [duracao] [vencedores] [premio] [cargo_obrigatorio]',
        description: 'Cria um novo sorteio com temporizador e regras de participação.',
        detailedExplanation: 'Inicia um sorteio no canal com embed estilizado e botão de entrada. Ao expirar o tempo, seleciona aleatoriamente os vencedores com verificação de cargo obrigatório.',
        category: 'Sorteios & Giveaways',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'duracao', description: 'Tempo do sorteio (ex: 1d, 12h, 30m)', required: true, type: 'texto' },
            { name: 'vencedores', description: 'Quantidade de ganhadores', required: true, type: 'número' },
            { name: 'premio', description: 'O que está sendo sorteado', required: true, type: 'texto' },
            { name: 'cargo_obrigatorio', description: 'Cargo necessário para poder participar (opcional)', required: false, type: 'cargo' }
        ],
        example: '/sorteio criar duracao: 2d vencedores: 1 premio: Nitro 1 Mês cargo_obrigatorio: @VIP',
        tags: ['Sorteio', 'Premiações']
    },
    {
        name: '/sorteio encerrar',
        syntax: '/sorteio encerrar [mensagem_id]',
        description: 'Encerra um sorteio ativo imediatamente e apura os ganhadores.',
        detailedExplanation: 'Finaliza o sorteio antes da contagem regressiva original e sorteia os vencedores na hora.',
        category: 'Sorteios & Giveaways',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'mensagem_id', description: 'ID da mensagem do sorteio a encerrar', required: true, type: 'texto' }
        ],
        example: '/sorteio encerrar mensagem_id: 1327836428524191766',
        tags: ['Encerramento Antecipado', 'Staff Only']
    },
    {
        name: '/sorteio reroll',
        syntax: '/sorteio reroll [mensagem_id] [vencedores]',
        description: 'Sorteia novos vencedores para um sorteio já encerrado.',
        detailedExplanation: 'Utilizado quando um ganhador não reivindica o prêmio ou não cumpre os requisitos.',
        category: 'Sorteios & Giveaways',
        categoryId: 'giveaways',
        permission: 'moderator',
        type: 'slash',
        params: [
            { name: 'mensagem_id', description: 'ID da mensagem do sorteio', required: true, type: 'texto' },
            { name: 'vencedores', description: 'Quantidade de novos ganhadores para sortear', required: false, type: 'número' }
        ],
        example: '/sorteio reroll mensagem_id: 1327836428524191766 vencedores: 1',
        tags: ['Novo Sorteio', 'Staff Only']
    },
    {
        name: '/sorteio listar',
        syntax: '/sorteio listar',
        description: 'Lista todos os sorteios em andamento no servidor.',
        detailedExplanation: 'Exibe os prêmios, número de participantes inscritos e tempo restante para término.',
        category: 'Sorteios & Giveaways',
        categoryId: 'giveaways',
        permission: 'everyone',
        type: 'slash',
        example: '/sorteio listar',
        tags: ['Listagem']
    },

    // --- XP & STATS ---
    {
        name: '/rank (ou /perfil)',
        syntax: '/rank [membro]',
        description: 'Gera o Rank Card visual com XP, nível atual e progresso.',
        detailedExplanation: 'Renderiza uma imagem personalizada mostrando o nível do usuário, barra de progresso para o próximo nível, posição no ranking e estatísticas de mensagens e voz.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro para consultar o card (opcional, padrão: você)', required: false, type: 'usuário' }
        ],
        example: '/rank membro: @Amigo',
        tags: ['Rank Card', 'Imagem Visual', 'Gamificação']
    },
    {
        name: '/stats usuario',
        syntax: '/stats usuario [membro]',
        description: 'Exibe métricas detalhadas de atividade de um membro.',
        detailedExplanation: 'Mostra total de mensagens enviadas, minutos em canais de voz, dias mais ativos e horário de pico.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'membro', description: 'Membro a consultar', required: false, type: 'usuário' }
        ],
        example: '/stats usuario membro: @GigaR4M',
        tags: ['Estatísticas', 'Métricas']
    },
    {
        name: '/stats servidor',
        syntax: '/stats servidor',
        description: 'Mostra o resumo geral de atividade do servidor.',
        detailedExplanation: 'Exibe total de mensagens trocadas, horas totais em call, canais mais movimentados e membros mais engajados.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        example: '/stats servidor',
        tags: ['Servidor', 'Engajamento']
    },
    {
        name: '/stats leaderboard',
        syntax: '/stats leaderboard',
        description: 'Exibe o Top 10 membros com mais XP e atividade do servidor.',
        detailedExplanation: 'Mostra a tabela de líderes atualizada com níveis, pontuações e avatares dos mais bem colocados.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        example: '/stats leaderboard',
        tags: ['Leaderboard', 'Top 10']
    },
    {
        name: '/destaques',
        syntax: '/destaques [ano]',
        description: 'Exibe a galeria visual da retrospectiva anual de destaques.',
        detailedExplanation: 'Mostra os momentos mais marcantes, maiores pontuadores de XP, usuários com mais tempo em voz e campeões de torneios do ano.',
        category: 'XP, Rank Cards & Estatísticas',
        categoryId: 'stats',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'ano', description: 'Ano da retrospectiva (padrão: ano atual)', required: false, type: 'número' }
        ],
        example: '/destaques ano: 2026',
        tags: ['Retrospectiva', 'Destaques do Ano']
    },

    // --- GAMES (RAWG) ---
    {
        name: '/jogo buscar',
        syntax: '/jogo buscar [nome]',
        description: 'Consulta informações completas, notas e plataformas de qualquer jogo.',
        detailedExplanation: 'Busca na base de dados RAWG a data de lançamento, desenvolvedora, nota no Metacritic, gêneros e plataformas disponíveis.',
        category: 'Enciclopédia de Games (RAWG)',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'nome', description: 'Nome do jogo a ser pesquisado', required: true, type: 'texto' }
        ],
        example: '/jogo buscar nome: Black Myth Wukong',
        tags: ['RAWG', 'Metacritic', 'Ficha Técnica']
    },
    {
        name: '/jogo lancamentos',
        syntax: '/jogo lancamentos',
        description: 'Lista os jogos mais aguardados com lançamento previsto para os próximos meses.',
        detailedExplanation: 'Mostra os principais títulos em pré-lançamento com datas de estreia e plataformas confirmadas.',
        category: 'Enciclopédia de Games (RAWG)',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        example: '/jogo lancamentos',
        tags: ['Lançamentos', 'Agenda Gamer']
    },
    {
        name: '/jogo populares',
        syntax: '/jogo populares',
        description: 'Lista os jogos mais bem avaliados e populares do momento.',
        detailedExplanation: 'Exibe os títulos com maiores pontuações recentes e alta contagem de avaliações da comunidade.',
        category: 'Enciclopédia de Games (RAWG)',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        example: '/jogo populares',
        tags: ['Populares', 'Top Games']
    },
    {
        name: '/jogo recomendados',
        syntax: '/jogo recomendados [genero]',
        description: 'Recomenda jogos aclamados pela crítica com base no gênero.',
        detailedExplanation: 'Sugere títulos consagrados filtrados por categoria (RPG, Ação, Estratégia, Terror, etc.).',
        category: 'Enciclopédia de Games (RAWG)',
        categoryId: 'games',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'genero', description: 'Gênero desejado (ex: rpg, acao, indie)', required: false, type: 'texto' }
        ],
        example: '/jogo recomendados genero: soulslike',
        tags: ['Recomendações', 'Descobrir Jogos']
    },

    // --- CARGOS & REAÇÕES ---
    {
        name: '/cargos sincronizar',
        syntax: '/cargos sincronizar',
        description: 'Força a sincronização imediata dos cargos automáticos por tempo e XP.',
        detailedExplanation: 'Varre todos os membros do servidor, checando tempo de permanência e nível atingido para atribuir/atualizar cargos de forma precisa.',
        category: 'Cargos Dinâmicos & Reações',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        example: '/cargos sincronizar',
        tags: ['Sincronização', 'Admin Only']
    },
    {
        name: '/cargos configurar',
        syntax: '/cargos configurar [tipo] [valor] [cargo]',
        description: 'Configura atribuição automática de cargos por tempo ou nível de XP.',
        detailedExplanation: 'Define regras como: atribuir o cargo "Veterano" ao completar 1 ano, ou cargo "Mestre" ao atingir Nível 50.',
        category: 'Cargos Dinâmicos & Reações',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'tipo', description: 'Tipo de requisito (nivel ou tempo_dias)', required: true, type: 'opção' },
            { name: 'valor', description: 'Valor numérico necessário (ex: 20 para nível 20, 365 para 1 ano)', required: true, type: 'número' },
            { name: 'cargo', description: 'Cargo que será concedido', required: true, type: 'cargo' }
        ],
        example: '/cargos configurar tipo: nivel valor: 25 cargo: @Elite',
        tags: ['Progressão', 'Admin Only']
    },
    {
        name: '/reactionrole criar',
        syntax: '/reactionrole criar [titulo] [descricao]',
        description: 'Cria um painel interativo com botões para os membros escolherem cargos.',
        detailedExplanation: 'Gera uma mensagem personalizável onde os usuários podem clicar em botões para adicionar ou remover cargos de jogos, notificações e cores.',
        category: 'Cargos Dinâmicos & Reações',
        categoryId: 'roles',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'titulo', description: 'Título do painel de cargos', required: true, type: 'texto' },
            { name: 'descricao', description: 'Texto explicativo do painel', required: true, type: 'texto' }
        ],
        example: '/reactionrole criar titulo: Escolha seus Jogos descricao: Clique para receber as notificações',
        tags: ['Painel de Reação', 'Auto Role']
    },

    // --- CONFIGURAÇÃO & ADMIN ---
    {
        name: '/config canais',
        syntax: '/config canais',
        description: 'Configura os canais de XP, canais ignorados e canal de anúncios/moderação.',
        detailedExplanation: 'Define onde os membros podem ganhar XP, quais canais de voz não geram pontos e qual canal deve receber alertas de moderação e denúncias.',
        category: 'Configurações & Administração',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        example: '/config canais',
        tags: ['Canais', 'Setup', 'Admin Only']
    },
    {
        name: '/config moderacao_ia',
        syntax: '/config moderacao_ia [status]',
        description: 'Ativa ou desativa a moderação inteligente de mensagens com IA.',
        detailedExplanation: 'Habilita o filtro em lote que remove mensagens com assédio, toxicidade extrema ou pornografia e notifica a administração.',
        category: 'Configurações & Administração',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'status', description: 'Ativar (true) ou Desativar (false)', required: true, type: 'booleano' }
        ],
        example: '/config moderacao_ia status: Verdadeiro',
        tags: ['IA Gemini', 'Admin Only']
    },
    {
        name: '/config boas_vindas',
        syntax: '/config boas_vindas [canal] [mensagem]',
        description: 'Configura a mensagem e card visual de boas-vindas para novos membros.',
        detailedExplanation: 'Define onde novos ingressantes serão recepcionados e personaliza o texto com placeholders ({user}, {server}, etc.).',
        category: 'Configurações & Administração',
        categoryId: 'config',
        permission: 'admin',
        type: 'slash',
        params: [
            { name: 'canal', description: 'Canal de texto onde a mensagem será enviada', required: true, type: 'canal' },
            { name: 'mensagem', description: 'Mensagem personalizada', required: false, type: 'texto' }
        ],
        example: '/config boas_vindas canal: #boas-vindas mensagem: Bem-vindo {user} ao {server}!',
        tags: ['Boas-Vindas', 'Admin Only']
    },

    // --- UTILIDADES & INFO ---
    {
        name: '/ajuda',
        syntax: '/ajuda',
        description: 'Menu interativo de auxílio com guia de todos os recursos do bot.',
        detailedExplanation: 'Abre um guia estruturado por categorias no Discord para navegação rápida entre os comandos.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        example: '/ajuda',
        tags: ['Ajuda', 'Suporte']
    },
    {
        name: '/gif',
        syntax: '/gif [termo]',
        description: 'Pesquisa e envia um GIF animado relevante pelo Giphy.',
        detailedExplanation: 'Realiza a busca rápida de animações com suporte a termos em português e inglês.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        params: [
            { name: 'termo', description: 'Termo de pesquisa do GIF', required: true, type: 'texto' }
        ],
        example: '/gif termo: gg wp victory',
        tags: ['Giphy', 'GIFs']
    },
    {
        name: '/botinfo',
        syntax: '/botinfo',
        description: 'Exibe informações técnicas sobre o BMIA, versão e estatísticas.',
        detailedExplanation: 'Mostra versão do bot, consumo de memória RAM, total de servidores, quantidade de usuários gerenciados e versão do discord.py.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        example: '/botinfo',
        tags: ['Status', 'Hardware']
    },
    {
        name: '/ping',
        syntax: '/ping',
        description: 'Testa a latência e tempo de resposta do WebSocket com o Discord.',
        detailedExplanation: 'Calcula o ping de ida e volta da API em milissegundos para diagnóstico de conexão.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        example: '/ping',
        tags: ['Latência', 'Diagnóstico']
    },
    {
        name: '/uptime',
        syntax: '/uptime',
        description: 'Informa quanto tempo o bot está online ininterruptamente.',
        detailedExplanation: 'Exibe a data de inicialização do processo e o tempo total de operação sem quedas.',
        category: 'Utilidades, GIFs & Info',
        categoryId: 'utils',
        permission: 'everyone',
        type: 'slash',
        example: '/uptime',
        tags: ['Disponibilidade', 'Uptime']
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
                        DOCUMENTAÇÃO & CATÁLOGO DO BOT
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight">
                        Central de Comandos
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base font-rajdhani font-medium max-w-2xl mt-1">
                        Consulte a documentação completa de todos os comandos slash, menus de contexto e automações por IA do BMIA.
                    </p>
                </div>

                {/* Stat Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Total</span>
                        <span className="text-xl font-black font-orbitron text-cyan-400">{COMMANDS.length}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Grupos</span>
                        <span className="text-xl font-black font-orbitron text-purple-400">{CATEGORIES.length}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Públicos</span>
                        <span className="text-xl font-black font-orbitron text-emerald-400">{totalPublicCount}</span>
                    </div>
                    <div className="cyber-card rounded-xl p-3 border border-slate-800 bg-slate-900/60 flex flex-col items-center text-center">
                        <span className="text-xs font-rajdhani font-bold text-slate-400 uppercase">Staff / Mod</span>
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
                            placeholder="Buscar por comando, funcionalidade, parâmetro ou tag (ex: /torneio, steam, dossiê, xp)..."
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
