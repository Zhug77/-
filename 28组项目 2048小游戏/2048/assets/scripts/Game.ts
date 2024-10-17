import { _decorator, AudioClip, AudioSource, Component, instantiate, Label, Node, NodeEventType, Prefab, tween, UITransform, v2, v3, Vec2 } from 'cc';
import { Cell } from './Cell';
const { ccclass, property } = _decorator;
enum MOVE_DIRECTION{UP,DOWN,LEFT,RIGHT};

@ccclass('Game')
export class Game extends Component {

    @property(Node)
    startPage:Node = null!;

    @property(Node)
    gamePage:Node = null!;

    @property(Node)
    gamePage4:Node = null!;

    @property(Node)
    overPage:Node = null!;

    @property(Prefab)
    cell:Prefab = null!;

    @property(Node)
    cellParent:Node = null!;

    @property(Node)
    cellParent4:Node = null!;

    //分数
    @property(Label)
    txtScore:Label = null!;

    @property(Label)
    txtScore4:Label = null!;

    @property(Label)
    overScore:Label = null!;

    @property(AudioClip)
    mergeAudio:AudioClip = null!;

    @property(AudioClip)
    moveAudio:AudioClip = null!;
    

    
    private level = 4;
    private gameData = [];
    private cellParentWidth = 720;
    private cellPadding = 15;
    private cellWidth = Math.round((this.cellParentWidth - (this.level + 1) * this.cellPadding) / this.level);
    
    //鼠标点击移动位置
    private touchStartPos = null;
    private touchEndPos = null;

    private audioSource:AudioSource = new AudioSource();

    private score = 0;

    start() {
        this.activeStartPage();
        
    }

    update(deltaTime: number) {
        
    }

    onclickBtnStart()
    {
        this.activeGamePage();
        this.initGamePage();
        this.score = 0;
        this.updateScore();
    }

    onclickBtnStart4()
    {
        this.score = 0;
        this.level = 4;
        this.cellPadding = 15;
        this.cellWidth = 165;
        this.activeGamePage4();
        this.initGamePage();
        this.updateScore();
    }

    onclickBtnStart5()
    {
        this.score = 0;
        this.level = 5;
        this.cellPadding = 15;
        this.cellWidth = Math.round((this.cellParentWidth - (this.level + 1) * this.cellPadding) / this.level);
        this.activeGamePage();
        this.initGamePage();
        this.updateScore();
    }

    onclickBtnHome()
    {
        this.activeStartPage();
    }

    activeStartPage()
    {
        this.startPage.active = true;
        this.gamePage.active = false;
        this.overPage.active = false;
        this.gamePage4.active = false;
    }

    activeGamePage()
    {
        this.startPage.active = false;
        this.gamePage.active = true;
        this.overPage.active = false;
        this.gamePage4.active = false;
    }

    activeGamePage4()
    {
        this.startPage.active = false;
        this.gamePage.active = false;
        this.overPage.active = false;
        this.gamePage4.active = true;
    }

    activeOverPage()
    {
        this.startPage.active = false;
        this.gamePage.active = true;
        this.overPage.active = true;
        this.gamePage4.active = false;
    }

    activeOverPage4()
    {
        this.startPage.active = false;
        this.gamePage.active = false;
        this.overPage.active = true;
        this.gamePage4.active = true;
    }
    //初始化游戏界面
    /*
    1.初始化二维数组
    2.初始化棋盘
    3.生成随机格子
    */
    initGamePage()
    {
        //初始化二维数组
        this.initGameData();
        this.initCellBoard();
        this.generateRandomCell();
        this.addMoveListener();
        
    }

    initGameData()
    {
        for(let i = 0; i<this.level;i++)
        {
            //四行 二维数组
            this.gameData[i] = [];     
        }

        for(let i = 0;i<this.level;i++)
        {
            for(let j =0;j<this.level;j++)
            {
                this.gameData[i][j]=0;
            }
        }
    }

