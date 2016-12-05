// variabili ausiliari per il ripristino delle dimensioni del canvas di supporto
var oldwidth, oldheight;

function getImageData(imageObj) {
    oldwidth = anotherCanvas.width;
    oldheight = anotherCanvas.height;

    anotherCanvas.width = imageObj.width;
    anotherCanvas.height = imageObj.height;

    anotherContext.drawImage(imageObj, 0, 0);
    return anotherContext.getImageData(0, 0, imageObj.width, imageObj.height);
}

function putImageData(imageData,imageObj) {
    anotherContext.putImageData(imageData, 0, 0);
    imageObj.src = anotherCanvas.toDataURL();
}

function clear() {
    anotherCanvas.width = oldwidth;
    anotherCanvas.height = oldheight;

    oldwidth = 0;
    oldheight = 0;

    anotherContext.beginPath();
    anotherContext.clearRect(0,0,anotherCanvas.width,anotherCanvas.height);
}

//inverto i colori
function colorInversion(imageObj) {
    var imageData = getImageData(imageObj);
    var data = imageData.data;

    for(var i = 0 ; i < data.length ; i += 4) {
        // red
        data[i] = 255 - data[i];
        // green
        data[i + 1] = 255 - data[i + 1];
        // blue
        data[i + 2] = 255 - data[i + 2];
    }

    putImageData(imageData,imageObj);
    clear();
}

//cambio le componenti dell'immagine
function colorVariate(id,imageObj,value) {
    // id = 0 : rosso
    // id = 1 : verde
    // id = 2 : blu
    // id = 3 : alpha
    var imageData = getImageData(imageObj);
    var data = imageData.data;
    var t;
    for(var i = 0 ;  i < data.length ; i += 4){
        if(value != 0) {
            if (data[i+id] == 0) data[i+id] = 1;
            var norm = value / 100;
            if (value > 0) {
                //norm = 65% . moltiplico per 1.65
                t = data[i+id] * (1 + norm);
                if (t >= 255) data[i+id] = 255;
                else data[i+id] = t;
            }
            else {
                //norm = -65% . moltiplico per 0.65
                t = data[i+id] * (-1 * norm);
                if (t <= 0) data[i+id] = 1;
                else data[i+id] = t;
            }
        }
        //data[i+id] = value;
    }

    putImageData(imageData,imageObj);
    clear();
}

function redVariate(imageObj,value) {
    colorVariate(0,imageObj,value);
}

function greenVariate(imageObj,value) {
    colorVariate(1,imageObj,value);
}

function blueVariate(imageObj,value) {
    colorVariate(2,imageObj,value);
}

function alphaVariate(imageObj,value) {
    colorVariate(3,imageObj,value);
}

// simulo una variazione di dimensione del pixel
function pixelate(imageObj,size) {
    var imageData = getImageData(imageObj);
    var data = imageData.data;

    var index = function(a,b){return((a+b*imageObj.width)*4)};
    /*function media(x,y) {
        var vector = [0,0,0];
        var length = 0;

        var i=x, j=y;
        for(i = x; data[index(i,j)]!= undefined && i-x <= size; i++){
            for(j = y; data[index(i,j)] != undefined && j-y <= size; j++){
                vector[0] += data[index(i,j)+0];
                vector[1] += data[index(i,j)+1];
                vector[2] += data[index(i,j)+2];
                length++;
            }
        }

        vector[0] = Math.floor(vector[0] / length);
        vector[1] = Math.floor(vector[1] / length);
        vector[2] = Math.floor(vector[2] / length);

        return vector;
    }*/

    for(var x = 0 ; x < imageObj.width ; x+=size){
        for(var y = 0 ; y < imageObj.height ; y+=size){
            for(var i = x; i-x < size; i++){
                for(var j = y; j-y < size; j++){
                    if(data[index(i,j)] != undefined) {
                        data[index(i, j) + 0] = data[index(x, y) + 0];
                        data[index(i, j) + 1] = data[index(x, y) + 1];
                        data[index(i, j) + 2] = data[index(x, y) + 2];
                    }
                }
            }
        }
    }

    putImageData(imageData,imageObj);
    clear();
}

