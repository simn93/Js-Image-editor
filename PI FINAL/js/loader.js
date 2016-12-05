requirejs(["js/button.js"], function (util) {
    requirejs(["js/main.js"], function (util) {
        requirejs(["js/effects.js"], function (util) {
            requirejs(["js/UISetting.js"], function (util) {
                if(! context.currentTransform){
                    alert("Per una migliore esprerienza, abilita le funzioni sperimentali del canvas");
                    alert("chrome://flags/");
                    alert("Altrimenti fa niente, funziona 'quasi' lo stesso");
                }
            })
        })
    })
});