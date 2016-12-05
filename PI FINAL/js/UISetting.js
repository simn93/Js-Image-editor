var input = document.createElement('input');
input.type = 'file';
input.id = 'Image';
document.body.appendChild(input);
input.style.visibility = 'hidden';

var box = new Main();

var bRotateL = new Button(function(evt){box.imageContext.rotate(Math.PI / 2);box.degree += 270;box.degree %= 360;box.Draw()});
bRotateL.Text = "↺";
bRotateL.Location = new Point(20,20);//(100,40);

var bRotateR = new Button(function (evt){box.imageContext.rotate(-(Math.PI / 2));box.degree += 90;box.degree %= 360;box.Draw()});
bRotateR.Text = "↻";
bRotateR.Location = new Point(50,20);//(140,40);

var sRed = new Slider(function (evt) {if(box.Image.width == 0)return;redVariate(box.Image,this.Position-100);});
sRed.Location = new Point( canvas.width * 0.9 - 100,50);
sRed.Text = "Rosso";
sRed.Max = 200;
sRed.Position= 100;

var sGreen = new Slider(function (evt) {if(box.Image.width == 0)return;greenVariate(box.Image,this.Position-100);});
sGreen.Location = new Point(canvas.width * 0.9 - 100,80);
sGreen.Text = "Verde";
sGreen.Max = 200;
sGreen.Position = 100;

var sBlue = new Slider(function (evt) {if(box.Image.width == 0)return;blueVariate(box.Image,this.Position-100);});
sBlue.Location = new Point(canvas.width * 0.9 - 100,110);
sBlue.Text = "Blu";
sBlue.Max = 200;
sBlue.Position = 100;

var sAlpha = new Slider(function (evt) {if(box.Image.width == 0)return;alphaVariate(box.Image,this.Position-100);});
sAlpha.Location = new Point(canvas.width * 0.9 - 100,140);
sAlpha.Text = "Alpha";
sAlpha.Max = 200;
sAlpha.Position = 100;

var cEffects = new Chooser(function (evt) {});
cEffects.Location = new Point(canvas.width * 0.9 - 125,170);
cEffects.Element.push(["Inverti"       ,function (evt) {if(box.Image.width == 0)return;colorInversion(box.Image);box.Draw();}]);
cEffects.Element.push(["Daltonia:Rosso",function (evt) {if(box.Image.width == 0)return;protanopy(box.Image);box.Draw();}]);
cEffects.Element.push(["Daltonia:Verde",function (evt) {if(box.Image.width == 0)return;deuteranopy(box.Image);box.Draw();}]);
cEffects.Element.push(["Daltonia:Blu"  ,function (evt) {if(box.Image.width == 0)return;tritanopy(box.Image);box.Draw();}]);
cEffects.Element.push(["Pixel Art: 5"  ,function (evt) {if(box.Image.width == 0)return;pixelate(box.Image,5);box.Draw();}]);
cEffects.Element.push(["Pixel Art: 10" ,function (evt) {if(box.Image.width == 0)return;pixelate(box.Image,10);box.Draw();}]);
cEffects.Element.push(["Pixel Art: 20" ,function (evt) {if(box.Image.width == 0)return;pixelate(box.Image,20);box.Draw();}]);
cEffects.Element.push(["Scala di grigi",function (evt) {if(box.Image.width == 0)return;oldTimeGone(box.Image);box.Draw();}]);
cEffects.Element.push(["Blurr standard",function (evt) {if(box.Image.width == 0)return;blur(box.Image);box.Draw();}]);
cEffects.Element.push(["Gaussian Blurr",function (evt) {if(box.Image.width == 0)return;gaussian(box.Image);box.Draw();}]);
cEffects.Element.push(["Rileva bordi"  ,function (evt) {if(box.Image.width == 0)return;edge_detect(box.Image);box.Draw();}]);
cEffects.Element.push(["Bassorilievo"  ,function (evt) {if(box.Image.width == 0)return;emboss(box.Image);box.Draw();}]);
cEffects.Element.push(["Nitidezza"     ,function (evt) {if(box.Image.width == 0)return;sharpen(box.Image);box.Draw();}])
cEffects.Element.push(["A 1000 colori"  ,function (evt) {if(box.Image.width == 0)return;reduce_color(25,box.Image);box.Draw();}]);
cEffects.Element.push(["A 300 colori"   ,function (evt) {if(box.Image.width == 0)return;reduce_color(38,box.Image);box.Draw();}]);
cEffects.Element.push(["A 50 colori"   ,function (evt) {if(box.Image.width == 0)return;reduce_color(69,box.Image);box.Draw();}]);
cEffects.Element.push(["Effetto pesce" ,function (evt) {if(box.Image.width == 0)return;fishEye(box.Image);box.Draw();}]);