// converto da rgb a hsv. algoritmo standard
function hsvToRgb(h,s,v) {
    /*// h: 0-360
     // s: 0-100
     // v: 0-100
     //
     // returns: [ 0-255, 0-255, 0-255 ]*/
    var u = 255 * (v / 100);

    if (h === null) {
        return [ u, u, u ];
    }

    h /= 60;
    s /= 100;

    var i = Math.floor(h);
    var f = i%2 ? h-i : 1-(h-i);
    var m = u * (1 - s);
    var n = u * (1 - s * f);
    switch (i) {
        case 6:
        case 0: return [u,n,m];
        case 1: return [n,u,m];
        case 2: return [m,u,n];
        case 3: return [m,n,u];
        case 4: return [n,m,u];
        case 5: return [u,m,n];
    }
}

// converto in stringa un vettore rgb per passarlo come parametro al context
function rgbToString(rgb) {
    //console.log('rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')');
    rgb[0] = Math.floor(rgb[0]);
    rgb[1] = Math.floor(rgb[1]);
    rgb[2] = Math.floor(rgb[2]);
    return 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
}

//LMS:
// a color space suitable for calculating color blindness
// as it's represented by the three types of cones of the human eye,
// named after their sensitivity at wavelengths;
// Long (564–580nm), Medium (534–545nm) and Short (420–440nm)
function lmsToRgb(l, s, v) {
    var lms2rgb = [[0.0809444,-0.130504,0.116721],[-0.0102485,0.0540193,-0.113615],[-0.000365297,-0.00412161,0.693511]];

    var rgb = [l,s,v];
    rgb = math.multiply(lms2rgb,rgb);

    return rgb;
}

function rgbToLms(r, g, b) {
    var rgb2lms = [[17.8824,43.5161,4.11935],[3.45565,27.1554,3.86714],[0.0299566,0.184309,1.46709]];

    var lsv = [r,g,b];
    lsv = math.multiply(rgb2lms,lsv);

    return lsv;
}

// imposta un pixel sullo schermo
function setPixel (canvas,x, y, r, g, b, a) {
    var imageData = getImageData(imageObj);
    var data = imageData.data;

    var index = (x + y * canvas.width) * 4;

    data[index + 0] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = a;

    putImageData(imageData,imageObj);
    clear();
}

// usata solo per disegnare il picker dei colori
function drawPicker() {
    var rgb;
    for(var i = 0; i <= 360; i+=1) {
        for (var j = 0; j <= 100; j+=1) {
            rgb = hsvToRgb(i,j,100);
            setPixel(anotherCanvas,i,j,rgb[0],rgb[1],rgb[2],255);
        }
    }
}

// algoritmo per la correzione di immagini per daltonici
function colorBlindCorrection(mode,imageObj) {
    //Fonte : http://biecoll.ub.uni-bielefeld.de/volltexte/2007/52/pdf/ICVS2007-6.pdf
    //Transformation matrix for Deuteranope (a form of red/green color deficit)
    var d = [[1,0,0],[0.494207,0,1.24827],[0,0,1]];
    //Transformation matrix for Protanope (another form of red/green color deficit)
    var p = [[0,2.02344,-2.52581],[0,1,0],[0,0,1]];
    //Transformation matrix for Tritanope (a blue/yellow deficit - very rare)
    var t = [[1,0,0],[0,1,0],[-0.395913,0.801109,0]];

    //Matrice degli errori
    var m = [[0,0,0],[0.7,1,0],[0.7,0,1]];

    var c;
    switch(mode){
        case "D": c = d; break;
        case "P": c = p; break;
        case "T": c = t; break;
        default : c = p;
        // cause i'm protanomaly
    }

    var imageData = getImageData(imageObj);
    var data = imageData.data;
    var percent = -1;

    for( var i = 0 ; i < data.length; i+=4){
        // trasformo il colore da rgb a lms
        var lsv = rgbToLms(data[i+0],data[i+1],data[i+2]);

        // calcolo il colore come visto da un daltonico
        var _lsv = math.multiply(c,lsv);

        // lo riporto in rbg
        var _rgb = lmsToRgb(_lsv[0],_lsv[1],_lsv[2]);

        // vedo di quanto il valore è sbagliato
        var _err = [data[i+0]-_rgb[0],data[i+1]-_rgb[1],data[i+2]-_rgb[2]];

        // correggo il colore
        var m_err = math.multiply(m,_err);

        // aggiusto il colore
        var dal = [data[i+0] + m_err[0], data[i+1] + m_err[1], data[i+2] + m_err[2]];
        for(var j=0;j<3;j++){
            dal[i] = Math.max(0,dal[i]);
            dal[i] = Math.min(255,dal[i]);
        }

        // imposto il colore
        data[i+0] = dal[0];
        data[i+1] = dal[1];
        data[i+2] = dal[2];

        // stampo una percentuale di completamento del processo
        var p = Math.floor((i*100)/(data.length));
        if(p != percent){
            percent = p;
            console.log(percent+' '+'%');
        }
    }

    putImageData(imageData,imageObj);
    clear();
}

