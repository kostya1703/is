const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


createAgent('A', 0, -15, -15)
createAgent('A', 0, -20, 15)
createAgent('B', 0, -51, -8)
createAgent('B', 0, -51, 8)

function createAgent(teamName, speed, x, y) {
  let agent = new Agent(speed, teamName) // Создание экземпляра агента
  require('./socket')(agent, teamName, VERSION) //Настройка сокета
  setTimeout(() => {
    agent.socketSend("move", `${x} ${y}`)
  }, 20)
}

