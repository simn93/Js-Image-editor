function Main() {
    this.type = Main;
    var thisobj = this;

    //Creo un altro canvas per la gestione delle trasformate
    this.imageCanvas = document.createElement('canvas');
    this.imageContext = thisobj.imageCanvas.getContext('2d');

    //Gestione delle trasformate
    // [a,b,c,d,e,f] == [[a,c,e],[b,d,f],[0,0,1]]
    this.w2v = [[1,0,0],[0,1,0],[0,0,1]];
    this.v2w = [[1,0,0],[0,1,0],[0,0,1]];
    this.from2to3 = function (t) {return  [[t.a,t.c,t.e],[t.b,t.d,t.f],[0,0,1]];};
    this.from3to2 = function (m) {return {a:m[0][0],b:m[1][0],c:m[0][1],d:m[1][1],e:m[0][2],f:m[1][2]};};

    var temp;
    this.degree = 0;

    //Traslazione
    thisobj.imageContext.translate = function(sx,sy){
        var t1 = math.multiply(thisobj.v2w,[0,0,1]);
        var t2 = math.multiply(thisobj.v2w,[sx,sy,1]);

        // correzione in funzione dello scaling
        var t3 = new Point(t2[0]-t1[0],t2[1]-t1[1]);
        t3.X /= thisobj.v2w[0][0];
        t3.Y /= thisobj.v2w[1][1];

        var m2 = [[1,0,t3.X],[0,1,t3.Y],[0,0,1]];
        thisobj.w2v = math.multiply(thisobj.w2v,m2);
        m2 = [[1,0,-t3.X],[0,1,-t3.Y],[0,0,1]];
        thisobj.v2w = math.multiply(m2,thisobj.v2w);

        // settaggio
        var t4 = thisobj.from3to2(thisobj.v2w);
        thisobj.imageContext.setTransform(t4.a,t4.b,t4.c,t4.d,t4.e,t4.f);
    };

    //Rotazione, ma solo di +90° o -90°
    thisobj.imageContext.rotate = function(radians){
        // pseudo rotazione

        var oldwidth, oldheight;

        function index(x,y,w) {return((x+y*w)*4)}

        oldwidth = anotherCanvas.width;
        oldheight = anotherCanvas.height;

        anotherCanvas.width = thisobj.Image.width;
        anotherCanvas.height = thisobj.Image.height;

        anotherContext.drawImage(thisobj.Image, 0, 0);
        var imageData = anotherContext.getImageData(0, 0, thisobj.Image.width, thisobj.Image.height);
        var sourceData = imageData.data;

        var dCanvas = document.createElement('canvas');
        var dContext = dCanvas.getContext('2d');

        dCanvas.width = thisobj.Image.height;
        dCanvas.height = thisobj.Image.width;

        var dImage = dContext.getImageData(0,0,dCanvas.width,dCanvas.height);
        var dData = dImage.data;


        for (var x = 0; x < thisobj.Image.width; x++) {
            for (var y = 0; y < thisobj.Image.height; y++) {
                var sIndex = index(x, y, thisobj.Image.width);

                var dIndex;
                if(radians == Math.PI / 2) {
                    dIndex = index(dCanvas.width - y, x, dCanvas.width);
                } else {
                    dIndex = index(y, dCanvas.height - x, dCanvas.width);
                }

                dData[dIndex + 0] = sourceData[sIndex + 0];
                dData[dIndex + 1] = sourceData[sIndex + 1];
                dData[dIndex + 2] = sourceData[sIndex + 2];
                dData[dIndex + 3] = sourceData[sIndex + 3];
            }
        }

        thisobj.Image.width = dCanvas.width;
        thisobj.Image.height = dCanvas.height;

        dContext.putImageData(dImage,0,0);
        thisobj.Image.src = dCanvas.toDataURL();


        anotherCanvas.width = oldwidth;
        anotherCanvas.height = oldheight;

        oldwidth = 0;
        oldheight = 0;

        anotherContext.beginPath();
        anotherContext.clearRect(0,0,anotherCanvas.width,anotherCanvas.height);
    };

    thisobj.imageContext.scale = function(sx,sy,px,py){
        //px e py sono le coordinate del mouse
        //sx e sy è il coefficiente di scalatura

        //correggo le coordinate in funzione dello scaling
        px -= thisobj.v2w[0][2];
        py -= thisobj.v2w[1][2];
        px /= thisobj.v2w[0][0];
        py /= thisobj.v2w[0][0];

        var t1 = math.multiply(thisobj.v2w,[px,py,1]);

        var m1 = [[sx,0,0],[0,sy,0],[0,0,1]];
        var m2 = [[1/sx,0,0],[0,1/sy,0],[0,0,1]];
        thisobj.w2v = math.multiply(thisobj.w2v,m1);
        thisobj.v2w = math.multiply(m2,thisobj.v2w);

        var t2 = math.multiply(thisobj.v2w,[px,py,1]);
        var p1 = new Point(t2[0]-t1[0],t2[1]-t1[1]);

        var m3 = [[1,0,p1.X],[0,1,p1.Y],[0,0,1]];
        var m4 = [[1,0,-p1.X],[0,1,-p1.Y],[0,0,1]];

        thisobj.w2v = math.multiply(thisobj.w2v,m3);
        thisobj.v2w = math.multiply(m4,thisobj.v2w);

        var t4 = thisobj.from3to2(thisobj.v2w);
        thisobj.imageContext.setTransform(t4.a,t4.b,t4.c,t4.d,t4.e,t4.f);
    };

    // sposto l'immagine un po più al centro :)
    thisobj.imageContext.translate(-60,-60);

    // l'immagine
    this.Image = new Image();
    thisobj.Image.startSrc = undefined;
    thisobj.Image.backgound = undefined;

    // i bottoni
    this.controls = new Controls(canvas);
    this.floatingControls = [];
    this.floatingControls2 = [];

    // la funzione di disegno
    this.Draw = function () {
        // cancello quanto disegnato prima
        thisobj.imageContext.save();
        thisobj.imageContext.setTransform(1, 0, 0, 1, 0, 0);
        thisobj.imageContext.clearRect(0, 0, thisobj.imageCanvas.width, thisobj.imageCanvas.height);
        thisobj.imageContext.restore();

        context.clearRect(0, 0, canvas.width, canvas.height);

        // disegno l'immagine
        thisobj.imageContext.drawImage(thisobj.Image, 0, 0);
        context.drawImage(thisobj.imageCanvas, 0, 0);
        context.drawImage(anotherCanvas, 0, 0);


        // salvo il background
        thisobj.Image.backgound = context.getImageData(0,0,canvas.width,canvas.height);

        // disegno i controlli
        thisobj.controls.Draw();
    };

    // gestione dell'evento di resize
    this.Resize = function () {
        //imposto canvas
        var w = window.innerWidth * 0.9 , h = window.innerHeight * 0.9;
        canvas.width = w; canvas.height = h;

        //imposto imageCanvas, ma ripristinando la trasformata
        var t;
        if(thisobj.imageContext.currentTransform)t = thisobj.imageContext.currentTransform;
        thisobj.imageCanvas.width = w; thisobj.imageCanvas.height = h;
        if(thisobj.imageContext.currentTransform)thisobj.imageContext.setTransform(t.a,t.b,t.c,t.d,t.e,t.f);

        //imposto anotherCanvas, avendo cura di ridisegnare quando c'era prima
        anotherCanvas.width = w; anotherCanvas.height = h;
        for(var j = 0;j < thisobj.controls.Pattern.length; j++){
            thisobj.controls.paint( anotherContext,
                                    thisobj.controls.Pattern[j].size,
                                    thisobj.controls.Pattern[j].color,
                                    thisobj.controls.Pattern[j].from,
                                    thisobj.controls.Pattern[j].to,
                                    thisobj.controls.Pattern[j].gomma);
        }

        // sposto i controlli mobili
        for(var i = 0 ; i < thisobj.floatingControls.length ; i++){
            thisobj.floatingControls[i].Location.X = (canvas.width * 0.9) - thisobj.floatingControls[i].Size.X;
        }

        for(var j = 0; j < thisobj.floatingControls2.length ; j++){
            thisobj.floatingControls2[j].Location.Y = (canvas.height * 0.9) - thisobj.floatingControls2[j].Size.Y;
            if(thisobj.floatingControls2[j] != bPalette || thisobj.floatingControls2[j].Size.Y == 0) {
                thisobj.floatingControls2[j].Location.Y -= 100;
            }
        }
        thisobj.Draw();
    };

    // on resize window -> resize canvas
    window.addEventListener('resize',thisobj.Resize);

    // on wheel -> scalo l'immagine
    canvas.addEventListener('wheel',function (evt) {
        // in giù = -120 // in su  = +120
        var direction = (evt.wheelDelta) / 1200;
        var zoom = 1 - direction;
        var mousePos = thisobj.controls._getMousePos(canvas,evt);
        thisobj.imageContext.scale(zoom,zoom,mousePos.X,mousePos.Y);

        thisobj.Draw();
    });

    // on change event listen per il bottone "Image"
    $("#Image").change(function() {
        var reader = new FileReader();
        reader.onload = function(event){
            thisobj.Image.onload = thisobj.Draw;
            thisobj.Image.src = event.target.result;
            thisobj.Image.startSrc = thisobj.Image.src;
        };
        reader.readAsDataURL(this.files[0]);
    });

    // inizializzo le dimensioni del canvas
    thisobj.Resize();

    // inizializzo l'immagine come una tavolozza trasparente
    thisobj.Image.src = anotherCanvas.toDataURL();

    return this;
}