    initCellBoard()
    {
        for(let i = 0;i<this.level;i++)
        {
            for(let j = 0;j<this.level;j++)
            {
                //创建格子
                this.createCell(i,j,this.gameData[i][j]);
            }
        }
    }

    /*创建格子
     * @param i 格子在第几行
     * @param j 格子在第几列
     * @param num 格子上的数字
    */
    createCell(i:number,j:number,num:number)
    {
        


        //实例化格子
        let cellInstance = instantiate(this.cell);
        let cellScript = cellInstance.getComponent(Cell);
        if(cellScript)
        {
            cellScript.setCellNum(num);
        }

        //格子位置
        let cellPos = this.calCellPos(i,j);
        cellInstance.position = v3(cellPos.x , cellPos.y , 0);

        //设置格子大小
        let cellUI = cellInstance.getComponent(UITransform);
        cellUI.height = this.cellWidth;
        cellUI.width = this.cellWidth;

        //设置父容器
        if(this.level == 5)
            cellInstance.parent = this.cellParent;
        else
            cellInstance.parent = this.cellParent4;

        //设置动画
        
        if(num > 0)
        {
            cellInstance.scale = v3(0,0,0);
            console.log("Starting animation for cell:", i, j); // 调试信息
            tween(cellInstance).to(0.15,{scale:v3(1,1,1)},{easing:"sineInOut"}).start();
        }
    }

    calCellPos(i:number,j:number):Vec2
    {
        if(this.level == 5)
        {
            let x = (j - 2) * (this.cellWidth + this.cellPadding);
            let y = (2 - i) * (this.cellWidth + this.cellPadding);
            return v2(x, y);
        }
        else if(this.level == 4)
        {
            let x = (j - 2) * (this.cellWidth + this.cellPadding) + 90;
            let y = (2 - i) * (this.cellWidth + this.cellPadding) - 90;
            return v2(x, y);
        }
        
    }

    generateRandomCell()
    {
        let emptyCells = this.getAllEmptyCells();
        if(emptyCells.length > 0)
        {
            //随机找一个格子
            let randomCellIdx = Math.floor(Math.random() * emptyCells.length);
            let randomCell = emptyCells[randomCellIdx];
            let i = randomCell.x;
            let j = randomCell.y;

            //随机2或4
            let randomCellNum = Math.round(Math.random() * 20);
            randomCellNum = randomCellNum < 5 ? 4 : 2;
            
            this.gameData[i][j] = randomCellNum;
            this.createCell(i,j,randomCellNum);
        }
    }

    getAllEmptyCells()
    {
        let emptyCells = [];
        for(let i = 0;i<this.level;i++)
        {
            for(let j =0;j<this.level;j++)
            {
                if(this.gameData[i][j] == 0)
                {
                    emptyCells.push(v2(i,j));
                }
            }
        }
        return emptyCells;
    }

    addMoveListener()
    {
        if(this.level == 5)
        {
            this.cellParent.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
            this.cellParent.on(NodeEventType.TOUCH_END,this.onTouchEnd,this);
        }
        else
        {
            this.cellParent4.on(NodeEventType.TOUCH_START,this.onTouchStart,this);
            this.cellParent4.on(NodeEventType.TOUCH_END,this.onTouchEnd,this);
        }
    }

    //开始点击,记录点击的位置
    onTouchStart(event)
    {
        this.touchStartPos = event.getLocation();
    }

    //结束点击的时候记录点击位置并计算和开始位置的差值
    onTouchEnd(event)
    {
        this.touchEndPos = event.getLocation();
        //计算横向纵向距离
        let xDistance:number = this.touchEndPos.x - this.touchStartPos.x;
        let yDistance:number = this.touchEndPos.y - this.touchStartPos.y;
        let moveDirection;
        //判断方向
        if(Math.abs(xDistance) > Math.abs(yDistance))//横向位移大于纵向位移判定为横向移动
        {
            moveDirection = xDistance>0 ? MOVE_DIRECTION.RIGHT : MOVE_DIRECTION.LEFT;
        }
        else//纵向
        {
            moveDirection = yDistance>0 ? MOVE_DIRECTION.UP : MOVE_DIRECTION.DOWN;
        }

        //移动
        this.doMove(moveDirection);
    }

