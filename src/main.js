/* SETTINGS */
var FPS = 50;
var MIN = 1; // min random step
var MAX = 25; // max random step
var STEP = 1;

/* UTILS */
function getRandomInt( min, max ) {
  return Math.floor( Math.random() * ( max - min + 1 )) + min;
}

function getRandomText( length ) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    //(Math.random() + 1).toString(36).substring(7);
    return text;
}

function addEvent( element, type, func ) {
    if( element.addEventListener ) {
        element.addEventListener( type, func, false );
    } else if ( element.attachEvent ) {
        element.attachEvent( type, func );
    } else {
        element[type] = func;
    }
}

function mouseOver() {
    this.element.setAttribute( 'class', 'hover' );
    this.timeout = setTimeout(mouseOut.bind( this ), 1000);
}

function mouseOut() {
    this.element.setAttribute( 'class', '' );
    clearTimeout(this.timeout);
}

function updateSpeed(e) {
    span = e.dashboard.getElementsByTagName('span')[0];
    span.removeChild( span.firstChild );
    speedValue = document.createTextNode( e.step );
    span.appendChild( speedValue );
}

function faster() {
    this.step += STEP;
    updateSpeed( this );
}

function slower() {
    stepTemp = this.step - STEP;
    if( stepTemp < 0 )  stepTemp = 0;
    this.step = stepTemp;
    updateSpeed( this );
}

function activator( event ) {
    if( this.interval ) {
        event.target.setAttribute( 'class', 'hold' );
        this.hold();
    } else {
        event.target.setAttribute( 'class', 'fly' );
        this.fly();
    }
}

function addControls( boxes ) {
    controls = document.getElementById( 'controls' );
    for( var x = 0 ; x < boxes.length ; x++ ) {
        boxes[x].dashboard = document.createElement( 'span' )

        activ = document.createElement( 'input' );
        activ.setAttribute( 'type', 'button' );
        activ.setAttribute( 'value', ' ' );
        if( boxes[x].interval ) activ.setAttribute( 'class', 'fly' );
        else activ.setAttribute( 'class', 'hold' );

        minus = document.createElement( 'input' );
        minus.setAttribute( 'type', 'button' );
        minus.setAttribute( 'value', '-' );

        plus = document.createElement( 'input' );
        plus.setAttribute( 'type', 'button' );
        plus.setAttribute( 'value', '+' );

        speed = document.createElement( 'span' );
        speedText = document.createTextNode( boxes[x].step );
        speed.appendChild( speedText );

        boxes[x].dashboard.appendChild( activ );
        boxes[x].dashboard.appendChild( minus );
        boxes[x].dashboard.appendChild( plus );
        boxes[x].dashboard.appendChild( speed );

        controls.appendChild( boxes[x].dashboard );

        addEvent( boxes[x].dashboard, 'mouseover', mouseOver.bind( boxes[x] ) );
        addEvent( boxes[x].dashboard, 'mouseout', mouseOut.bind( boxes[x] ) );
        addEvent( plus, 'click', faster.bind( boxes[x] ) );
        addEvent( minus, 'click', slower.bind( boxes[x] ) );
        addEvent( activ, 'click', activator.bind( boxes[x] ) );
    }
}

/* MAIN */
function Box( element, world ) {
    var self = this;
    this.world = world;
    this.element = element;
    this.dashboard = null;
    this.size = {
        'x': ( this.element.clientWidth ? this.element.clientWidth : this.element.innerWidth ),
        'y': ( this.element.clientHeight ? this.element.clientHeight : this.element.innerHeight ),
    }
    this.step = 100;
    this.direction = {
        'x': 1,
        'y': 1
    }
    this.position = {
        'x': this.element.offsetLeft,
        'y': this.element.offsetTop
    }
    this.interval = null;
    this.timeout = null;

    addEvent( self.element, 'resize', function() {
        self.size = {
            'x': window.innerWidth,
            'y': window.innerHeight
        }
    });
}

Box.prototype.calculateStep = function( axis ) {
    var position = this.position[axis] + this.direction[axis] * Math.abs( this.step );
    var range = this.world.size[axis] - this.size[axis];
    if(( position >= range ) || ( position <= 0 )) {
        var edge = ( this.direction[axis] < 0 ) ? 0 : range;
        this.direction[axis] *= -1;
        position += this.direction[axis] * Math.abs( position - edge ) * 2;
    }
    this.position[axis] = position;
}

Box.prototype.nextStep = function() {
    this.calculateStep( 'x' );
    this.calculateStep( 'y' );
    this.element.style.left = this.position.x + 'px';
    this.element.style.top = this.position.y + 'px';
}

Box.prototype.fly = function() {
    var self = this;
    if( !this.interval ) {
        this.interval = window.setInterval( function() { self.nextStep(); }, FPS );
    }
}

Box.prototype.hold = function() {
    if( this.interval ) {
        clearInterval( this.interval );
        this.interval = null;
    }
}

/* INITS */
/* world initaialization */
var browser = new Box( window );

/* objects initialization */
var boxList = [];
var divs = document.getElementsByTagName( 'div' );
for( var x = 0 ; x < 3 ; x++ ) {
    boxList.push( new Box( divs[x], browser ));
}
for( var x = 0  ; x < boxList.length ; x++ ) {
    boxList[x].step = getRandomInt( MIN, MAX ); //setup random speed
    boxList[x].fly(); //default all objects fly at start
}

/* dashboard initialization */
addControls(boxList);
