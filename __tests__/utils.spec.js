const mockResolveGlobal = () => mockResolveGlobal.dependency
mockResolveGlobal.silent = () => mockResolveGlobal.dependency
mockResolveGlobal.dependency = null
jest.mock('resolve-global', () => mockResolveGlobal)

const { normalizeLoaderName, requireLoader } = require('../lib/utils')

describe('Utils', () => {
  beforeEach(() => {
    mockResolveGlobal.dependency = null
  })

  describe('normalizeLoaderName', () => {
    it('formats the given name', () => {
      expect(normalizeLoaderName('git')).toBe('go-loader-git')
      expect(normalizeLoaderName(' GitHub ')).toBe('go-loader-github')
    })

    it('handles non string arguments', () => {
      expect(normalizeLoaderName()).toBe(null)
      expect(normalizeLoaderName(true)).toBe(null)
    })
  })

  describe('requireLoader', () => {
    it('requires local dependency', () => {
      const dep = 'path'
      expect(requireLoader(dep)).toBe(require(dep))
    })

    it('requires global dependency', () => {
      const dep = 'path'
      mockResolveGlobal.dependency = dep
      expect(requireLoader('global-dependency')).toBe(require(dep))
    })

    it('returns null if dependency is not matched', () => {
      expect(requireLoader('missing-dependency')).toBe(null)
    })
  })
})
