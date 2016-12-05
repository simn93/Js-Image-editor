
var v = [];
v.remove = function(index){v.splice($.inArray(index, v), 1);};

// Oggetto colore con numero di presenze
function color(a,b,c) {
    this.type = color;
    this.r = a;
    this.g = b;
    this.b = c;
    this.n = 1;
    return this
}

//scorro uno ad uno i pixel della pagina
//cerco di creare un vettore dei colori presenti
var found;
var item;
for(var i=0; i<data.length;i+=4){
    item = new color(data[i],data[i + 1],data[i + 2]);
    found = false;

    for(var j = 0; j < v.length; j++){
        if(! found){
            if(v[j].r == item.r && v[j].g == item.g && v[j].b == item.b){
                found = true;
                v[j].n += 1;
            }
        }
    }

    if(! found){
        v.push(item);
    }
}

console.log('25%');

// ordino i colori presenti per numero di apparizioni
// bubbleSort
var ultimoScambiato = v.length;
var n = v.length - 1;
while (ultimoScambiato > 0){
    ultimoScambiato = 0;
    for(var k = 0; k < n; k++){
        if(v[k].n > v[k+1].n){
            //T = A
            var temp = new color(v[k].r,v[k].g,v[k].b);
            temp.n = v[k].n;
            //A = B
            v[k].r = v[k+1].r;
            v[k].g = v[k+1].g;
            v[k].b = v[k+1].b;
            v[k].n = v[k+1].n;
            //B = T
            v[k+1].r = temp.r;
            v[k+1].g = temp.g;
            v[k+1].b = temp.b;
            v[k+1].n = temp.n;

            ultimoScambiato = k;
        }
    }
    n = ultimoScambiato;
}

console.log('50%');

//rimuovo i colori troppo simili
var t;
var distance_param = 50;
for(var m = 0; m < v.length -1; m++ ){
    t = Math.abs(v[m].r - v[m+1].r) + Math.abs(v[m].g - v[m+1].g) + Math.abs(v[m].b - v[m+1].b);
    if( t < distance_param ){
        v.remove(m+1);
    }
}

// tengo solo i size colori più frequenti
if(size < v.length) v.length = size;

console.log('75%');
// rimappo tutta l'immagine con il colore più simile.
var index;
var distance;
var u;
for(var q = 0; q < data.length; q+=4){
    distance = 766; //(255 * 3) + 1;
    for(var w = 0; w < v.length; w++){
        u = Math.max(Math.abs(data[q + 0] - v[w].r), Math.abs(data[q + 1] - v[w].g), Math.abs(data[q + 2] - v[w].b));
        if(u < distance){
            distance = u;
            index = w;
        }
    }
    data[q + 0] = v[index].r;
    data[q + 1] = v[index].g;
    data[q + 2] = v[index].b;
}