import { LoadingManager, TextureLoader } from 'three'
import { resources } from './Assets'

// 资源管理和加载（精简版）
export class Resources {
  constructor(callback) {
    this.callback = callback
    this.textures = {}
    this.setLoadingManager()
    this.loadResources()
  }

  setLoadingManager() {
    this.manager = new LoadingManager()
    this.manager.onStart = () => {
      console.log('开始加载资源文件')
    }
    this.manager.onLoad = () => {
      this.callback()
    }
    this.manager.onProgress = url => {
      console.log(`正在加载：${url}`)
    }
    this.manager.onError = url => {
      console.log('加载失败：' + url)
    }
  }

  loadResources() {
    this.textureLoader = new TextureLoader(this.manager)
    resources.textures && resources.textures.forEach(item => {
      this.textureLoader.load(item.url, t => {
        this.textures[item.name] = t
      })
    })
  }
}