function protanopy(imageObj) {colorBlindCorrection("P",imageObj);}

function deuteranopy(imageObj) {colorBlindCorrection("D",imageObj);}

function tritanopy(imageObj) {colorBlindCorrection("T",imageObj);}

// converto in scala di grigi
function oldTimeGone(imageObj) {
    var imageData = getImageData(imageObj);
    var data = imageData.data;

    for(var i=0;i<data.length;i+=4){
        //var v = [data[i+0],data[i+1],data[i+2]];
        //v = math.multiply(matrix,v);
        var grey = Math.floor(data[i]*0.5 + data[i+1]*0.3 + data[i+2]*0.2);
        data[i] = grey;
        data[i+1] = grey;
        data[i+2] = grey;
    }
    putImageData(imageData,imageObj);
    clear();
}

// convoluzione
function convolve(imageObj, kernel) {
    var dim = Math.sqrt(kernel.length);
    var pad = Math.floor(dim / 2);

    // funziona solo con kernell di dimensione dispari
    // matrici rappresentati come vettori
    if (dim % 2 == 1) {
        oldwidth = anotherCanvas.width;
        oldheight = anotherCanvas.height;

        // creo un immagine con un bordo tutto intorno nero
        anotherCanvas.width = imageObj.width + pad * 2;
        anotherCanvas.height = imageObj.height + pad * 2;

        anotherContext.beginPath();
        anotherContext.fillStyle = '#000000';
        anotherContext.fillRect(0, 0, anotherCanvas.width, anotherCanvas.height);
        anotherContext.drawImage(imageObj, pad, pad);

        var bigImageData = anotherContext.getImageData(0, 0, anotherCanvas.width, anotherCanvas.height);
        var bigData = bigImageData.data;

        // creo dei dati su cui andare a disegnare
        var imageData = anotherContext.createImageData(imageObj.width, imageObj.height);
        var data = imageData.data;

        // vettore contatore
        var v;
        // funzione indice
        var index = function(a,b,w){return((a+b*w)*4)};

        // nell'immagine ingrandita, scorro tutti i suoi pixel ignorando il riempimento
        for (var row = pad; row <= imageObj.height; row++) {
            for (var col = pad; col <= imageObj.width; col++) {
                v = [0,0,0];

                // per ciascun pixel, moltiplico il suo valore, e quello dei suoi confinanti, tanti quanti la dimensione del kernel
                // per i valori corrispondenti del kernel. Questi valori vanno poi sommati
                for (var dx = -pad; dx <= pad; dx++) {
                    for (var dy = -pad; dy <= pad; dy++) {
                        v[0] += bigData[index(col+dx,row+dy,anotherCanvas.width) + 0] * kernel[(dy + pad) * dim + (dx + pad)];
                        v[1] += bigData[index(col+dx,row+dy,anotherCanvas.width) + 1] * kernel[(dy + pad) * dim + (dx + pad)];
                        v[2] += bigData[index(col+dx,row+dy,anotherCanvas.width) + 2] * kernel[(dy + pad) * dim + (dx + pad)];
                    }
                }

                // e impostati come valore del pixel al centro
                data[index(col-pad,row-pad,imageObj.width) + 0] = (v[0] + .5) ^ 0;
                data[index(col-pad,row-pad,imageObj.width) + 1] = (v[1] + .5) ^ 0;
                data[index(col-pad,row-pad,imageObj.width) + 2] = (v[2] + .5) ^ 0;
                data[index(col-pad,row-pad,imageObj.width) + 3] = 255;
            }
        }

        anotherCanvas.width = imageObj.width;
        anotherCanvas.height = imageObj.height;

        putImageData(imageData,imageObj);
        clear();
    }
}

