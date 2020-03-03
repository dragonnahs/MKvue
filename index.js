class KVue{
    constructor(options){
        this.$options = options
        this.$data = options.data
        // 监听数据
        this.obverse(this.$data)
        new Compile(options.el,this)
        // 调用初始化函数
        this.$options.created && this.$options.created.call(this)
    }
    obverse(value){
        if(!value || typeof value !== 'object'){
            return
        }
        Object.keys(value).forEach(key => {
            this.defineReactive(value,key,value[key])
            this.proxyData(key)
        })
    }
    proxyData(key){
        // 代理函数，将data属性代理到Mvue实例上
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key]
            },
            set(newValue){
                this.$data[key] = newValue
            }
        })
    }
    defineReactive(obj,key,value){
        this.obverse(value)
        // 定一个依赖实例，每个data属性一个依赖实例，实例的deps数组中可以含有多个监听对象
        const dep = new Dep()
        Object.defineProperty(obj,key, {
            get(){
                // 在获取属性值时把监听对象传入到依赖数组中，
                Dep.target && dep.addDep(Dep.target)
                return value
            },
            set(newValue){
                if(newValue === value){
                    return 
                }
                value = newValue
                dep.notify()
            }
        })
    }
    
}

// 收集依赖的类
class Dep{
    constructor(){
        this.deps = []
    }
    addDep(dep){
        // 增加依赖
        this.deps.push(dep)
    }
    notify(){
        // 数据更新后调用，通知所有依赖调用更新函数,这里数组中的每个元素都是监听对象(就是Watcher实例)
        this.deps.forEach(dep => {
            dep.update()
        })
    }
}

// 监听对象
class Watcher{
    constructor(vm,exp,cb){
        this.vm = vm
        this.exp = exp
        this.cb = cb
        // 将Watcher实例定一个成Dep的一个静态属性
        Dep.target = this
        // 触发data数据获取，添加依赖
        this.vm[exp]
        // 将实例置空
        Dep.target = null
    }
    update(){
        // 调用每个监听对象的更新函数，在定义的时候传入处理函数
        this.cb.call(this.vm,this.vm[this.exp])
    }
}