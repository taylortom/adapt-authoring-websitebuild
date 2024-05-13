import { AbstractModule } from 'adapt-authoring-core'

class WebsiteBuildModule extends AbstractModule {
  /** @override */
  async init() {
    const [adaptframework, ui] = await this.app.waitForModule('adaptframework', 'ui')
    ui.addUiPlugin(`${this.rootDir}/plugin`)

    adaptframework.router.addRoute([
      {
        route: '/websitebuild',
        handlers: { post: this.handleWebsiteBuild.bind(this) },
        permissions: { post: ['write:content'] }
      }
    ])
  }

  async handleWebsiteBuild (req, res, next) {
    const courseId = req.params.id
    log('info', `running websitebuild for course '${courseId}'`)
    try {
      const { buildData } = await FrameworkBuild.run({ action: 'publish', courseId, userId: req.auth.user._id.toString() })
      console.log(buildData);
      log('info', `finished websitebuild for course '${courseId}'`)
      res.status(200).end()
    } catch (e) {
      log('error', `failed to websitebuild course '${courseId}'`)
      return next(e)
    }
  }
}

export default WebsiteBuildModule
