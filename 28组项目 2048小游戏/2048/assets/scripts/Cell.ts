import { _decorator,Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cell')
export class Cell extends Component {
    @property(Sprite)
    cellBg:Sprite = null!;

    @property(Label)
    cellNum:Label = null!;

    setCellNum(num:number)
    {
        //数字显示
        this.cellNum.string = num > 0 ? num.toString() : '';
        
        //颜色显示
        this.setCellBg(num);
    }

    setCellBg(num:number)
    {
        switch(num)
        {
            case 0:
                this.cellBg.color = new Color(206,194,181);
                break;
            case 2:
                this.cellBg.color = new Color(238,228,218);
                break;
            case 4:
                this.cellBg.color = new Color(237,224,200);
                break;
            case 8:
                this.cellBg.color = new Color(242,177,121);
                break;    
            case 16:
                this.cellBg.color = new Color(245,149,99);
                break;
            case 32:
                this.cellBg.color = new Color(246,124,95);
                break;
            case 64:
                this.cellBg.color = new Color(246,94,59);
                break;
            case 128:
                this.cellBg.color = new Color(237,206,115);
                break;    
            case 256:
                this.cellBg.color = new Color(236,201,97);
                break;
            case 512:
                this.cellBg.color = new Color(238,199,80);
                break;
            case 1024:
                this.cellBg.color = new Color(239,139,65);
                break;
            case 2048:
                this.cellBg.color = new Color(239,193,46);
                break;
            case 4096:
                this.cellBg.color = new Color(255,60,61);
                break;    
        }
    }

}


