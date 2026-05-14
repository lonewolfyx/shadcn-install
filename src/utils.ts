import { basename } from 'node:path'
import { glob } from 'glob'

/**
 * Returns all subdirectory names under the given path
 */
export async function getSubDirectories(sourcePath: string): Promise<string[]> {
    const paths = await glob('*', {
        cwd: sourcePath,
        absolute: true,
    })

    return paths.map(p => basename(p))
}
