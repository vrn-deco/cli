declare module 'npminstall' {
  type PKG = { name: string; version: string }
  export type InstallOptions = {
    /**
     * optional packages need to install, default is package.json's dependencies and devDependencies
     */
    pkgs: PKG[]
    /**
     * install root dir, default: process.cwd()
     */
    root?: string
    /**
     * default: root + 'node_modules',
     */
    storeDir?: string
    /**
     * ignore pre/post install scripts, default is `false`
     */
    ignoreScripts?: boolean
    /**
     * debug
     */
    debug?: boolean
    /**
     * registry, default is https://registry.npmjs.org
     */
    registry?: string
  }

  export default function npminstall(options: InstallOptions): Promise<void>
}
