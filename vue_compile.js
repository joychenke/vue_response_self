class Compile{
  constructor(elm){
    this.vm = elm
    this.el = document.querySelector(elm.el)
    this.fragment = null;
    this.init()
  }
  init(){
    if(!this.el){
      console.log("DOM元素不存在！")
      return
    }
    this.fragment = this.nodeToFragment(this.el)
    this.compileElement(this.fragment)
    // 将编译好的内容，添加到el上
    this.el.appendChild(this.fragment)
  }
  // 创建代码片段
  nodeToFragment(el){
    let fragment = document.createDocumentFragment()
    let child = el.firstChild
    while(child){
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  }
  // 编译模板中的内容，包括 双花括号{{}}，v-model，v-on
  compileElement(el){
    let childNodes = el.childNodes;
    [...childNodes].forEach(node => {
      let reg = /\{\{(.*)\}\}/
      let text = node.textContent
      // 元素节点和文本节点分别处理,nodeType是1时是元素节点，3时是文本节点
      let nodeType = node.nodeType
      if(nodeType === 1) {
        this.compileElemetNode(node)
      }else if(nodeType === 3 &&  reg.test(text)){
        this.compileTextNode(node,reg.exec(text)[1])
      }
      // 继续递归遍历所有子节点
      if(node.childNodes && node.childNodes.length){
        this.compileElement(node)
      }
    })
  }
  // 编译文本节点
  compileTextNode(node, exp){
    let initText = this.vm[exp]
    // 将data中exp的值初始化到视图中
    this.updateText(node, initText)
    // 将exp包装成订阅者
    new Watcher(this.vm, exp, value => {
      this.updateText(node, value)
    })
  }
  // 更新文本节点
  updateText(node, value){
    node.textContent = value || ""
  }
  // 编译元素节点
  compileElemetNode(node){
    let nodeAttrs = node.attributes;
    [...nodeAttrs].forEach(attr => {
      let attrName = attr.name;
      // 指令不是v-开头的不做处理
      if(attrName.indexOf("v-")){
        return
      }
      let exp = attr.value
      let dir = attrName.substring(2)
      // v-moel, v-on
      if(!dir.indexOf('on:')){
        this.compileEvent(node, this.vm,exp, dir)
      }else{
        this.compileModel(node, this.vm, exp)
      }
      node.removeAttribute(attrName)
    })
  }
  // 解析v-on指令：找到v-on后面的eventType，和它绑定的methods方法名cb，给节点做以下处理：绑定eventType事件，事件触发时，执行cb
  compileEvent(node, vm, exp,dir){
    let eventType = dir.split(":")[1]
    let cb = vm.methods && vm.methods[exp]
    if(eventType && cb){
      node.addEventListener(eventType, cb.bind(vm))
    }
  }
  // 解析v-model指令: 1， 将 v-model绑定的变量exp的值用方法cb填充到input的value中，2，用exp和cb创建一个Watcher实例，在exp修改时，调用cb修改input的value 3，监听node的input事件，修改exp的值
  compileModel(node, vm, exp){
    let val = vm[exp]
    this.modelUpdater(node, val)
    new Watcher(vm, exp, value => {
      this.modelUpdater(node, value)
    })
    // 监听input事件，修改exp的值
    node.addEventListener("input", e => {
      let newValue = e.target.value;
      if (val === newValue) {
        return;
      }
      // 修改了exp之后，input的内容也更改了
      vm[exp] = newValue;
    })
  }
  // 更新v-model数据
  modelUpdater(node, value){
    node.value = value || ""
  }
}