const { normalizeLoaderName } = require('../lib/utils')

describe('Utils', () => {
  describe('normalizeLoaderName', () => {
    it('formats the given name', () => {
      expect(normalizeLoaderName('git')).toBe('go-loader-git')
      expect(normalizeLoaderName(' GitHub ')).toBe('go-loader-github')
      expect(normalizeLoaderName()).toBe(null)
      expect(normalizeLoaderName(true)).toBe(null)
    })
  })
})
