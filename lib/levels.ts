// lib/levels.ts - Sistema de Níveis e Cálculo de Progressão de XP no Dashboard

export function getXpNeededForLevelUp(level: number): number {
    if (level < 1) level = 1
    return 5 * (level ** 2) + 50 * level + 100
}

export function getTotalXpForLevel(level: number): number {
    if (level <= 1) return 0
    let total = 0
    for (let lvl = 1; lvl < level; lvl++) {
        total += getXpNeededForLevelUp(lvl)
    }
    return total
}

export function getLevelFromXp(totalXp: number): number {
    if (!totalXp || totalXp <= 0) return 1
    let level = 1
    let accumulated = 0
    while (true) {
        const needed = getXpNeededForLevelUp(level)
        if (accumulated + needed > totalXp) break
        accumulated += needed
        level++
    }
    return level
}

export interface LevelProgress {
    level: number
    totalXp: number
    baseXp: number
    nextLevelTotalXp: number
    xpInLevel: number
    xpNeededInLevel: number
    progressPct: number
}

export function getLevelProgress(totalXp: number): LevelProgress {
    if (!totalXp || totalXp < 0) totalXp = 0
    const level = getLevelFromXp(totalXp)
    const baseXp = getTotalXpForLevel(level)
    const nextLevelTotalXp = getTotalXpForLevel(level + 1)
    const xpInLevel = totalXp - baseXp
    const xpNeededInLevel = nextLevelTotalXp - baseXp
    const progressPct = xpNeededInLevel > 0 
        ? Math.min(100, Math.max(0, parseFloat(((xpInLevel / xpNeededInLevel) * 100).toFixed(1))))
        : 0

    return {
        level,
        totalXp,
        baseXp,
        nextLevelTotalXp,
        xpInLevel,
        xpNeededInLevel,
        progressPct
    }
}