bSave = new Button(function (evt) {
    if(box.Image.width == 0)return;

    //Oh no, not again!
    var saveCanvas = document.createElement('canvas');
    var saveContext = saveCanvas.getContext('2d');

    saveCanvas.width = box.Image.width;
    saveCanvas.height = box.Image.height;

    saveContext.drawImage(box.Image,0,0);

    saveContext.save();
    var t = box.imageContext.currentTransform;
    // [a,b,c,d,e,f] == [[a   c   e] [b    d	f] [0	0	1]]
    var m = [[t.a,t.c,t.e],[t.b,t.d,t.f],[0,0,1]];
    m = math.inv(m);
    saveContext.setTransform(m[0][0],m[1][0],m[0][1],m[1][1],m[0][2],m[1][2]);
    saveContext.drawImage(anotherCanvas,0,0);
    saveContext.restore();

    box.Image.src = saveCanvas.toDataURL();

    box.Image.startSrc = box.Image.src;

    // reset canvas usati
    anotherContext.clearRect(0,0,anotherCanvas.width,anotherCanvas.height);
    box.controls.Pattern = [];

    // resetto gli slider
    sRed.Position = 100;
    sBlue.Position = 100;
    sGreen.Position = 100;
    sAlpha.Position = 100;

    // ridisegno
    box.Draw();
});
bSave.Location = new Point(190,20);//(20,140);
bSave.Size = new Point(100,20);
bSave.Text = "Salva";

bRestore = new Button(function (evt) {
    if(box.Image.width == 0)return;
    if(box.Image.startSrc != undefined) box.Image.src = box.Image.startSrc;
    anotherContext.clearRect(0,0,anotherCanvas.width,anotherCanvas.height);
    sRed.Position = 100;
    sBlue.Position = 100;
    sGreen.Position = 100;
    sAlpha.Position = 100;
    box.Draw();
});
bRestore.Location = new Point(300,20);//(20,170);
bRestore.Size = new Point(100,20);
bRestore.Text = "Ripristina";

bPalette = new ImageButton(function (evt) {
    var c = box.controls;
    var m = c._getMousePos(canvas,evt);
    m.X -= bPalette.Location.X;
    m.Y -= bPalette.Location.Y;
    bPalette.Hitten = m;
    bPalette.Gomma = false;
});
bPalette.Location = new Point(20,(canvas.height * 0.9) - 100);
bPalette.Size = new Point(0,0);
var i = new Image();
i.src = 'demo/palette.png';
bPalette.Image = i;

bDrawer = new Button(function () {
    listenMode = !listenMode;
    // se non è visualizzato, non deve essere cliccabile
    if(!listenMode)bPalette.Size = new Point(0,0);
    else bPalette.Size = new Point(360,100);
    box.Draw();
});
bDrawer.Location = new Point(20, (canvas.height * 0.9) - bDrawer.Size.Y - 100);
bDrawer.Size = new Point(180,20);
bDrawer.Text = "Disegna";

var sDimensionePennello = new Slider(function () {bPalette.Dimensione_pennello = sDimensionePennello.Position;});
sDimensionePennello.Location = new Point(210,(canvas.height * 0.9) - sDimensionePennello.Size.Y - 100);
sDimensionePennello.Text = "Pennello";
sDimensionePennello.Min = 1;
sDimensionePennello.Max = 72; // come in word
sDimensionePennello.Position = 4;

var bGomma = new Button(function () {bPalette.Gomma = !bPalette.Gomma;});
bGomma.Location = new Point(320,(canvas.height * 0.9) - bGomma.Size.Y - 100);
bGomma.Size = new Point(60,20);
bGomma.Text = "Gomma";

var bCarica = new Button(function () {
    input.click();
});
bCarica.Location = new Point(80,20);
bCarica.Size = new Point(100,20);
bCarica.Text = 'Scegli file';

var bScarica = new Button(function () {
    var link = document.createElement('a');
    link.href = box.Image.src;
    link.download = box.Image.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
bScarica.Location = new Point(410,20);
bScarica.Size = new Point(100,20);
bScarica.Text = "Scarica";

box.controls.Controls.push(bRotateL);
box.controls.Controls.push(bRotateR);
box.controls.Controls.push(sRed);
box.controls.Controls.push(sGreen);
box.controls.Controls.push(sBlue);

box.controls.Controls.push(cEffects);
box.controls.Controls.push(bSave);
box.controls.Controls.push(bRestore);
box.controls.Controls.push(bPalette);
box.controls.Controls.push(bDrawer);
box.controls.Controls.push(sDimensionePennello);
box.controls.Controls.push(bGomma);
box.controls.Controls.push(bScarica);
box.controls.Controls.push(bCarica);

box.floatingControls.push(sRed);
box.floatingControls.push(sGreen);
box.floatingControls.push(sBlue);
box.floatingControls.push(cEffects);

box.floatingControls2.push(bPalette);
box.floatingControls2.push(bDrawer);
box.floatingControls2.push(sDimensionePennello);
box.floatingControls2.push(bGomma);

box.Draw();
$(window).trigger('resize');