function blur(imageObj) {
    var matrix = [0.1111,0.1111,0.1111,0.111,0.1111,0.1111,0.1111,0.1111,0.1111];
    convolve(imageObj,matrix);
}

function gaussian(imageObj) {
    var matrix = [1/16,2/16,1/16,2/16,4/16,2/16,1/16,2/16,1/16];
    convolve(imageObj,matrix);
}

function edge_detect(imageObj) {
    var matrix = [0,1,0,1,-4,1,0,1,0];
    convolve(imageObj,matrix);
}

function emboss(imageObj) {
    var matrix = [-2,-1,0,-1,1,1,0,1,2];
    convolve(imageObj,matrix);
}

function sharpen(imageObj) {
    var matrix = [0,-2,0,-2,11,-2,0,-2,0];
    convolve(imageObj,matrix);
}

// riduco i colori ,simulando uno schermo vecchio
function reduce_color(size, imageObj) {
    var imageData = getImageData(imageObj);
    var data = imageData.data;

    var distance = size;
    for(var i = 0; i< data.length; i+=4){
        data[i] = Math.floor(data[i] - data[i] % distance);
        data[i+1] = Math.floor(data[i+1] - data[i+1] % distance);
        data[i+2] = Math.floor(data[i+2] - data[i+2] % distance);
    }

    putImageData(imageData,imageObj);
    clear();
    console.log('100%');
}

// effetto palla
function fishEye(imageObj) {
    function calculateOffset(x,y,width,height) {
        var center = new Point(width / 2 , height / 2 );
        var dist = new Point(x - center.X, y - center.Y);
        var radius = Math.sqrt(dist.X * dist.X + dist.Y * dist.Y);
        var theta = Math.atan2(dist.Y, dist.X);

        var newRadius = radius * radius/(Math.min(center.X, center.Y));
        var newX = Math.floor( center.X + newRadius * Math.cos(theta) );
        var newY = Math.floor( center.Y + newRadius * Math.sin(theta) );

        return new Point(newX, newY);
    }

    function index(x,y) {
        return((x+y*imageObj.width)*4);
    }

    var oldimageData = getImageData(imageObj);
    var olddata = oldimageData.data;

    var imageData = getImageData(imageObj);
    var data = imageData.data;


    var offset = [];
    for(var j = 0 ; j < imageObj.height ; j++){
        offset[j] = [];
        for(var i = 0 ; i < imageObj.width ; i++){
            offset[j][i] = calculateOffset(i,j,imageObj.width,imageObj.height);
            if(offset[j][i].X < 0)offset[j][i].X = 0;
            if(offset[j][i].X >= imageObj.width) offset[j][i].X = imageObj.width - 1;
            if(offset[j][i].Y < 0)offset[j][i].Y = 0;
            if(offset[j][i].Y >= imageObj.height) offset[j][i].Y = imageObj.height - 1;
        }
    }

    for(var q = 0 ; q < imageObj.height ; q++){
        for(var k = 0 ; k < imageObj.width ; k++){
            var d = index(k,q);
            var f = index(offset[q][k].X,offset[q][k].Y);
            data[d + 0] = olddata[f + 0];
            data[d + 1] = olddata[f + 1];
            data[d + 2] = olddata[f + 2];
            data[d + 3] = olddata[f + 3];

            if(offset[q][k].X == 0 || offset[q][k].Y == 0 || offset[q][k].X == imageObj.width - 1 || offset[q][k].Y == imageObj.height -1){
                data[d + 0] = 0;
                data[d + 1] = 0;
                data[d + 2] = 0;
            }
        }
    }

    putImageData(imageData,imageObj);
    clear();
}