'use strict'

const { Command, flags } = require('@oclif/command')
const updateNotifier = require('update-notifier')
const { exit, requireFastifyForModule } = require('../../util')
const watch = require('../../lib/watch')

// const Fastify = null
let fastifyPackageJSON = null

class Start extends Command {
  loadModules (file) {
    try {
      const { /* module: fastifyModule, */ pkg: fastifyPkg } = requireFastifyForModule(file)

      // Fastify = fastifyModule
      fastifyPackageJSON = fastifyPkg
    } catch (e) {
      this.stop(e)
    }
  }

  stop (message) {
    exit(message)
  }

  async run () {
    const { argv } = this.parse(Start)
    const { flags } = this.parse(Start)

    if (!argv[0]) {
      console.error('Missing the required file parameter\n')
      this.exit(1)
    }

    require('make-promises-safe')

    this.loadModules(argv[0])

    const notifier = updateNotifier({
      pkg: {
        name: 'fastify',
        version: fastifyPackageJSON.version
      },
      updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
    })

    notifier.notify({
      isGlobal: false,
      defer: false
    })

    if (flags.watch) {
      console.log(argv)
      return watch(argv, flags.ignoreWatch)
    }

    // runFastify(argv, cb)
  }
}

Start.description = 'start a server'
Start.args = [{
  name: 'file',
  required: true,
  description: 'server start main file'

}]
Start.flags = {
  port: flags.integer({
    char: 'p',
    description: 'Port to listen on (default to 3000)',
    multiple: false,
    default: 3000
  }),
  address: flags.string({
    char: 'a',
    description: 'Address to listen on'
  }),
  socket: flags.string({
    char: 's',
    description: 'Socket to listen on'
  }),
  'log-level': flags.string({
    char: 'l',
    description: 'Log level (default to fatal)',
    default: 'fatal'
  }),
  'pretty-logs': flags.boolean({
    char: 'P',
    description: 'Prints pretty logs'
  }),
  options: flags.boolean({
    char: 'o',
    description: 'Use custom options'
  }),
  watch: flags.boolean({
    char: 'w',
    description: 'Watch process.cwd() directory for changes, recursively; when that happens, the process will auto reload.'
  }),
  'ignore-watch': flags.string({
    description: 'ingore watch files',
    default: ''
  }),
  prefix: flags.string({
    char: 'r',
    description: 'Set the prefix'
  }),
  'plugin-timeout': flags.boolean({
    char: 'T',
    description: 'The maximum amount of time that a plugin can take to load (default to 10 seconds).'
  }),
  'body-limit': flags.string({
    description: 'Defines the maximum payload, in bytes, the server is allowed to accept'
  })
}

module.exports = Start
