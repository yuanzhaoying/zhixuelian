const crypto = require('crypto')

const key = require('./keys')

//定义起源块
const initBlock = {
  index: 0,                         //区块位置
  previousHash: '0',                //前一个区块的hash
  timestamp: 1538669227813,         //生成区块的时间戳
  data: 'Welcome to iblockchain!',  //区块所携带的数据
  hash: 'the frist block',          //区块根据自身规则和信息生成的hash
  nonce: 979911                     //相当于用于验证。用来挖矿，随机猜测nonce，直到算出符合条件的hash值，其他节点可以根据nonce验证。
}

//定义区块链的类
class Blockchain {
  constructor () {
    this.blockchain = [
      initBlock
    ]
    // 还没打包的交易数据
    this.data = []
    // 挖矿难度值
    this.difficulty = 2
   
  }

  isEqualObj (obj1, obj2) {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }
    return keys1.every(key => obj1[key] === obj2[key])
  }

  dispatch (action, remote) {
    switch (action.type) {
      case 'blockchain':
        let allData = JSON.parse(action.data)
        let newChain = allData.blockchain
        let newTrans = allData.trans
        console.log('[信息]: 更新本地区块链')
        this.replaceTrans(newTrans)
        if (newChain.length > 1) { //如果只有起源块，则不需要更新
          this.replaceChain(JSON.parse(action.data).blockchain)
        }
        break
      case 'trans':
        // 网络上的交易请求 传给本地区块链
        if (!this.data.find(v => this.isEqualObj(v, action.data))) {
          console.log('[信息]: 交易合法 新增一下',action.data)

          this.addTrans(action.data)
        }
        break
      case 'mine':
        const lastBlock = this.getLastBlock()
        // let {blockchain,trans} = action.data

        if (lastBlock.hash === action.data.hash) {
          return
        }
        if (this.isValidNewBlock(action.data, lastBlock)) {
          console.log('[信息]: 有人挖矿成功，我们恭喜这位幸运儿')

          this.blockchain.push(action.data)
          this.data = []
          this.boardcast({ type: 'mine', data: action.data })
        } else {
          console.log('[错误]: 不合法的区块', action.data)
        }
        break
      default:
        console.log(
          `[错误]: 不合法的消息 '${JSON.stringify(action)}' from ${remote.address}:${
            remote.port
          }`
        )
    }
  }

  calculateHashForBlock (block) {
    const { index, previousHash, timestamp, data, nonce } = block
    return this.calculateHash(
      index,
      previousHash,
      timestamp,
      data,
      nonce
    )
  }
  sha256Hash (value, showLog = false) {
    const hash = crypto
      .createHash('sha256')
      .update(String(value))
      .digest('hex')
    if (showLog) {
      console.log(`[信息] 数据是 ${value} 哈希值是${hash}`)
    }
    return hash
  }

  calculateHash (index, previousHash, timestamp, data, nonce) {
    return this.sha256Hash(index + previousHash + timestamp + JSON.stringify(data) + nonce)
  }

  getLastBlock () {
    return this.blockchain[this.blockchain.length - 1]
  }

  addTrans (trans) {
    if (this.verifyTransfer(trans)) {
      this.data.push(trans)
    }
  }

  transfer (from, name, flash) {
    let address = flash
    const timestamp = new Date().getTime()
    const sig = key.sign({ from, name, address, timestamp })
    let transObj = { from, name, address, sig, timestamp }
    this.data.push(transObj)
    return transObj
  }
  // mine (address) {

  mine () {
    const start = new Date().getTime()
   
    const newBlock = this.generateNewBlock()

    if (this.isValidNewBlock(newBlock, this.getLastBlock())) {
      this.blockchain.push(newBlock)
      this.data = []
    } else {
      console.log('[错误]: 不合法的区块或者是链', newBlock)
    }
 
    const end = new Date().getTime()
    const offset = ((end - start) / 1000).toFixed(2)
    console.log(`[信息]: 挖矿结束 用时${offset}s , 算了${newBlock.nonce}次, 哈希值是${newBlock.hash}`)
    return newBlock
  }

  generateNewBlock () {
    const nextIndex = this.blockchain.length
    const previousHash = this.getLastBlock().hash

    let data = this.data
    let timestamp = new Date().getTime()
    let nonce = 0
    let hash = this.calculateHash(nextIndex, previousHash, timestamp, data, nonce)
    const newBlock={
                  index: nextIndex,
                  previousHash,
                  timestamp,
                  nonce,
                  hash,
                  data};
    this.blockchain.push(newBlock);
    this.data = [];
    return {
      index: nextIndex,
      previousHash,
      timestamp,
      nonce,
      hash,
      data
    }
  }
  isValidNewBlock (newBlock, previousBlock) {
    const newBlockHash = this.calculateHashForBlock(newBlock)
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('[错误]: 新区块index不对')

      return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log(`[错误]: 第${newBlock.index}个区块的previousHash不对`)

      return false
    } else if (newBlockHash !== newBlock.hash) {
      console.log(`[错误]: 第 ${newBlock.index}个区块hash不对,算出的是${newBlockHash} 区块里本来的hash是${newBlock.hash} 看来数据被篡改了`)

      return false
    } else if (newBlockHash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      return false
    } else if (!this.isValidTrans(newBlock.data)) {
      console.log('[错误]: 交易不合法')
      return false
    } else {
      return true
    }
  }
  verifyTransfer (trans) {
    return trans.from === '0' ? true : key.verify(trans, trans.from)
  }
  isValidTrans (trans) {
    return trans.every(v => this.verifyTransfer(v))
  }
  isValidChain (chain = this.blockchain) {
    // chain[0].hash = '122xx'

    if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
      return false
    }
    for (let i = chain.length - 1; i >= 1; i = i - 1) {
      if (!this.isValidNewBlock(chain[i], chain[i - 1])) {
        console.log(`[错误]: 第${i}个区块不合法`)
        return false
      }
    }
    return true
  }

  replaceTrans (trans) {
    if (this.isValidTrans(trans)) {
      this.data = trans
    }
  }

  replaceChain (newChain) {
    if (newChain.length === 1) {
      return
    }
    if (this.isValidChain(newChain) && newChain.length > this.blockchain.length) {
      this.blockchain = JSON.parse(JSON.stringify(newChain))
    } else {
      console.log(`[错误]: 区块链数据不合法`)
    }
  }

  mineDemo (data, difficulty) {
    let nonce = 0
    let hash = this.sha256Hash(String(data) + nonce, true)
    while (hash.slice(0, difficulty) !== '0'.repeat(difficulty)) {
      nonce = nonce + 1
      hash = this.sha256Hash(String(data) + nonce, true)
    }
  }
  
  mineForBlock (index) {
    const block = this.blockchain[index]
    if (this.isValidNewBlock(block, this.blockchain[index - 1])) {
      console.log('[信息]: 区块本来就好好地，瞎合计啥呢')
      return
    }
    // const previousHash = '0'
    const previousHash = this.blockchain[index - 1].hash
    let data = block.data
    let timestamp = block.timestamp
    let nonce = 0
    let hash = this.calculateHash(index, previousHash, timestamp, data, nonce)
    while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
      nonce = nonce + 1
      hash = this.calculateHash(index, previousHash, timestamp, data, nonce)
    }
    this.blockchain[index] = {
      index,
      previousHash,
      timestamp,
      nonce,
      hash,
      data
    }
    console.log(`[信息]: 区块${index}修复完毕`)
  }
}

module.exports = Blockchain