    doMove(moveDirection:MOVE_DIRECTION)
    {
        switch(moveDirection)
        {
            case MOVE_DIRECTION.UP:
                console.log("向上移动");
                this.doMoveAndMerge();
                break;
            case MOVE_DIRECTION.DOWN:
                console.log("向下移动");
                this.doMoveAndMergeDown();
                break;
            case MOVE_DIRECTION.LEFT:
                console.log("向左移动");
                this.doMoveAndMergeLeft();
                break;
            case MOVE_DIRECTION.RIGHT:
                console.log("向右移动");
                this.doMoveAndMergeRight();
                break;
        }
    }

    //向上移动
    doMoveAndMerge()
    {
        let moved = false;
        let merged = false;
        for(let j = 0;j < this.level; j++)
        {
            moved = this.moveUp(j) || moved;
            merged = this.mergeUp(j) || merged;
            if(merged)
            {
                moved = true;//若没有空格但能直接合并 则也算进行了一次移动
            }
        }
        this.processAfterMove(moved,merged);
    }

    

    moveUp(j:number)
    {
        let moved = false;
        for(let i = 0;i < this.level;i++)
        {
            if(this.gameData[i][j] == 0)
            {
                //若当前格子是空的，则将下方的第一个非空格子挪上来
                for(let k = i+1;k < this.level;k++)
                {
                    if(this.gameData[k][j] != 0)
                    {
                        this.gameData[i][j] = this.gameData[k][j];
                        this.gameData[k][j] = 0;
                        moved = true;
                        break;
                    }
                }
            }
        }
        return moved;
    }

    mergeUp(j:number):boolean
    {
        let merged = false;
        for(let i = 0;i < this.level - 1;i++)
        {
            if(this.gameData[i][j] == this.gameData[i + 1][j] && this.gameData[i][j] != 0)
            {
                this.gameData[i][j] *= 2;
                this.gameData[i+1][j] = 0;
                this.score += this.gameData[i][j];
                merged = true;
            }
        }
        this.moveUp(j);
        return merged;
    }

    //向下移动
    doMoveAndMergeDown()
    {
        let moved = false;
        let merged = false;
        for(let j = 0;j < this.level; j++)
        {
            moved = this.moveDown(j) || moved;
            merged = this.mergeDown(j) || merged;
            if(merged)
            {
                moved = true;//若没有空格但能直接合并 则也算进行了一次移动
            }
        }
        this.processAfterMove(moved,merged);
    }

    moveDown(j:number):boolean
    {
        let moved = false;
        for(let i = this.level - 1; i >= 0 ;i--)
        {
            if(this.gameData[i][j] == 0)
            {
                //若当前格子是空的，则将上方的第一个非空格子挪上来
                for(let k = i-1;k >= 0;k--)
                {
                    if(this.gameData[k][j] != 0)
                    {
                        this.gameData[i][j] = this.gameData[k][j];
                        this.gameData[k][j] = 0;
                        moved = true;
                        break;
                    }
                }
            }
        }
        return moved;
    }

    mergeDown(j:number)
    {
        let merged = false;
        for(let i = this.level - 1 ; i > 0 ; i--)
        {
            if(this.gameData[i][j] == this.gameData[i-1][j] && this.gameData[i][j] != 0)
            {
                this.gameData[i][j] *= 2;
                this.gameData[i - 1][j] = 0;
                this.score += this.gameData[i][j];
                merged = true;
            }
        }
        this.moveDown(j);
        return merged;
    }


    doMoveAndMergeLeft()
    {
        let moved = false;
        let merged = false;
        for(let j = 0;j < this.level; j++)
        {
            moved = this.moveLeft(j) || moved;
            merged = this.mergeLeft(j) || merged;
            if(merged)
            {
                moved = true;//若没有空格但能直接合并 则也算进行了一次移动
            }
        }
        this.processAfterMove(moved,merged);
    }

