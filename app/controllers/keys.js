let fs = require('fs')
let EC = require('elliptic').ec
let ec = new EC('secp256k1')
let keypair = ec.genKeyPair()

const keys = genKeys()

function getPub (prv) {
  return ec.keyFromPrivate(prv).getPublic('hex').toString()
}
function genKeys () {
  const fileName = `${__dirname}/viode.json`
  try {
    let res = JSON.parse(fs.readFileSync(fileName))
    if (res.prv && res.pub && getPub(res.prv) === res.pub) {
      keypair = ec.keyFromPrivate(res.prv)
      return res
    } else {
      throw new Error('not valid json')
    }
  } catch (error) {
    // 出错了 写逻辑
    let res = {
      prv: keypair.getPrivate('hex').toString(),
      pub: keypair.getPublic('hex').toString()
    }
    fs.writeFileSync(fileName, JSON.stringify(res))
    return res
  }
}

function signMsg (value, prv = keys.prv) {
  const keypairTemp = ec.keyFromPrivate(prv)
  const buffferMsg = Buffer.from(value)
  let hexSignature = Buffer.from(keypairTemp.sign(buffferMsg).toDER()).toString('hex')

  return hexSignature
}
function verifyMsg (value, sig, pub) {
  const keypairTemp = ec.keyFromPublic(pub, 'hex')
  let binaryMessage = Buffer.from(value)

  return keypairTemp.verify(binaryMessage, sig)
}

function sign ({ from, name, address, timestamp }) {
  return signMsg(`${timestamp}-${address}-${from}-${name}`)

}
function verify ({ from, name, address, timestamp, sig }) {
  return verifyMsg(`${timestamp}-${address}-${from}-${name}`, sig, from)
}
module.exports = { keys, sign, verify, signMsg, verifyMsg, getPub }
