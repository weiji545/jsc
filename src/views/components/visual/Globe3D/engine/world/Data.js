import capitals from '../../../../../data/world-capitals.zh.json'

export default (capitals?.features || [])
  .map(feature => {
    const coordinates = feature?.geometry?.coordinates || []
    const [E, N] = coordinates
    const name = feature?.properties?.chineseName

    if (typeof E !== 'number' || typeof N !== 'number' || !name) return null

    return {
      startArray: {
        name,
        N,
        E
      },
      endArray: []
    }
  })
  .filter(Boolean)


