// Variabili globali

// flag per la modalità disegno
var listenMode = false;

// utilità per il tracciamento del mouse
var mousePos = undefined;

// main canvas
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// support canvas
var anotherCanvas = document.createElement('canvas');
var anotherContext = anotherCanvas.getContext('2d');

// struttura a due proprietà
function Point(x, y) {
    this.type = Point;

    this.X = x;
    this.Y = y;

    return this;
}

// Elemento bottone
function Button (fun) {
    this.type = Button;
    this.Text = "B";
    this.Location = new Point(10, 10);
    this.Size = new Point(20, 20);
    this.Fun = fun;

    return this;
}

// Immagine cliccabile
function ImageButton(fun) {
    this.type = ImageButton;

    this.Location = new Point(10,10);
    this.Size = new Point(20,20);
    this.Fun = fun;
    this.Image = undefined;
    this.Hitten = new Point(0,0);
    this.isShow = false;
    this.Dimensione_pennello = 1;
    this.Gomma = false;

    return this;
}

// Elemento a scorrimento orizzontale
function Slider(fun) {
    this.type = Slider;

    this.Min = 0;
    this.Max = 255;
    this.Position = 255;
    this.Location = new Point(10, 10);
    this.Size = new Point(100, 20);
    this.Text = "";
    this.Fun = fun;

    return this;
}

// Elemento a scelta multipla
function Chooser() {
    this.type = Chooser;

    this.Element = [];
    this.Selected = 0;
    this.isShow = false;
    this.Location = new Point(10, 10);
    this.Size = new Point(150, 20);
    this.Fun = function (evt) { this.isShow = !this.isShow; };

    var thisobj = this;
    this.Element.push = function (){
        thisobj.Size.Y += 20;
        return Array.prototype.push.apply(this,arguments);
    };

    this.Element.push(["Scegli un effetto",function(evt){}]);

    return this;
}

