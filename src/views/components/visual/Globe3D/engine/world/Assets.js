// 资源定义：在当前项目中使用现有的地球纹理图片
// 这里统一使用大屏项目已有纹理作为地球贴图
import earthTexture from '../../../../../img/earth/earth.png'
import gradientTexture from '../../../../../img/earth/gradient.png'
import glowTexture from '../../../../../img/earth/glow.png'
import labelTexture from '../../../../../img/earth/label.png'
import apertureTexture from '../../../../../img/earth/aperture.png'
import lightColumnTexture from '../../../../../img/earth/light_column.png'

const textures = [
  {
    name: 'earth',
    url: earthTexture
  },
  {
    name: 'gradient',
    url: gradientTexture
  },
  {
    name: 'glow',
    url: glowTexture
  },
  {
    name: 'label',
    url: labelTexture
  },
  {
    name: 'aperture',
    url: apertureTexture
  },
  {
    name: 'light_column',
    url: lightColumnTexture
  }
]

const resources = {
  textures
}

export {
  resources
}


