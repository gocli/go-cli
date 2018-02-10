import which from 'which'

const getExternalBinary = () => {
  if (!getExternalBinary.instance) {
    var goBinaries = which.sync('go', { all: true })
    getExternalBinary.instance = goBinaries[1] || null
  }
  return getExternalBinary.instance
}

export default getExternalBinary
