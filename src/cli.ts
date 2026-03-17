import { intro, outro } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { isPackageExists } from 'local-pkg'
import pc from 'picocolors'
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
    run({ args }) {
        if (!isPackageExists('vue')) {
            return outro('Installation for projects other than vue is not supported at this time')
        }
    },
})

createMain(command)({})
