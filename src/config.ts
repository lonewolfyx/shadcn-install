import type { IConfig } from '@/types.ts'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { findUp } from 'find-up'
import { readTSConfig } from 'pkg-types'

function matchPathAlias(
    uiAlias: string,
    paths: Record<string, string[]>,
): string | undefined {
    for (const [pattern, targets] of Object.entries(paths)) {
        const wildcardIndex = pattern.indexOf('*')
        if (wildcardIndex === -1)
            continue

        const prefix = pattern.slice(0, wildcardIndex)
        if (uiAlias.startsWith(prefix)) {
            return targets[0]!.replace('*', uiAlias.slice(prefix.length))
        }
    }
}

async function findPathAlias(
    startDir: string,
    uiAlias: string,
): Promise<string> {
    const config = await readTSConfig(startDir)
    const paths = config.compilerOptions?.paths

    if (paths) {
        const matched = matchPathAlias(uiAlias, paths)
        if (matched) {
            return path.resolve(startDir, matched)
        }
    }

    // Recursively search through references
    const references: Array<{ path: string }> = config.references ?? []
    for (const ref of references) {
        const refPath = path.resolve(startDir, ref.path)
        // ref.path may be a file path, use its parent directory
        const refDir = ref.path.endsWith('.json') ? path.dirname(refPath) : refPath
        const matched = await findPathAlias(refDir, uiAlias)
        if (matched)
            return matched
    }

    throw new Error(`No matching path alias found for ${uiAlias} in tsconfig`)
}

export const resolveConfig = async (cwd: string): Promise<IConfig> => {
    const componentsJsonPath = await findUp('components.json', {
        cwd,
        type: 'file',
    })

    if (!componentsJsonPath) {
        throw new Error('components.json not found. Make sure the current directory is a shadcn-vue project')
    }

    const projectRoot = path.dirname(componentsJsonPath)
    const componentsJson = JSON.parse(await readFile(componentsJsonPath, 'utf-8')) as any
    const uiAlias: string = componentsJson.aliases?.ui

    if (!uiAlias) {
        throw new Error('Missing aliases.ui configuration in components.json')
    }

    const component = await findPathAlias(projectRoot, uiAlias)

    return { cwd: projectRoot, component }
}
