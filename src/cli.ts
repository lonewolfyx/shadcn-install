import { cancel, intro, isCancel, multiselect, outro, spinner } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { isPackageExists } from 'local-pkg'
import pc from 'picocolors'
import { x } from 'tinyexec'
import { components } from '@/constant.ts'
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

        const selectComponents = await multiselect({
            message: 'Select components',
            options: components.vue.map(r => ({
                value: r.value,
                label: r.label,
                hint: r.description,
            })),
            initialValues: components.vue.map(r => r.value),
        })

        if (isCancel(selectComponents)) {
            cancel('Operation cancelled')
            return process.exit(0)
        }

        const s = spinner()
        s.start('Installing components...')

        console.log(['-y', 'shadcn-vue@latest', 'add', ...selectComponents])

        await x('npx', ['-y', 'shadcn-vue@latest', 'add', ...selectComponents], {
            nodeOptions: {
                stdio: 'inherit',
            },
        })

        s.stop('Components installed successfully')
    },
})

createMain(command)({})
