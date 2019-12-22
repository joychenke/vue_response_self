class Vue{
  constructor(options){
    this.data = options.data
    this.el = options.el
    this.methods = options.methods
    this.vm = this
    // 将this.data[key] 映射为 this[key]
    Object.keys(this.data).forEach(key => {
      this.proxyKeys(key)
    })
    // 给data的属性key全部填上set和get方法
    observers(this.data)
    // 初始化模板，并生成订阅者
    new Compile(this)
    // 执行mounted方法，mounted里this绑定的是Vue实例
    options.mounted.call(this)
  }
  proxyKeys(key){
    Object.defineProperty(this, key, {
      // for...in遍历可枚举显示非Symbol属性，包括继承的可枚举属性，
      enumerable: false, // 不可枚举
      configurable: true, //
      get(){
        return this.data[key]
      },
      set(newVal){
        this.data[key] = newVal
      }
    })
  }
}