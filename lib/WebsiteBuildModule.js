import { AbstractModule } from 'adapt-authoring-core'
import fs from 'fs/promises'
import zipper from 'zipper'

class WebsiteBuildModule extends AbstractModule {
  /** @override */
  async init() {
    const [auth, framework, ui] = await this.app.waitForModule('auth', 'adaptframework', 'ui')
    ui.addUiPlugin(`${this.rootDir}/plugin`)

    framework.apiRouter.addRoute({
      route: '/websitebuild/:id',
      handlers: { post: this.handleWebsiteBuild.bind(this) }
    })
    auth.secureRoute(`${framework.apiRouter.path}/websitebuild/:id`, 'post', ['publish:adapt'])
  }

  async handleWebsiteBuild (req, res, next) {
    const framework = await this.app.waitForModule('adaptframework')
    const courseId = req.params.id
    this.log('info', `running websitebuild for course '${courseId}'`)
    try {
      const { buildData } = await framework.buildCourse({ action: 'publish', courseId, userId: req.auth.user._id.toString() })
      this.log('info', `finished websitebuild for course '${courseId}'`)
      try {
        const contents = await fs.readdir(this.getConfig('websitePublishDir'))
        await Promise.all(contents.map(c => fs.rm(c, { recursive: true })))
      } catch(e) {
        if(e.code !== 'ENOENT') throw e
      }
      const unzipDir = await zipper.unzip(buildData.location)
      await fs.cp(unzipDir, this.getConfig('websitePublishDir'), { recursive: true })
      await Promise.all([
        fs.rm(buildData.location),
        fs.rm(unzipDir, { recursive: true })
      ])
      this.log('info', `copied websitebuild files`)
      res.status(200).end()
    } catch (e) {
      this.log('error', `failed to websitebuild course '${courseId}'`)
      return next(e)
    }
  }
}

export default WebsiteBuildModule
