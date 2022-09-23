let slide = document.getElementById("slide")
slide.min = 5
slide.max = 50
slide.value = 10
slide.step = 5


var ctx = document.getElementById("canvas").getContext("2d");
let xSize = Math.floor(slide.value * 1.4);
let ySize = slide.value;
let widthMult = xSize / ySize;
ctx.canvas.height = window.innerHeight - 100;
ctx.canvas.width = ctx.canvas.height * widthMult;





class Cell{
    constructor(){
        this.flagged = false;
        this.revealed = false;
        let rand = Math.random();
        if (rand <= 0.15){
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
        ctx.fillRect(x * ctx.canvas.width / (this.xSize), y*ctx.canvas.height/(this.ySize), 
                ctx.canvas.width / (this.xSize), ctx.canvas.height / (this.ySize));
        ctx.stroke();
        ctx.beginPath();
        ctx.style = "black";
        ctx.rect(x * ctx.canvas.width / (this.xSize), y*ctx.canvas.height/(this.ySize), 
                ctx.canvas.width / (this.xSize), ctx.canvas.height / (this.ySize));
        ctx.stroke();
    }

    flagCell(x, y){
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.fillRect(x * ctx.canvas.width / (this.xSize), y*ctx.canvas.height/(this.ySize), 
                ctx.canvas.width / (this.xSize), ctx.canvas.height / (this.ySize));
        ctx.stroke();
    }

    revealCell(x, y){
        ctx.beginPath();
        ctx.fillStyle = "#0f2966";
        ctx.font = "16pt OCR A Std, monospace";
        ctx.fillText(this.cellArr[x][y].value, x * ctx.canvas.width / (this.xSize), (y+1) * ctx.canvas.height/(this.ySize), );
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
            ctx.fillText("GAME WON!", ctx.canvas.width / 8, ctx.canvas.height/(2));
            ctx.stroke();
        }
        if (this.cellArr[x][y].value == -1){
            this.randomize();
        }
    }

    displayCells(){
        for(let i = 0; i < this.xSize; i++){
            for(let j = 0; j < this.ySize; j++){
                this.emptyCell(i, j);
            }
        }
    }

    checkForBombs(x, y){
        let count = 0;
        for (let i = -1; i < 2; i++){
            for (let j = -1; j < 2; j++){
                if (this.cellExists(x+i, y+j) 
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
        for(let i = 0; i < this.xSize; i++){
            for(let j = 0; j < this.ySize; j++){
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

        for(let i = 0; i < this.xSize; i++){
            this.cellArr[i] = new Array(this.xSize);
            for(let j = 0; j < this.ySize; j++){
                this.cellArr[i][j]= new Cell();
            }
        }
    }

    createTable(){
        this.table = document.createElement('table');
        let tr, td, bt;
        let tRow = []
        document.getElementById("table").addEventListener('contextmenu', event => event.preventDefault());

        for(let j = 0; j < this.ySize; j++){
            //create rows for table
            tRow[j] = document.createElement('tr');
            this.table.append(tRow[j]);

            for(let i = 0; i < this.xSize; i++){
                //Create buttons for every row
                tRow[j].appendChild(td = document.createElement('td'));
                td.appendChild(bt = document.createElement('button'));
                //Weird fix to make buttons fit
                bt.style.width = (ctx.canvas.width)/this.xSize + "px";
                bt.style.height = (ctx.canvas.height)/this.ySize + "px";
                bt.style.border = "0px";
                bt.setAttribute("class", "cellButton");
                bt.onmousedown = function(event){
                    board.mouseInput(i, j, event);
                }
            }
        }
        document.getElementById('table').appendChild(this.table);
    }

    mouseInput(i, j, event){
        if (this.cellArr[i][j].revealed){
            return;
        }
        if (event.button == 0 && !this.cellArr[i][j].flagged) {
            if (!this.started){
                this.started = true;
                this.startGame(i, j);
            }
            this.revealCell(i, j);
        }
        if (event.button == 2) {
            if (this.cellArr[i][j].flagged){
                this.cellArr[i][j].flagged = false;
                this.emptyCell(i, j);
            }else{
                this.cellArr[i][j].flagged = true;
                this.flagCell(i, j);
            }
        }
        
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

var board = new Board(xSize, ySize);

slide.oninput = function(){
    let xSize = Math.floor(slide.value * 1.25);
    let ySize = slide.value;
    widthMult = xSize / ySize;
    board.deleteTable();
    board = new Board(xSize, ySize);
}







