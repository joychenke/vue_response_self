class Watcher{
  constructor(vm, exp, cb){
    this.vm = vm
    this.exp = exp
    this.cb = cb
    this.value = this.get()
  }
  // 当前订阅者进行更新
  update(){
    this.run()
  }
  // 旧值新值不等的时候，更新watcher里的value，并执行回调函数cb
  run(){
    let value = this.vm.data[this.exp]
    let oldVal = this.value
    if(value !== oldVal){
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  }
  // exp添加到订阅器的操作只用执行一次，唯一的一次就是此处的get方法
  get(){
    // 此时访问不到Dep的实例，只能给Dep类加静态属性target
    Dep.target = this;
    // exp在调用get方法时，根据Dep的静态属性target，决定是否需要把exp添加到订阅器中  
    let value = this.vm.data[this.exp]
    Dep.target = null
    return value
  }
}