// Contenitore per controlli
function Controls(canvas) {
    this.type = Controls;

    var thisobj = this;

    // per il controllo del mousemove
    var haveToMove = false;

    // per il controllo dell'oggetto cliccato
    this.HitObj = undefined;

    // elementi dell'insieme
    this.Controls = [];

    // ciò che disegno
    this.Pattern = [];

    // Valori costanti
    var softGray = 'rgb(150,150,150)';
    var hardGray = 'rgb(100,100,100)';

    // Rendering dei bottoni
    function drawbutton(obj,color) {
        var Location = obj.Location;
        var Size = obj.Size;
        var Center = new Point(Location.X + (Size.X / 2) , Location.Y + (Size.Y /2) );
        var Text = obj.Text;

        context.beginPath();

        context.fillStyle = color;
        context.fillRect(Location.X, Location.Y, Size.X, Size.Y);

        context.font = "12px Arial";
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(Text,Center.X,Center.Y);
    }

    // rendering delle immagini cliccabili
    function drawimagebutton(obj) {
        var Location = obj.Location;
        var Size = obj.Size;

        if(obj.Image != undefined && listenMode){
            context.beginPath();
            context.drawImage(obj.Image,Location.X,Location.Y);
            var raggio = 3;
            context.arc(Location.X + obj.Hitten.X, Location.Y + obj.Hitten.Y, raggio, 0, 2 * Math.PI, false);
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.stroke();
        }
    }

    // rendering degli elementi scorribili
    function drawslider(obj,color) {
        var Location = obj.Location;
        var Size = obj.Size;
        var Center = new Point(Location.X + (Size.X / 2) , Location.Y + (Size.Y /2));
        var barSize = 3;
        var Text = obj.Text;

        context.beginPath();
        context.fillStyle = 'rgb(200,200,200)';
        context.fillRect(Location.X+3, Location.Y+(Size.Y / 2)-barSize,Size.X-6, (Size.Y / 2) - barSize);

        context.font = "12px Arial";
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(Text,Center.X,Center.Y);

        context.beginPath();
        context.fillStyle = color;
        // in percentuale da position - min
        var barCenter = (obj.Position-obj.Min)/obj.Max;
        context.fillRect(Location.X + (Size.X-6)*barCenter ,Location.Y,6,Size.Y);
    }

    // rendering degli elementi a scelta multipla
    function drawchooser(obj,color) {
        var Location = obj.Location;
        var Size = obj.Size;
        var lineSize = 20;
        var Center = new Point(Location.X + (Size.X / 2) , Location.Y + (lineSize /2) );

        //Rettangolo fisso
        context.beginPath();
        context.rect(Location.X,Location.Y,Size.X,lineSize);
        context.fillStyle = "white";
        context.fill();
        context.strokeStyle = color;
        context.stroke();

        //Linea di scelta
        context.beginPath();
        context.moveTo(Location.X+Size.X-lineSize,Location.Y);
        context.lineTo(Location.X+Size.X-lineSize,Location.Y+lineSize);
        context.strokeStyle = color;
        context.stroke();

        //Elemento selezionato
        context.beginPath();
        context.font = "12px Arial";
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(obj.Element[obj.Selected][0],Center.X,Center.Y);

        if(obj.isShow){

            //Triangolo in giù
            context.beginPath();
            context.moveTo(Location.X+Size.X-lineSize+5,Location.Y+5);
            context.lineTo(Location.X+Size.X-lineSize+15,Location.Y+5);
            context.lineTo(Location.X+Size.X-lineSize+10,Location.Y+15);
            context.lineTo(Location.X+Size.X-lineSize+5,Location.Y+5);
            context.strokeStyle = color;
            context.stroke();

            //Rettangolo di lista
            context.beginPath();
            context.rect(Location.X,Location.Y+lineSize,Size.X,obj.Element.length * lineSize);
            context.fillStyle = "white";
            context.fill();
            context.strokeStyle = color;
            context.stroke();

            //Disegno della scelta selezionata
            context.beginPath();
            context.rect(Location.X,Location.Y + ((obj.Selected + 1) * (lineSize)),Size.X,lineSize);
            context.fillStyle = color;
            context.fill();

            //Disegno delle scelte
            context.beginPath();
            context.font = "12px Arial";
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            for(var i=0;i<obj.Element.length;i++) {
                context.fillText(obj.Element[i][0], Center.X, Center.Y + ((i+1)*lineSize));
            }
        } else {
            //Triangolo a destra
            context.beginPath();
            context.moveTo(Location.X+Size.X-lineSize+5,Location.Y+5);
            context.lineTo(Location.X+Size.X-lineSize+5,Location.Y+15);
            context.lineTo(Location.X+Size.X-lineSize+15,Location.Y+10);
            context.lineTo(Location.X+Size.X-lineSize+5,Location.Y+5);
            context.strokeStyle = color;
            context.stroke();
        }
    }

    // switch dei rendering
    this.draw = function (obj, color) {
        switch(obj.type){
            case Button:
                drawbutton(obj,color);
                break;
            case Slider:
                drawslider(obj,color);
                break;
            case Chooser:
                drawchooser(obj,color);
                break;
            case ImageButton:
                drawimagebutton(obj);
                break;
            default:
                console.log("Houston...");
        }
    };

    // restituisce la posizione del mouse avendo come punto di riferimento la finestra in cui il canvas è visualizzato
    this._getMousePos = function(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        return new Point((evt.clientX - rect.left)*scaleX, (evt.clientY - rect.top)*scaleY);
    };

    // controlla dove sto cliccando
    this._hitTest = function(obj, pos) {
        var Location = obj.Location;
        var Size = obj.Size;

        context.beginPath();
        if(obj.type == Chooser && !obj.isShow) context.rect(Location.X, Location.Y, Size.X, 20);
        else context.rect(Location.X, Location.Y, Size.X, Size.Y);
        return context.isPointInPath(pos.X,pos.Y);
    };

    // controlla quale oggetto sto cliccando
    this.correlate = function (evt) {
        var found = false;
        var retObj = -1;

        for (var i = this.Controls.length - 1; i > -1; i--) {
            if ( found == false ){
                if(this._hitTest(this.Controls[i],thisobj._getMousePos(canvas,evt))){
                    found = true;
                    retObj = i;
                }
            }
        }

        return this.Controls[retObj];
    };

    // disegna una linea
    this.paint = function (context,size,color,from,to,rubber) {
        context.beginPath();
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = size;
        context.strokeStyle = color;
        context.moveTo(from.X, from.Y);
        context.lineTo(to.X, to.Y);
        if(rubber)context.globalCompositeOperation = 'destination-out';
        context.stroke();
        if(rubber)context.globalCompositeOperation = 'source-over';
    };

    canvas.addEventListener('mousedown', function (evt) {
        thisobj.HitObj = thisobj.correlate(evt);
        if(thisobj.HitObj != undefined) {
            if(thisobj.HitObj.type == Chooser && thisobj.HitObj.isShow){
                //se ho cliccato su un elemento di selezione, ed è mostrato
                var index = Math.floor((thisobj._getMousePos(canvas,evt).Y - thisobj.HitObj.Location.Y)/20);
                if(index > 0){ //cerco quale elemento ho cliccato
                    thisobj.HitObj.Selected = index-1;
                }
            }
            thisobj.draw(thisobj.HitObj,hardGray);

        } else{
            haveToMove = true;
            mousePos = thisobj._getMousePos(canvas,evt);
        }
    });

    canvas.addEventListener('mouseup', function (evt) {
        var newobj = thisobj.correlate(evt);
        if(thisobj.HitObj != undefined){ //prima devo aver cliccato su qualcosa
            if(newobj != undefined){ //ora devo aver cliccato su qualcosa
                if(newobj == thisobj.HitObj){ //devo aver cliccato sullo stesso oggetto
                    if(thisobj.HitObj.type == Chooser && thisobj.HitObj.isShow){
                        //se ho cliccato su un elemento di selezione, ed è mostrato
                        var index = Math.floor((thisobj._getMousePos(canvas,evt).Y - thisobj.HitObj.Location.Y)/20);
                        if(index > 0){ //cerco quale elemento ho cliccato, e lo aggiorno, lanciando la funzione
                            thisobj.HitObj.Selected = index-1;
                            thisobj.HitObj.Element[index-1][1](evt);
                        }
                    }
                    thisobj.HitObj.Fun(evt); //in ogni caso, lancio la funzione dell'oggetto
                }
            }
            thisobj.draw(thisobj.HitObj,softGray); //ridisegno l'oggetto
        } else {
            if(listenMode) {//draw a point
                var currentPos = thisobj._getMousePos(canvas,evt);
                var color = rgbToString(hsvToRgb(bPalette.Hitten.X,bPalette.Hitten.Y,100));
                thisobj.paint(anotherContext,bPalette.Dimensione_pennello,color,currentPos,currentPos,bPalette.Gomma);
            }
        }

        haveToMove = false;
        mousePos = undefined;
        thisobj.HitObj = undefined;
        box.Draw();
    });

    // Evito che quando il mouse esce dal canvas, l'evento mouseup non venga ricevuto.
    document.addEventListener('mouseup', function () {
        haveToMove = false;
        mousePos = undefined;
        thisobj.HitObj = undefined;
    });

    canvas.addEventListener('mousemove',function (evt) {
        if(haveToMove && !listenMode){
            var currentPos = thisobj._getMousePos(canvas,evt);
            box.imageContext.translate(-(currentPos.X-mousePos.X),-(currentPos.Y-mousePos.Y));
            mousePos = currentPos;
            box.Draw();
        } else{
            if(thisobj.HitObj != undefined && thisobj.HitObj.type == Slider) {
                var currentPos = thisobj._getMousePos(canvas,evt);
                var delta = currentPos.X - thisobj.HitObj.Location.X;
                if(delta >= 0 && delta <= thisobj.HitObj.Size.X){
                    thisobj.HitObj.Position = (delta / (thisobj.HitObj.Size.X)) * thisobj.HitObj.Max;
                }
                thisobj.HitObj.Fun(evt);
                box.Draw();
            }
        }

        if(listenMode ){
            var currentPos = thisobj._getMousePos(canvas,evt);

            var color = rgbToString(hsvToRgb(bPalette.Hitten.X,bPalette.Hitten.Y,100));

            if(mousePos != undefined) {
                thisobj.paint(anotherContext,bPalette.Dimensione_pennello,color,mousePos,currentPos,bPalette.Gomma);
                thisobj.Pattern.push({
                    size: bPalette.Dimensione_pennello,
                    color: color,
                    from: mousePos,
                    to: currentPos,
                    gomma: bPalette.Gomma
                });

                mousePos = currentPos;
            }
            box.Draw();

            if(thisobj.HitObj != undefined && thisobj.HitObj.type == ImageButton) {
                var currentPos = thisobj._getMousePos(canvas,evt);
                if(currentPos.X > bPalette.Location.X && currentPos.X < bPalette.Location.X + bPalette.Size.X){
                    if(currentPos.Y > bPalette.Location.Y && currentPos.Y < bPalette.Location.Y + bPalette.Size.Y ) {
                        bPalette.Fun(evt);
                        thisobj.draw(bPalette,softGray);
                        context.beginPath();
                        context.font = "12px Arial";
                        context.fillStyle = 'black';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(
                            rgbToString(hsvToRgb(bPalette.Hitten.X,bPalette.Hitten.Y,100)),
                            bPalette.Location.X + 50,
                            bPalette.Location.Y + bPalette.Size.Y + 10
                        );
                    }
                }
            }
        }
    });

    // Ridisegna tutti i controlli
    this.Draw = function(){
        for (var i = 0; i < this.Controls.length; i++) {
            this.draw(this.Controls[i], softGray);
        }
    };

    return this;
}