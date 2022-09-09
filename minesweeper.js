var ctx = document.getElementById("canvas").getContext("2d");
let xSize = 10;
let ySize = 10;
let widthMult = ySize / xSize;
ctx.canvas.height = window.innerHeight - 50;
ctx.canvas.width = ctx.canvas.height * widthMult;



class Cell{
    constructor(){
        this.flagged = false;
        this.revealed = false;
        let rand = Math.random();
        if (rand <= 0.25){
            this.value = -1;
        }
        else{
            this.value = 0;
        }
    }
}

class Board{
    constructor(xSize, ySize){
        this.xSize = xSize;
        this.ySize = ySize;
        this.cellArr = new Array(xSize);

        this.createCells();
        this.assignNums();
        this.displayCells();
        this.createTable();
    }

    randomize(){
        this.emptyArray();
        this.createCells();
        this.assignNums();
        this.displayCells();
    }

    emptyCell(x, y){
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.fillRect(x * ctx.canvas.width / (this.ySize), y*ctx.canvas.width/(this.ySize), 
                ctx.canvas.width / (this.ySize), ctx.canvas.width / (this.ySize));
        ctx.stroke();
        ctx.beginPath();
        ctx.style = "black";
        ctx.rect(x * ctx.canvas.width / (this.ySize), y*ctx.canvas.width/(this.ySize), 
                ctx.canvas.width / (this.ySize), ctx.canvas.width / (this.ySize));
        ctx.stroke();
    }

    flagCell(x, y){
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.fillRect(x * ctx.canvas.width / (this.ySize), y*ctx.canvas.width/(this.ySize), 
                ctx.canvas.width / (this.ySize), ctx.canvas.width / (this.ySize));
        ctx.stroke();
    }

    revealCell(x, y){
        ctx.beginPath();
        ctx.fillStyle = "#0f2966";
        ctx.font = "48pt OCR A Std, monospace";
        ctx.fillText(this.cellArr[x][y].value, x * ctx.canvas.height / (this.ySize), (y+1) * ctx.canvas.height/(this.ySize), );
        ctx.stroke();

        this.cellArr[x][y].revealed = true;
        this.safeCells--;

        //Conditions that need to be checked every move
        if (this.cellArr[x][y].value == 0){
            this.popEmpty(x, y);
        }

        if (this.cellArr[x][y].flagged){
            this.emptyCell(x, y);
        }

        if (this.safeCells == 0){
            ctx.beginPath();
            ctx.fillStyle = "purple";
            ctx.font = "100pt OCR A Std, monospace";
            ctx.fillText("GAME WON!", x * ctx.canvas.height / (this.ySize), (y+1) * ctx.canvas.height/(this.ySize), );
            ctx.stroke();
        }
        if (this.cellArr[x][y].value == -1){
            this.randomize();
        }
    }

    displayCells(){
        for(let i = 0; i < this.ySize; i++){
            for(let j = 0; j < this.xSize; j++){
                this.emptyCell(i, j);
            }
        }
    }

    checkForBombs(x, y){
        let count = 0;
        for (let i = -1; i < 2; i++){
            for (let j = -1; j < 2; j++){
                if (this.cellArr?.[x+i] !== undefined && this.cellArr[x+i]?.[y+j] !== undefined 
                    && this.cellArr[x+i][y+j].value == -1){
                    count++;
                }
            }
        }
        return count;
    }

    popEmpty(x, y){
        for (let i = -1; i < 2; i++){
            for (let j = -1; j < 2; j++){
                if (this.cellExists(x+i, y+j)  
                    && this.cellArr[x+i][y+j].value == 0 && !this.cellArr[x+i][y+j].revealed){
                    this.revealCell(x+i, y+j);
                    this.popEmpty(x+i, y+j);
                }
                if (this.cellExists(x+i, y+j)
                    && this.cellArr[x+i][y+j].value > 0 && !this.cellArr[x+i][y+j].revealed){
                    this.revealCell(x+i, y+j);
                }
            }
        }
    }
    
    startGame(x, y){
        this.clearStartBombs(x, y);
        this.assignNums();
        this.revealCell(x, y);
    }

    clearStartBombs(x, y){
        for (let i = -1; i < 2; i++){
            for (let j = -1; j < 2; j++){
                if (this.cellExists(x+i, y+j) && this.cellArr[x+i][y+j].value == -1){
                    this.cellArr[x+i][y+j].value = 0;
                }
            }
        }
        this.cellArr[x][y].value = 0;
    }

    cellExists(x, y){
        return this.cellArr?.[x] !== undefined && this.cellArr[x]?.[y] !== undefined;
    }

    assignNums(){
        this.safeCells = 1;
        for(let i = 0; i < this.ySize; i++){
            for(let j = 0; j < this.xSize; j++){
                if (this.cellArr[i][j].value != -1){
                    this.cellArr[i][j].value = this.checkForBombs(i, j);
                }
                if (this.cellArr[i][j].value >= 0){
                    this.safeCells++;
                }
            }
        } 
    }

    createCells(){
        this.started = false;
        for(let i = 0; i < this.ySize; i++){
            this.cellArr[i] = new Array(this.xSize);
            for(let j = 0; j < this.xSize; j++){
                this.cellArr[i][j]= new Cell();
            }
        }
    }

    createTable(){
        this.table = document.createElement('table');
        let tr, td, bt;
        let tRow = []
        document.getElementById("table").addEventListener('contextmenu', event => event.preventDefault());

        for(let j = 0; j < this.xSize; j++){
            //create rows for table
            tRow[j] = document.createElement('tr');
            this.table.append(tRow[j]);

            for(let i = 0; i < this.ySize; i++){
                //Create buttons for every row
                tRow[j].appendChild(td = document.createElement('td'));
                td.appendChild(bt = document.createElement('button'));
                //Weird fix to make buttons fit
                bt.style.width = (ctx.canvas.width - ySize*2)/this.ySize + "px";
                console.log(bt.style.width);
                bt.style.height = (ctx.canvas.width - xSize*2)/this.ySize + "px";
                bt.style.border = "0px";
                
                //All Cell mouse events
                bt.onmousedown = function(event) {
                    if (board.cellArr[i][j].revealed){
                        return;
                    }
                    if (event.button == 0 && !board.cellArr[i][j].flagged) {
                        if (!board.started){
                            board.started = true;
                            board.startGame(i, j);
                        }
                        board.revealCell(i, j);
                    }
                    if (event.button == 2) {
                        if (board.cellArr[i][j].flagged){
                            board.cellArr[i][j].flagged = false;
                            board.emptyCell(i, j);
                        }else{
                            board.cellArr[i][j].flagged = true;
                            board.flagCell(i, j);
                        }
                    }
                }
            }
        }
        document.getElementById('table').appendChild(this.table);
    }

    deleteTable(){
        this.table.remove();
    }

    emptyArray(){
        for(let i = 0; i < this.ySize; i++){
            for (let j = 0; j < this.xSize; j++){
                delete this.cellArr[i][j];
            }
        }
    }
}

let board = new Board(xSize, ySize);




