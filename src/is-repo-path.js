const isRepoPath = (path) => {
  if (/^[-_.\da-z]+\/[-_.\da-z]+(#.*)?$/i.test(path)) return true
  if (/^(github|gitlab|bitbucket)(:.*)?$/.test(path)) return true
  return false
}

export default isRepoPath
