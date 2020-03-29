const Msg = require('./msg')
const DecisionTreeManager = require('./tree_manager')
const pass_dt = require('./pass_maker_decision_tree')
const goal_dt = require('./goal_maker_decision_tree')


class Agent {
  constructor(speed, teamName) {
    this.position = "l" // По умолчанию - левая половина поля
    this.speed = speed
    this.run = false // Игра начата
    this.teamName = teamName
  }


  msgGot(msg) { // Получение сообщения
    let data = msg.toString('utf8') // Приведение к строке
    this.processMsg(data) // Разбор сообщения
    this.sendCmd() // Отправка команды
  }


  setSocket(socket) { // Настройка сокета
    this.socket = socket
  }


  socketSend(cmd, value) { // Отправка команды
    this.socket.sendMsg(`(${cmd} ${value})`)
  }


  processMsg(msg) { // Обработка сообщения
    let data = Msg.parseMsg(msg) // Разбор сообщения
    if (!data) throw new Error("Parse error\n" + msg)
    // Первое (hear) - начало игры
    if (data.cmd == "hear") {
      if (data.msg.includes('play_on'))
        this.run = true
    }
    if (data.cmd == "init") this.initAgent(data.p) //Инициализация
    this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
  }


  initAgent(p) {
    if (p[0] == "r") this.position = "r" // Правая половина поля
    this.id = p[1] // id игрока
  }

  analyzeEnv(msg, cmd, p) {
    if (cmd === 'hear') {
      console.log(p)
    }
    if (cmd === 'hear' && p[2].includes('kick_off_')) {
      pass_dt.state.isGoal = false
      goal_dt.state.isGoal = false
      pass_dt.state.next = 0
      goal_dt.state.next = 0
    }
    if (cmd === 'hear' && p[2].includes('goal_l_')) {
      pass_dt.state.isGoal = true
      goal_dt.state.isGoal = true
      goal_dt.state.isHeardGo = false
    }
    if (cmd === 'hear' && p[2] === '"go"') {
      console.log('kek')
      goal_dt.state.isHeardGo = true
    }
    if (cmd === 'see' && this.run) {
      if (this.position === 'l') {
        if (this.id === 1) {
          this.act = DecisionTreeManager.getAction(pass_dt, p)
        } else {
          this.act = DecisionTreeManager.getAction(goal_dt, p)
        }
      }
    }
  }

  sendCmd() {
    if (this.run) { // Игра начата
      if (this.act) { // Есть команда от игрока
        if (this.act.n == "kick") // Пнуть мяч
          this.socketSend(this.act.n, this.act.v)
        else // Движение и поворот
          this.socketSend(this.act.n, this.act.v)
      }
      this.act = null // Сброс команды
    }
  }
}

module.exports = Agent // Экспорт игрока