    moveLeft(i : number)
    {
        let moved = false;
        for(let j = 0;j < this.level ; j++)
        {
            if(this.gameData[i][j] == 0)
            {
                for(let k = j + 1;k < this.level;k++)
                {
                    if(this.gameData[i][k] != 0)
                    {
                        this.gameData[i][j] = this.gameData[i][k];
                        this.gameData[i][k] = 0;
                        moved = true;
                        break;
                    }
                }
            }
        }
        return moved;
    }

    mergeLeft(i : number):boolean
    {
        let merged = false;
        for(let j = 0; j < this.level - 1;j++)
        {
            if(this.gameData[i][j] == this.gameData[i][j+1] && this.gameData[i][j] != 0)
            {
                this.gameData[i][j] *= 2;
                this.gameData[i][j + 1] = 0;
                this.score += this.gameData[i][j];
                merged = true;
            }
        }
        this.moveLeft(i);
        return merged;
    }

    doMoveAndMergeRight()
    {
        let moved = false;
        let merged = false;
        for(let j = 0;j < this.level; j++)
        {
            moved = this.moveRight(j) || moved;
            merged = this.mergeRight(j) || merged;
            if(merged)
            {
                moved = true;//若没有空格但能直接合并 则也算进行了一次移动
            }
        }
        this.processAfterMove(moved,merged);
    }

    moveRight(i : number)
    {
        let moved = false;
        for(let j = this.level - 1;j >= 0 ; j--)
        {
            if(this.gameData[i][j] == 0)
            {
                for(let k = j - 1;k >= 0;k--)
                {
                    if(this.gameData[i][k] != 0)
                    {
                        this.gameData[i][j] = this.gameData[i][k];
                        this.gameData[i][k] = 0;
                        moved = true;
                        break;
                    }
                }
            }
        }
        return moved;
    }

    mergeRight(i : number):boolean
    {
        let merged = false;
        for(let j = this.level - 1; j > 0;j--)
        {
            if(this.gameData[i][j] == this.gameData[i][j-1] && this.gameData[i][j] != 0)
            {
                this.gameData[i][j] *= 2;
                this.gameData[i][j - 1] = 0;
                this.score += this.gameData[i][j];
                merged = true;
            }
        }
        this.moveRight(i);
        return merged;
    }


    /*
     * 移动后的处理
     * 1.重新绘制棋盘格子
     * 2.新生成随机格子
    */
    processAfterMove(moved:boolean,merged:boolean)
    {
        if(!moved)
        {
            return;
        }
        this.initCellBoard();
        this.generateRandomCell();
        
        if(merged)
        {
            this.updateScore();
            //this.audioSource.playOneShot(this.mergeAudio);
        }
        else
        {
            //this.audioSource.playOneShot(this.moveAudio);
        }
        this.checkOver();
    }

    updateScore()
    {
        if(this.level == 5)
            this.txtScore.string = this.score.toString();
        else
            this.txtScore4.string = this.score.toString();
    }

    checkOver()
    {
        if(this.checkGameOver())
        {
            this.overScore.string = this.score.toString();
            if(this.level == 5)
                this.activeOverPage();
            else
                this.activeOverPage4();
        }
    }

    checkGameOver():boolean
    {
        for(let i = 0;i < this.level;i++)
            for(let j =0;j < this.level;j++)
            {
                if(this.gameData[i][j] == 0)
                    return false;
            }

        for(let i = 0;i < this.level ;i++)
        {
            for(let j=0;j<this.level-1;j++)
            {
                if(this.gameData[i][j] == this.gameData[i][j+1])
                    return false;
            }
        }

        for(let i = 0;i < this.level - 1 ;i++)
        {
            for(let j=0;j<this.level;j++)
            {
                if(this.gameData[i][j] == this.gameData[i+1][j])
                    return false;
            }
        }
        
        return true;

    }
}




