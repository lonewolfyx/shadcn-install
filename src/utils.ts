import { readdir } from 'node:fs/promises'

/**
 * 获取指定路径下的所有子文件夹名称
 */
export async function getSubDirectories(sourcePath: string): Promise<string[]> {
    const entries = await readdir(sourcePath, { withFileTypes: true })
    return entries.reduce<string[]>((dirs, entry) => {
        if (entry.isDirectory()) {
            dirs.push(entry.name)
        }
        return dirs
    }, [])
}
