// local storage init
if(localStorage.getItem("players") === null)
  localStorage.setItem("players", JSON.stringify([]));


var game = {
  //for game board
  board:document.getElementById("board"),
  boardLength:30,
  rows:null,
  direction:null,
  gameIsStarted:false,

  //for snake
  snakeCoords:[],
  interval:null,
  speed:200,

  //for fruit and obstacle
  busy:false,
  minusBusy:false,
  obstacleBusy:false,

  //for score 
  possibleMinusPointCoords: {row:null,ind:null},
  point:0,
  gameOverInterval:null,

  //for Player inputs
  playerName:'',
  posiblePointCoords: {row:null,ind:null},
  playerMaxScore:0,

  
  /*********************************************************************************************************/
  /*                                       PLAYER INPUTS                                                   */
  /*********************************************************************************************************/
  tryStartGame:function(e){
    var element = game.getid('userLogin');
    if(e.keyCode == 13 && !element.classList.contains('textFieldObject')) game.submitPleyer('playerName');
  },

 
  resetGameParameters:function(){
      this.rows=null;
      this.direction=null;
      this.gameIsStarted = false;
      this.snakeCoords=[];
      this.interval=null;
      this.speed=200;
      this.busy=false;
      this.point=0;
      this.posiblePointCoords = {row:null,ind:null};
      this.possibleMinusPointCoords= {row:null,ind:null};

  },

  checkPlayerName:function(name){
    var playerExists = false;
    var players = JSON.parse(localStorage.getItem('players'));
    players.forEach(function(player){if(player.nickName == name) playerExists = true;});
    return playerExists;
  },

  getPlayerMaxScore:function(){
    var player = JSON.parse(localStorage.getItem('players')).find(function(el){ if(el.nickName == game.playerName) return el; });
    return player.maxScore;
  },

  submitPleyer:function(inputID){
      var name = this.getid(inputID).value.trim();
      if(name.length < 1) return alert('write your name(nickname).');

      this.playerName = name;
      localStorage.setItem("activePlayer", this.playerName);
      if(!this.checkPlayerName(this.playerName)){
        var players = JSON.parse(localStorage.getItem('players'));
        var playerObj = {nickName:this.playerName,maxScore:0};
        players.push(playerObj)
        localStorage.setItem("players", JSON.stringify(players));
      }
      this.getid('submitPleyer').setAttribute('disabled','disabled');
      this.getAll('.textInfo').forEach(el => el.classList.remove('textFieldObject'));
      var self = this;
      setTimeout(function(){
          self.board.innerHTML = "";
          game.init();
          self.getid("userLogin").classList.add("textFieldObject");
          self.getid("mainWrapper").classList.remove("textFieldObject");
          game.startGame();
      },1400);
  },

  /*********************************************************************************************************/
  /*                                          GAME START AND RESTART                                       */
  /*********************************************************************************************************/
  drawBoard:function(){
      for(var i = 0; i<this.boardLength;i++){
          var row = document.createElement("div");
          row.classList.add('row');
          row.setAttribute('index',i);
          for(var j = 0; j<this.boardLength;j++){
            var div = document.createElement("div");
            div.classList.add("box");
            row.appendChild(div);
          }
          this.board.appendChild(row);
        }
  },

  init:function(){
      this.getAll('.textInfo').forEach(el=>el.classList.add('textFieldObject'));
      this.drawBoard();
      this.rows = this.getAll('.row');
      for(var i = 1;i<4;i++){
        this.snakeCoords.push({row:2,ind:i});
      }
      this.playerMaxScore = this.getPlayerMaxScore();
      document.getElementById('playerFullname').innerHTML = this.playerName;
      document.getElementById('playerRecord').innerHTML = this.playerMaxScore;
      document.onkeydown = this.changeDirection;
  },

  startGame:function(){
      this.updateLeaderBoard();
      this.gameIsStarted = true;
      this.setCoords();
      this.setDirection('right');
      this.getNewPointBox();
      this.getNewMinusPointBox();
      this.getNewObstacle();
  },

  setDirection:function(dir,isManual= false){
    this.direction = dir;
    if(!isManual) this.interval = setInterval(this.runSnakeRun,this.speed);
    else this.runSnakeRun(isManual);
  },

  /*********************************************************************************************************/
  /*                                          OBSTACLE                                                     */
  /*********************************************************************************************************/
  getNewObstacle:function(){
    var boxes = document.querySelectorAll('.box');
    var randomIndex = this.getRandomIndex(0,boxes.length-1);
    var randomBox = boxes[randomIndex];
    if(randomBox.classList.contains('black')) return this.getNewObstacle();
    else {
      for(var wall=0;wall<6;wall++)
      {
        boxes[randomIndex+wall].classList.add('obstacle');
      }
    }
  },

  removeOldObstacle:function(){
    this.getAll('.obstacle')[0].classList.remove('obstacle');
  },

  getGameOverOnObstacle:function(){
    var self = this;
    var element = self.getAll('.obstacle')[0];
    if(typeof element == 'undefined') return {row:-1,ind:-1};
    var parent = element.parentNode;
    var ind = [].indexOf.call(parent.children, element);
    var row = parseInt(parent.getAttribute("index"));
    return {row:row,ind:ind};
  },
 
  /*********************************************************************************************************/
  /*                                          FRUITS AND POISON                                            */
  /*********************************************************************************************************/
  getPointsCoords:function(){
    var self = this;
    var element = self.getAll('.green')[0];
    if(typeof element == 'undefined') return {row:-1,ind:-1};
    var parent = element.parentNode;
    var ind = [].indexOf.call(parent.children, element);
    var row = parseInt(parent.getAttribute("index"));
    return {row:row,ind:ind};
  },

  getMinusPointsCoords:function(){
    var self = this;
    var element = self.getAll('.purple')[0];
    if(typeof element == 'undefined') return {row:-1,ind:-1};
    var parent = element.parentNode;
    var ind = [].indexOf.call(parent.children, element);
    var row = parseInt(parent.getAttribute("index"));
    return {row:row,ind:ind};
  },

  removeOldPoint:function(){
    this.getAll('.green')[0].classList.remove('green');
  },

  removeOldMinusPoint:function(){
    this.getAll('.purple')[0].classList.remove('purple');
  },

  getRandomIndex:function (min,max)
  {
      return Math.floor(Math.random()*(max-min+1)+min);
  },

  getNewPointBox:function(){
      this.point = this.point + 1;
      this.speed -= 1;
      this.updatePlayerMaxScore();
      this.updateLeaderBoard();
      this.getid("playerScore").innerHTML = this.point;
      var boxes = document.querySelectorAll('.box');
      var randomIndex = this.getRandomIndex(0,boxes.length-1);
      var randomBox = boxes[randomIndex];
      if(randomBox.classList.contains('black'))
        return this.getNewPointBox();
      else randomBox.classList.add('green');
  },

  getNewMinusPointBox:function(){
    this.point = this.point - 1;
    this.speed -= 1;
    this.updatePlayerMaxScore();
    this.updateLeaderBoard();
    this.getid("playerScore").innerHTML = this.point;
    var boxes = document.querySelectorAll('.box');
    var randomIndex = this.getRandomIndex(0,boxes.length-1);
    var randomBox = boxes[randomIndex];
    if(randomBox.classList.contains('black')) return this.getNewMinusPointBox();
    else randomBox.classList.add('purple');
  },
 
  setCoords:function(){
    if(this.busy) return;
    this.busy = true;
    var self = this;
    var pointsCoords = self.getPointsCoords();
    var pointsMinusCoords=self.getMinusPointsCoords();
    var getObstacleCoords = self.getGameOverOnObstacle();
    var isPoint = false;
    var isMinusPoint=false;
    var isObstacle = false;
    var snakeHead = this.snakeCoords[this.snakeCoords.length-1];
    var snakeTail = this.snakeCoords[0];

    if(getObstacleCoords.row == snakeHead.row && (getObstacleCoords.ind == snakeHead.ind || getObstacleCoords.ind+1 == snakeHead.ind || getObstacleCoords.ind+2 == snakeHead.ind ||getObstacleCoords.ind+3 == snakeHead.ind ||getObstacleCoords.ind+4 == snakeHead.ind ||getObstacleCoords.ind+5 == snakeHead.ind))  {
      isObstacle = true;
      self.removeOldObstacle();
      setTimeout(self.setGameOverContent,100);
    }


    if(pointsCoords.row == snakeHead.row && pointsCoords.ind == snakeHead.ind) {
      isPoint = true;
      self.removeOldPoint();
      this.snakeCoords.unshift({row:self.posiblePointCoords.row,ind:self.posiblePointCoords.ind});
    }

    if(pointsMinusCoords.row == snakeHead.row && pointsMinusCoords.ind == snakeHead.ind) {
      isMinusPoint = true;
      self.removeOldMinusPoint();
      this.snakeCoords.shift();
      if(snakeHead==snakeTail)
      {
        setTimeout(self.setGameOverContent,500);
      }
    }

    var lastIndex = this.snakeCoords.length-1;
    this.snakeCoords.forEach(function(el,ind){
      if(lastIndex == ind) self.rows[el.row].querySelectorAll('.box')[el.ind].classList.add('snakeHead');
      self.rows[el.row].querySelectorAll('.box')[el.ind].classList.add('black');
    });

    if(isPoint) {
      self.getNewPointBox();
      //remove old wall of length 6
      for( var wallTile=0;wallTile<6;wallTile++)
      {
        self.removeOldObstacle();
      }
      self.getNewObstacle();
    }
    if(isMinusPoint) self.getNewMinusPointBox();
    this.minusBusy=false;
    this.busy = false;
    this.obstacleBusy=false;
    return self;
  },

  /*********************************************************************************************************/
  /*                                          SNAKE MOVEMENT                                               */
  /*********************************************************************************************************/
  getAll:function(query){
    return document.querySelectorAll(query);
  },

  getid:function(elem){
    return document.getElementById(elem);
  },

  removeOldCoords:function(){
    this.getAll('.black').forEach(el => el.classList.remove('black','snakeHead'));
    return this;
  },

  runSnakeRun:function(changeDir = false){
    var self = game;
    var newRow,newInd;

    // CLEAR INTERVAL
    if(changeDir) clearInterval(self.interval);

    var newCoords = self.snakeCoords.map(function(el,ind){
        // debugger;
        var nextInd = self.snakeCoords[ind+1];

        if(typeof nextInd == 'undefined'){
          //snake head
          switch(self.direction){
            case 'right':
              newRow = el.row;
              newInd = (el.ind + 1 >= self.boardLength) ? 0 : el.ind + 1;
            break;
            case 'left':
              newRow = el.row;
              newInd = (el.ind - 1 < 0) ? self.boardLength - 1 : el.ind - 1;
            break;
            case 'up':
              newRow = (el.row - 1 < 0) ? self.boardLength - 1 : el.row - 1;
              newInd = el.ind;
            break;
            case 'down':
              newRow = (el.row + 1 >= self.boardLength) ? 0 : el.row + 1;
              newInd = el.ind;
            break;
          }
        }
        else{
          if(ind == 0) self.savePosiblePointCoords(el);
          newRow = nextInd.row;
          newInd = nextInd.ind;
        }

      return {row:newRow,ind:newInd};
    });
    if(!self.checkCoords(newCoords.slice(0,-1),newRow,newInd)) return self.gameOver();
    self.snakeCoords = newCoords;
    self.removeOldCoords().setCoords();
    if(changeDir) this.interval = setInterval(this.runSnakeRun,this.speed);
  },

  changeDirection:function(e){
    var self = game;
    if(!self.gameIsStarted) return;
      switch(e.keyCode){
        // up arrow
        case 38:
          if(self.direction != 'down') self.setDirection('up',true);
        break;
        // down arrow
        case 40:
          if(self.direction != 'up') self.setDirection('down',true);
        break;
        // left arrow
        case 37:
          if(self.direction != 'right') self.setDirection('left',true);
        break;
        // right arrow
        case 39:
          if(self.direction != 'left') self.setDirection('right',true);
        break;
        default: return;
      }
  },

  savePosiblePointCoords:function(el){
    this.posiblePointCoords.row = el.row;
    this.posiblePointCoords.ind = el.ind;
  },

  checkCoords:function(arr,row,ind){
    var gameContinues = true;
    for(var obj of arr){
      if(obj.row == row && obj.ind == ind) return gameContinues = false;
    }
    return gameContinues;
  },



  /*********************************************************************************************************/
  /*                                          GAME OVER                                                    */
  /*********************************************************************************************************/ 
  updatePlayerMaxScore:function(){
    var self = this;
    var players = JSON.parse(localStorage.getItem('players'));

    players.map(function(el){
      if(el.nickName == self.playerName){
         self.playerMaxScore = (self.point <= self.playerMaxScore) ? self.playerMaxScore : self.point;
         el.maxScore = self.playerMaxScore;
      }
      return el;
    });

    localStorage.setItem('players',JSON.stringify(players));

  },

  gameOver:function(){
    var self = this;
    clearInterval(this.interval);
    this.gameIsStarted = false;
    this.updatePlayerMaxScore();
    this.getid('playerRecord').innerHTML = this.playerMaxScore;
    self.gameOverInterval = setInterval(function(){
      self.getAll('.black').forEach(function(el,ind){ el.classList.toggle('fakeBlack'); });
    },200);

    setTimeout(self.setGameOverContent,2000);
  },

  setGameOverContent:function(){
    var self = game;
    clearInterval(self.gameOverInterval);
    self.board.style.width = self.board.offsetWidth + "px";
    self.board.style.height = self.board.offsetHeight + "px";
    self.board.innerHTML = self.getid('gameOverContent').innerHTML;
    self.resetGameParameters();
    self.updateLeaderBoard();
    
  },

  changePlayer:function(){
    var newPlayer = this.getid('playerName').value.trim();
    if(newPlayer.length < 1) return alert('type new player name!');
    this.playerName = newPlayer;
  },

  restartGame:function(){
    this.board.innerHTML = "";
    this.init();
    location.reload();
    this.startGame();
  },
  

  /*********************************************************************************************************/
  /*                                          LEADER BOARD                                                 */
  /*********************************************************************************************************/
 
  updateLeaderBoard:function(){
    var self = this;
    var tbody = self.getid('tbody');

    var players = JSON.parse(localStorage.getItem('players')).sort(function(x,y){ return y.maxScore-x.maxScore; })
    if(!players.length) return;
    tbody.innerHTML = "";
    players.forEach(function(player,ind){
      var playerTR = document.createElement('tr');
      var playerRaitingTD = document.createElement('td');
      playerRaitingTD.innerHTML = ind+1
      var playerNameTD = document.createElement('td');
      playerNameTD.innerHTML = player.nickName;
      if(player.nickName == self.playerName) playerTR.classList.add('currentPlayer');
      var playerMaxScoreTD = document.createElement('td');
      playerMaxScoreTD.innerHTML = player.maxScore;
      playerTR.appendChild(playerRaitingTD);
      playerTR.appendChild(playerNameTD);
      playerTR.appendChild(playerMaxScoreTD);
      tbody.appendChild(playerTR);
    })
  }
}

game.updateLeaderBoard();
document.onkeydown = game.tryStartGame;

  