import { dirname } from 'node:path'
import * as process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cancel, intro, isCancel, log, multiselect, outro, progress } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { isPackageExists } from 'local-pkg'
import { resolvePackageBin } from 'local-pkg-bin'
import pc from 'picocolors'
import { x } from 'tinyexec'
import { resolveConfig } from '@/config.ts'
import { components } from '@/constant.ts'
import { getSubDirectories } from '@/utils.ts'
import { description, name, version } from '../package.json'

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    setup() {
        intro(
            [
                pc.yellow(`${name}`),
                pc.dim(`v${version}`),
            ].join(' '),
        )
    },
    args: {
        cwd: {
            type: 'string',
            description: 'Current working directory',
            alias: 'c',
            default: process.cwd(),
        },
    },
    async run({ args }) {
        if (!isPackageExists('vue')) {
            return outro('Installation for projects other than vue is not supported at this time')
        }

        const config = await resolveConfig(args.cwd)

        const { nlx } = await resolvePackageBin('@antfu/ni', {
            paths: [dirname(fileURLToPath(import.meta.url))],
        })

        const installedComponents = await getSubDirectories(config.component)

        log.success(`Found ${pc.red(installedComponents.length)} installed component(s): \n${pc.gray(installedComponents.join(', '))}`)

        const availableComponents = components.vue.filter(r => !installedComponents.includes(r.value))

        const selectComponents = await multiselect({
            message: 'Select components',
            options: availableComponents.map(r => ({
                value: r.value,
                label: r.label,
                hint: r.description,
            })),
            initialValues: availableComponents.map(r => r.value),
        })

        if (isCancel(selectComponents)) {
            cancel('Operation cancelled')
            return process.exit(0)
        }

        const prog = progress({
            indicator: 'timer',
            style: 'block',
            max: selectComponents.length,
        })
        prog.start('Installing components...')

        for (const component of selectComponents) {
            await x('node', [nlx as string, 'shadcn-vue@latest', 'add', component], {
                nodeOptions: {
                    cwd: config.cwd,
                },
            })
            prog.advance(1, `Installing ${component}...`)
        }

        prog.stop('Components installed successfully')
    },
})

createMain(command)({})
