// chickenchop_classy.js

'use strict';

/*****************************************************************************/

const SCALE = {
  FONT : (() => {
    if (window.innerWidth < 768) {
      return 1;
    } else if (window.innerWidth < 1900) {
      return 2;
    } else if (window.innerWidth > 1900) {
      return 3;
    }
  })(),
  BG   : (() => {
    if (window.innerHeight < 300) {
      return .3;
    } else if (window.innerHeight < 500) {
      return .5;
    } else if (window.innerHeight < 800) {
      return .75;
    } else if (window.innerHeight > 800) {
      return 1;
    }
  })()
};

/*****************************************************************************/

// global font settings
const FONT = {
  XS : new PIXI.TextStyle({
        align              : 'center',
        fontFamily         : 'Press Start 2P',
        fontSize           : (window.innerWidth < 370 ? 8 : 10) * SCALE.FONT,
        fontStyle          : 'normal',
        fontWeight         : 'bold',
        fill               : '#000', // can be gradient ['#ffffff', '#00ff99']
        wordWrap           : true,
        wordWrapWidth      : 440
  }),
  S : new PIXI.TextStyle({
        align              : 'center',
        fontFamily         : 'Press Start 2P',
        fontSize           : 12 * SCALE.FONT,
        fontStyle          : 'normal',
        fontWeight         : 'bold',
        fill               : '#000',
        wordWrap           : false,
        wordWrapWidth      : 440
  }),
  M : new PIXI.TextStyle({
        align              : 'center',
        fontFamily         : 'Press Start 2P',
        fontSize           : 14 * SCALE.FONT,
        fontStyle          : 'normal',
        fontWeight         : 'normal',
        fill               : '#fff', // gradient
        stroke             : '#000',
        strokeThickness    : 4 * SCALE.FONT,
        dropShadow         : true,
        dropShadowColor    : '#000000',
        dropShadowBlur     : 0,
        dropShadowAngle    : Math.PI / 6,
        dropShadowDistance : 4 * SCALE.FONT,
        wordWrap           : true,
        wordWrapWidth      : 440
  }),
  L : new PIXI.TextStyle({
        align              : 'center',
        fontFamily         : 'Press Start 2P',
        fontSize           : 18 * SCALE.FONT,
        fontStyle          : 'normal',
        fontWeight         : 'normal',
        fill               : '#fff',
        stroke             : '#000',
        strokeThickness    : 4 * SCALE.FONT,
        dropShadow         : true,
        dropShadowColor    : '#000000',  // '#61ffff'
        dropShadowBlur     : 0,
        dropShadowAngle    : Math.PI / 6,
        dropShadowDistance : 4 * SCALE.FONT,
        wordWrap           : true,
        wordWrapWidth      : 440
  })
};

/*****************************************************************************/

const STORE = {
  NAME   : '',
  LEVEL  : 0,
  SCORE  : 0,
  HEALTH : 100 
};

/*****************************************************************************/

// App factory
function App() {
  // Returns a new instance of the PIXI.Application class. 
  // PIXI.Application is a convenience super class
  const app = new PIXI.Application(800, 600, {backgroundColor : 0xffffff});
  // size PIXI view 2 initial viewport 
  app.renderer.view.style.position = 'absolute';
  app.renderer.view.style.display = 'block';
  app.renderer.autoResize = true;
  app.renderer.resize(window.innerWidth, window.innerHeight);
  // factor
  return app;
}

/*****************************************************************************/

// create a base application
const base = App();

/*****************************************************************************/

// Clearer/Stager
function clearAndStage(...newChildren) {  // rest parameters
  // Clears the entire stage and adds new children.
  base.stage.children
    .filter(c => c.chicken || c.bullet || c.bucket)
    .forEach(c => {  // disabling updateTransform()
      c.renderable = c.visible = c.interactive = c.loop = false;
      c.destroy();
    });
  // clear stage
  base.stage.removeChildren();
  // add new children
  if (newChildren.length > 0) base.stage.addChild(...newChildren);  // spread op
}

/*****************************************************************************/

// Stoper/Stager
function stopAndStage(...newChildren) {
  // Stops all staged animated sprites and stages new children.
  // disable pause button
  board.children.filter(c => c.text === 'PAUSE')[0].interactive = false;
  // stop animated sprites
  base.stage.children
    .filter(c => c.chicken || c.bullet || c.bucket)
    .forEach(c => {
      c.stop();
      c.interactive = false;
    });
  // add new children
  if (newChildren.length > 0) base.stage.addChild(...newChildren);
}

/*****************************************************************************/

// Player/Unstager
function playAndUnstage(...oldChildren) {
  // Plays all staged animated sprites and unstages old children.
  // play animated sprites
  base.stage.children
    .filter(c => c.chicken || c.bullet || c.bucket)
    .forEach(c => {
      c.play();
      c.interactive = true;
    });
  // enable pause button
  board.children.filter(c => c.text === 'PAUSE')[0].interactive = true;
  // remove old children
  if (oldChildren.length > 0) base.stage.removeChild(...oldChildren);
}

/*****************************************************************************/

// Sets stores
function setLocalStores(s) {
  // Should save given name in a cookie/localStorage and a global.
  window.localStorage.setItem('chickenchop', s);
  STORE.NAME = s;
}

/*****************************************************************************/

// Gets localStorage
function getLocalStorage() {
  // Should try to read name from cookie/localStorage.
  const name = window.localStorage.getItem('chickenchop');
  return name === null ? '' : name;
}

/*****************************************************************************/

// Start screen factory
function Start(app=base.renderer) {
  // Returns a new instance of the Start screen.
  const inst = {
    container : new PIXI.Container(),
    chop      : new PIXI.Text(window.innerWidth < 370 ? 
                              'CHICKEN\nCHOP' : 'CHICKEN CHOP',
                              FONT.L),
    text      : new PIXI.Text('Enter your name!',
                              window.innerWidth < 370 ? FONT.XS : FONT.S),
    // 3rd param to input is a func getting called when enter is pressed
    // gets passed the text input's text value
    input     : new PixiTextInput(getLocalStorage(), FONT.S, 
                                  s => {
                                    setLocalStores(s);
                                    clearAndStage(levels);
                                  }),
    start     : new PIXI.Text('START', FONT.M),
    exit      : new PIXI.Text('EXIT', FONT.M)
  };
  // position chop and text -
  inst.chop
    .position.set(app.width / 2 - inst.chop.width / 2,
                  app.height / 2 - inst.chop.height - 
                  2 * inst.text.height);
  inst.text
    .position.set(app.width / 2 - inst.text.width / 2,
                  app.height / 2 - inst.text.height);
  // size and position input
  inst.input.width = app.width / (SCALE.FONT + 1);
  inst.input
    .position.set(app.width / 2 - inst.input.width / 2,
                  app.height / 2 + 10);
  // focus input on load
  inst.input.focus();
  // position the select button
  inst.start
    .position.set(app.width / 2 - inst.start.width / 2,
                  app.height / 2 + 3 * inst.input.height + 10);
  // set exit's position
  inst.exit
    .position.set(app.width - inst.exit.width - 10,
                  inst.exit.height / 2);
  // make buttons interactive
  inst.start.interactive = inst.start.buttonMode =
    inst.exit.interactive = inst.exit.buttonMode = true;
  // define event handlers
  inst.start.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => {
      this.scale.set(1);
      clearAndStage(Levels());
    }, 200);
    
  };
  inst.exit.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => this.scale.set(1), 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.chop, inst.text, inst.input, inst.start,
                          inst.exit);
  // factor
  return inst.container;
}

/*****************************************************************************/

// Pause screen factory
function Pause(app=base.renderer) {
  // Returns a new instance of the Pause screen.
  const inst = {
    container : new PIXI.Container(),
    text      : new PIXI.Text('PAUSE', FONT.L),
    play      : new PIXI.Text('PLAY', FONT.M),
    exit      : new PIXI.Text('EXIT', FONT.M)
  };
  // position text
  inst.text
    .position.set(app.width / 2 - inst.text.width / 2,
                  app.height / 3 - inst.text.height);
  // position buttons
  inst.play
    .position.set(app.width / 2 - inst.play.width / 2,
                  app.height / 3 + inst.text.height);
  inst.exit
    .position.set(app.width - inst.exit.width - 10, inst.exit.height / 2);
  // make buttons interactive
  inst.play.interactive = inst.play.buttonMode = 
    inst.exit.interactive = inst.exit.buttonMode = true;
  // define event handlers
  inst.exit.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => this.scale.set(1), 200); 
  };
  inst.play.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => {
      this.scale.set(1);
      playAndUnstage(this.parent);
    }, 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.text, inst.play, inst.exit);
  // factor
  return inst.container;
}

/*****************************************************************************/

// initialize pause screen
const pause = Pause();

/*****************************************************************************/

// Scoreboard factory
function Scoreboard(app=base.renderer) {
  // Returns a new instance of the Scoreboard.
  const inst = {
    container : new PIXI.Graphics(),
    info      : new PIXI.Text(`Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`,
                              FONT.XS),
    pause     : new PIXI.Text('PAUSE', FONT.M),
    off       : new PIXI.Text('OFF', FONT.M),
    on        : new PIXI.Text('ON', FONT.M)
  };
  // set inst.container's fill and draw the shape
  inst.container
    .beginFill(0xffffff, 1)
    .drawRect(0, app.height - 1.75 * inst.off.height, 
              app.width, 1.75 * inst.off.height)
    .endFill();
  // position info text
  inst.info
    .position.set(10, app.height - 1.5 * inst.off.height);
  // position sound buttons
  inst.off
    .position.set(app.width - inst.off.width - 10,
                  app.height - inst.off.height);
  inst.on
    .position.set(app.width - inst.on.width - 10,
                  app.height - inst.on.height);
  // position pause button
  inst.pause
    .position.set(app.width - inst.pause.width - inst.off.width - 20,
                  app.height - inst.pause.height);
  // make buttons interactive
  inst.off.interactive = inst.off.buttonMode =
    inst.on.interactive = inst.on.buttonMode =
    inst.pause.interactive = inst.pause.buttonMode = true;
  // initially hiding 'ON' button since sound is on by default
  inst.on.visible = false;
  // define event handlers
  inst.off.pointerdown = inst.on.pointerdown = function(e) {
    this.visible = !this.visible;  // toggle visibility
    this === inst.off ? inst.on.visible = true : inst.off.visible = true;
  };
  inst.pause.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => {
      this.scale.set(1);
      stopAndStage(pause);
    }, 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.info, inst.off, inst.on, inst.pause);
  // factor
  return inst.container;
}

/*****************************************************************************/

// init - we need Scoreboard().height to correctly position other objects
const board = Scoreboard();

/*****************************************************************************/

// Map01 factory - should we add an exit button to maps???
function Map01() {
  // Returns a new instance of the Map01 screen.
  const inst = {
    container : new PIXI.Container(),
    far       : new PIXI.extras.TilingSprite.fromImage('./img/hafen.png', 
                                                       4000, 500),
    mid       : new PIXI.extras.TilingSprite.fromImage('./img/stpauli.png', 
                                                       4000, 500)
  };
  // holds swipe/drag data
  const swipe = {
    start  : 0, 
    end    : 0,
    length : 0 
  };
  // size/scale background layers
  inst.far.scale.set(SCALE.BG);
  inst.mid.scale.set(SCALE.BG);
  // position background layers
  inst.far.position.set(0, 0);
  inst.mid.anchor.set(0, 1);
  inst.mid.position.set(0, base.renderer.height - board.height);
  // swipe/drag event listeners
  inst.container.interactive = true;
  inst.container.pointerdown = function(e) {
    swipe.start = e.data.getLocalPosition(this).x;
  };
  inst.container.pointerup = function(e) {
    swipe.end = e.data.getLocalPosition(this).x;
    swipe.length = swipe.start - swipe.end;
    if (Math.abs(swipe.length) > 5) {
      inst.far.tilePosition.x -= swipe.length / 2;
      inst.mid.tilePosition.x -= swipe.length;
      base.stage.children
        .filter(c => (c.chicken || c.bullet || c.bucket) && c.renderable)
        .forEach(c => c.x -= swipe.length);
    }
  };
  // key event listeners
  window.document.onkeydown = e => {
    if (e.keyCode === 37 || e.keyCode === 65) {
      inst.far.tilePosition.x += 2;
      inst.mid.tilePosition.x += 4;
      base.stage.children
        .filter(c => (c.chicken || c.bullet || c.bucket) && c.renderable)
        .forEach(c => c.x += 4);
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      inst.far.tilePosition.x -= 2;
      inst.mid.tilePosition.x -= 4;
      base.stage.children
        .filter(c => (c.chicken || c.bullet || c.bucket) && c.renderable)
        .forEach(c => c.x -= 4);
    }
  };
  // add background layers to inst.container
  inst.container.addChild(inst.far, inst.mid);
  // factor
  return inst.container;
}

/*****************************************************************************/

// create level 01 map
const map01 = Map01();

/*****************************************************************************/

// Levels screen factory
function Levels(app=base.renderer) {
  // Returns a new instance of the Levels screen.
  const inst = {
    container : new PIXI.Container(),
    text      : new PIXI.Text('Select level!', (window.innerWidth < 370 ? 
                                                FONT.S : FONT.M)),
    level01   : new PIXI.Sprite.fromImage('./img/level01.png'),
    level02   : new PIXI.Sprite.fromImage('./img/level01.png'),
    play01    : new PIXI.Text('PLAY', FONT.M),
    play02    : new PIXI.Text('PLAY', FONT.M),
    exit      : new PIXI.Text('EXIT', FONT.M)
  };
  // size level pics
  inst.level01.width = inst.level02.width = app.width / 3;
  inst.level01.height = inst.level02.height = app.height / 3;
  // position text
  inst.text
    .position.set(app.width / 2 - inst.text.width / 2,
                  app.height / 4 - inst.text.height);
  // position level pics
  inst.level01
    .position.set(app.width / 3 - inst.level01.width / 2 - 10,
                  app.height / 4 + inst.text.height + 10);
  inst.level02
    .position.set(app.width - app.width / 3 - inst.level02.width / 2 + 10,
                  app.height / 4 + inst.text.height + 10);
  // position buttons
  inst.play01
    .position.set(app.width / 3 - inst.play01.width / 2 - 10,
                  app.height / 4 + inst.text.height + 10 +
                  inst.level01.height / 2 - inst.play01.height / 2);
  inst.play02
    .position.set(app.width - app.width / 3 - inst.play02.width / 2 + 10,
                  app.height / 4 + inst.text.height + 10 +
                  inst.level02.height / 2 - inst.play02.height / 2);
  inst.exit
    .position.set(app.width - inst.exit.width - 10, inst.exit.height / 2);
  // make the buttons interactive
  inst.exit.interactive = inst.exit.buttonMode =
    inst.play01.interactive = inst.play01.buttonMode =
    inst.play02.interactive = inst.play02.buttonMode = true;
  // define event handlers
  inst.exit.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => this.scale.set(1), 200); 
  };
  inst.play01.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => {
      this.scale.set(1);
      STORE.LEVEL = 1;
      clearAndStage(map01, 
                    new Chick(), new Fool(), new Cock(), new Goon(), 
                    board);
    }, 200); 
  };
  inst.play02.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => {
      this.scale.set(1);
      STORE.LEVEL = 2;
      clearAndStage(/*...*/);
    }, 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.text, inst.level01, inst.play01,
                          inst.level02, inst.play02, inst.exit);
  // factor
  return inst.container;
}

/*****************************************************************************/

// initialize level screen
const levels = Levels();

/*****************************************************************************/

function End(app=base.renderer) {
  // Returns a new instance of the end screen.
  const inst = {
    container : new PIXI.Container(),
    info      : new PIXI.Text(`You${window.innerWidth < 370 ? '\n' : ' '}` + 
                              `${STORE.HEALTH < 1 ? 'lost!' : 'won!'}`, FONT.L),
    score     : new PIXI.Text(`Score: ${STORE.SCORE}`, FONT.M),
    exit      : new PIXI.Text('EXIT', FONT.M)
  };
  // position info
  inst.info
    .position.set(app.width / 2 - inst.info.width / 2,
                  app.height / 3 - inst.info.height);
  // position score
  inst.score
    .position.set(app.width / 2 - inst.score.width / 2,
                  app.height / 3 + inst.info.height);
  // position button
  inst.exit
    .position.set(app.width - inst.exit.width - 10, inst.exit.height / 2);
  // make button interactive
  inst.exit.interactive = inst.exit.buttonMode = true;
  // define pointer handler
  inst.exit.pointerdown = function(e) {
    this.scale.set(0.98);
    window.setTimeout(() => this.scale.set(1), 200); 
  };
  // add to inst.container
  inst.container.addChild(inst.info, inst.score, inst.exit);
  // factor
  return inst.container;
}

/*****************************************************************************/

// Returns a pseudo random integer within viewport dimensions
function getRandomInt(dimension, offset_bottom=0) {
  // @param {string} dimension 'width' or 'height'
  // @param {unsigned integer} offset_bottom
  const min = 0;
  const max = dimension === 'width' ? 
                window.innerWidth : 
                window.innerHeight - board.height - offset_bottom;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*****************************************************************************/

// Blood factory
function Blood() {
  const b = new PIXI.Graphics()
    .beginFill(0xff0000)
    .drawCircle(0, 0, 5)
    .endFill();
  b.visible = false;  // making it visible once its been positioned on chicken
  return b;
}

/*****************************************************************************/

// Chick constructor
function Chick() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Chick instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras
                                     .AnimatedSprite(Chick.texture))
  );
  // deleting 'onFrameChange' instance property so that its lookup is 
  // delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // grant life
  this.dead = false;
  // assign health
  this.health = Chick.health;
  // pseudo random direction flag
  this.direction = 
    Chick.direction[Math.floor(Math.random() * Chick.direction.length)];
  // conditionally mirroring
  if (this.direction > 0) this.scale.set(-1, 1);
  // position instance
  this
    .position.set(getRandomInt('width'), 
                  getRandomInt('height', this.height));
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // start animation when initalized
  this.play();
}

// Chick class properties (static)
// provide look
Chick.texture = ['./img/one.png', './img/two.png']
                  .map(i => PIXI.Texture.fromImage(i));
// set constructor's prototype
Chick.prototype = new PIXI.extras.AnimatedSprite(Chick.texture);
// static health
Chick.health = 10;
// static flight directions
Chick.direction = [-4, 4];

// Chick prototype data properties
// explicitely reset Chick.prototype.constructor to Chick
Chick.prototype.constructor = Chick;
// brandmark as chicken
Chick.prototype.chicken = true;
// common size
[Chick.prototype.width, Chick.prototype.height] = [100, 100];
// common hitArea
Chick.prototype.hitArea = new PIXI.Circle(50, 50, 25);
// common animation speed
Chick.prototype.animationSpeed = .04;

// Chick prototype methods
// pointer handler
Chick.prototype.interactive = true;
Chick.prototype.pointerdown = function(e) {
  const local = this.toLocal(e.data.global);
  if (this.hitArea.contains(local.x, local.y)) {  // if hit
    this.health -= 5;
    // show blood
    this.addChild(Blood());
    this.children[this.children.length - 1].position.set(local.x, local.y);
    this.children[this.children.length - 1].visible = true;
    if (this.health <= 0) {  // if dead
      STORE.SCORE += Chick.health;
      board.children[0].text = 
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      this.parent.removeChild(this);  // unstaging
      this.destroy();  // clean up destroy it
    }  
  }
};
// animation logic/movement
Chick.prototype.onFrameChange = function(index) {  // index of current frame in array
  this.x = this.x + this.direction;
  if (this.x < (0 - 2 * this.width) || 
      this.x > (window.innerWidth + 2 * this.width)) {
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.dead = true;
    this.parent.removeChild(this);
    this.destroy();  // clean up destroy it after unstaging
  }
};

/*****************************************************************************/

// Fool constructor
function Fool() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Fool instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras
                                     .AnimatedSprite(Fool.texture))
  );
  // deleting 'onFrameChange' instance property so that its lookup is 
  // delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // grant life
  this.dead = false;
  // assign health
  this.health = Fool.health;
  // pseudo random direction flag
  this.direction = 
    Fool.direction[Math.floor(Math.random() * Fool.direction.length)];
  // conditionally mirroring
  if (this.direction > 0) this.scale.set(-1, 1);
  // position instance
  this
    .position.set(getRandomInt('width'), 
                  getRandomInt('height', this.height));
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // start animation when initalized
  this.play();
}

// Fool class properties (static)
// provide look
Fool.texture = ['./img/one.png', './img/two.png']
                  .map(i => PIXI.Texture.fromImage(i));
// set constructor's prototype
Fool.prototype = new PIXI.extras.AnimatedSprite(Fool.texture);
// static health
Fool.health = 25;
// static flight directions
Fool.direction = [-4, 4];

// Fool prototype data properties
// explicitely reset Fool.prototype.constructor to Fool
Fool.prototype.constructor = Fool;
// brandmark as chicken
Fool.prototype.chicken = true;
// common size
[Fool.prototype.width, Fool.prototype.height] = [100, 100];
// common hitArea
Fool.prototype.hitArea = new PIXI.Circle(50, 50, 25);
// common animation speed
Fool.prototype.animationSpeed = .04;

// Fool prototype methods
// pointer handler
Fool.prototype.interactive = true;
Fool.prototype.pointerdown = function(e) {
  const local = this.toLocal(e.data.global);
  if (this.hitArea.contains(local.x, local.y)) {  // if hit
    this.health -= 5;
    // show blood
    this.addChild(Blood());
    this.children[this.children.length - 1].position.set(local.x, local.y);
    this.children[this.children.length - 1].visible = true;
    if (this.health <= 0) {  // if dead
      STORE.SCORE += Fool.health;
      board.children[0].text = 
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      this.parent.removeChild(this);  // unstaging
      this.destroy();  // clean up destroy it
    }  
  }
};
// animation logic/movement
Fool.prototype.onFrameChange = function(index) {  // index of current frame in array
  this.x = this.x + this.direction;
  if (this.x < (0 - 2 * this.width) || 
      this.x > (window.innerWidth + 2 * this.width)) {
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.dead = true;
    this.parent.removeChild(this);
    this.destroy();  // clean up destroy it after unstaging
  }
};

/*****************************************************************************/

// Cock constructor
function Cock() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Cock instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras
                                     .AnimatedSprite(Cock.texture))
  );
  // deleting 'onFrameChange' instance property so that its lookup is 
  // delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // grant life
  this.dead = false;
  // assign health
  this.health = Cock.health;
  // pseudo random direction flag
  this.direction = 
    Cock.direction[Math.floor(Math.random() * Cock.direction.length)];
  // conditionally mirroring
  if (this.direction > 0) this.scale.set(-1, 1);
  // position instance
  this
    .position.set(getRandomInt('width'), 
                  getRandomInt('height', this.height));
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // start animation when initalized
  this.play();
}

// Cock class properties (static)
// provide look
Cock.texture = ['./img/one.png', './img/two.png']
                  .map(i => PIXI.Texture.fromImage(i));
// set constructor's prototype
Cock.prototype = new PIXI.extras.AnimatedSprite(Cock.texture);
// static health
Cock.health = 50;
// static flight directions
Cock.direction = [-4, 4];

// Cock prototype data properties
// explicitely reset Cock.prototype.constructor to Cock
Cock.prototype.constructor = Cock;
// brandmark as chicken
Cock.prototype.chicken = true;
// common size
[Cock.prototype.width, Cock.prototype.height] = [100, 100];
// common hitArea
Cock.prototype.hitArea = new PIXI.Circle(50, 50, 25);
// common animation speed
Cock.prototype.animationSpeed = .04;

// Cock prototype methods
// pointer handler
Cock.prototype.interactive = true;
Cock.prototype.pointerdown = function(e) {
  const local = this.toLocal(e.data.global);
  if (this.hitArea.contains(local.x, local.y)) {  // if hit
    this.health -= 5;
    // show blood
    this.addChild(Blood());
    this.children[this.children.length - 1].position.set(local.x, local.y);
    this.children[this.children.length - 1].visible = true;
    if (this.health <= 0) {  // if dead
      STORE.SCORE += Cock.health;
      board.children[0].text = 
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      this.parent.removeChild(this);  // unstaging
      this.destroy();  // clean up destroy it
    }  
  }
};
// animation logic/movement
Cock.prototype.onFrameChange = function(index) {  // index of current frame in array
  this.x = this.x + this.direction;
  if (this.x < (0 - 2 * this.width) || 
      this.x > (window.innerWidth + 2 * this.width)) {
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.dead = true;
    this.parent.removeChild(this);
    this.destroy();  // clean up destroy it after unstaging
  }
};

/*****************************************************************************/

// Helper: is x in range min...max?
function inRange(x, min, max) {
  return x >= min && x <= max;
}

/*****************************************************************************/

// Bullet constructor
function Bullet(x, y) {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Bullet instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(
      new PIXI.extras.AnimatedSprite([Bullet.texture, Bullet.texture])
    )
  );
  // deleting instance properties so that their lookup is delegated to 
  // their prototype
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // frame change count
  this.changecount = 0;
  // set its transform origin or anchor
  this.anchor.set(.5);
  // initial scale
  this.scale.set(.05);  // 5 percent
  // position
  this.position.set(x, y);
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // let it fly when it is initialized
  this.play();
}

// Bullet static class properties
Bullet.texture = new PIXI.Graphics()
  .beginFill(0x000000)
  .drawCircle(0, 0, window.innerWidth / 2)  // 3rd param radius
  .endFill()
  .generateCanvasTexture(1);

// Bullet prototype data properties
// set the constructors prototype object
Bullet.prototype = new PIXI.extras.AnimatedSprite([Bullet.texture, 
                                                   Bullet.texture]);
// explicitely reset Bullet.prototype.constructor to Bullet
Bullet.prototype.constructor = Bullet;
// mark as bullet
Bullet.prototype.bullet = true;
// common animation speed
Bullet.prototype.animationSpeed = 1;

// Bullet prototype methods
// bullet flies - scale it up before it hits u and vanishes!
Bullet.prototype.onFrameChange = function() {
  this.changecount++;
  this.scale.set(this.scale.x + .1, this.scale.y + .1);  // +10%
  if (this.changecount > 19) {  // scale up to 200%
    if (inRange(this.x, 0, window.innerWidth)) {  // case hit
      STORE.HEALTH -= 10;
      board.children[0].text =
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
    }
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.parent.removeChild(this);  // unstage
    this.destroy();  // clean up destroy bullet instance
  }
};

// make it interactive/clickable
Bullet.prototype.interactive = true;
Bullet.prototype.pointerdown = function(e) {
  // let the bullet disappear ... clean up
  this.renderable = this.visible = this.interactive = this.loop = false;
  this.parent.removeChild(this);  // unstage
  this.destroy();  // clean up destroy bullet instance
};

/*****************************************************************************/

// Returns a pseudo random integer in a range (both min and max are inclusive)
function getRandomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*****************************************************************************/

// Goon constructor
function Goon() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Goon instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras
                                     .AnimatedSprite(Goon.texture))
  );
  // deleting 'onFrameChange' instance property so that its lookup is 
  // delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // frame change count
  this.changecount = 0;
  // set its transform origin or anchor
  this.pivot.set(this.width / 2, this.height / 2);
  // grant life
  this.dead = false;
  // assign health
  this.health = Goon.health;
  // position instance
  this
    .position.set(getRandomInt('width'), 
                  getRandomIntInRange(Math.ceil(window.innerHeight * .8),
                                      Math.ceil(window.innerHeight - 
                                                board.height -
                                                this.height)));
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // start animation when initalized
  this.play();
}

// Goon class properties (static)
// provide look
Goon.texture = ['./img/one.png', './img/two.png']
                  .map(i => PIXI.Texture.fromImage(i));
// set constructor's prototype
Goon.prototype = new PIXI.extras.AnimatedSprite(Goon.texture);
// static health
Goon.health = 100;

// Goon prototype data properties
// explicitely reset Goon.prototype.constructor to Goon
Goon.prototype.constructor = Goon;
// brandmark as chicken
Goon.prototype.chicken = true;
// common size
[Goon.prototype.width, Goon.prototype.height] = [100, 100];
// common hitArea
Goon.prototype.hitArea = new PIXI.Circle(50, 50, 25);
// common animation speed
Goon.prototype.animationSpeed = .04;

// Goon prototype methods
// pointer handler
Goon.prototype.interactive = true;
Goon.prototype.pointerdown = function(e) {
  const local = this.toLocal(e.data.global);
  if (this.hitArea.contains(local.x, local.y)) {  // if hit
    this.health -= 5;
    // show blood
    this.addChild(Blood());
    this.children[this.children.length - 1].position.set(local.x, local.y);
    this.children[this.children.length - 1].visible = true;
    if (this.health <= 0) {  // if dead
      STORE.SCORE += Goon.health;
      board.children[0].text = 
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      this.parent.removeChild(this);  // unstaging
      this.destroy();  // clean up destroy it
    }  
  }
};
// animation logic/movement
Goon.prototype.onFrameChange = function(index) {  // index of current frame in array
  this.changecount++;
  if (this.changecount % 20 === 0 &&
      inRange(this.x, 0, window.innerWidth)) {
    base.stage.addChildAt(new Bullet(this.x, this.y),
                          base.stage.children.length - 1);
  }
};

/*****************************************************************************/

// Bucket constructor
function Bucket() {
  // Returns a new Bucket instance.
  // define all OWN properties of 2nd param directly on Bucket instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras
                                     .AnimatedSprite(Bucket.texture))
  );
  // deleting 'onFrameChange' instance property so that its lookup is 
  // delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  delete this.onFrameChange;
  delete this.pointerdown;
  delete this.animationSpeed;
  // position
  this
    .position.set(getRandomInt('width'), 0 - this.height);
  // define rendering properties on each instance
  this.renderable = this.visible = this.interactive = this.loop = true;
  // start animation when initalized
  this.play();
}

// Bucket class properties (static)
Bucket.texture = ['./img/one.png', './img/one.png']
                  .map(i => PIXI.Texture.fromImage(i));
// health u gain when collecting bucket
Bucket.power = 25;
Bucket.prototype = new PIXI.extras.AnimatedSprite(Bucket.texture);

// Bucket prototype properties
// explicetly reset Bucket constructor
Bucket.prototype.constructor = Bucket;
// mark as button
Bucket.prototype.bucket = true;
// common size
[Bucket.prototype.width, Bucket.prototype.height] = [100, 100];
// common animation speed
Bucket.prototype.animationSpeed = .04;

// Bucket prototype methods
Bucket.prototype.interactive = true;
Bucket.prototype.pointerdown = function(e) {
  STORE.HEALTH += Bucket.power;
  board.children[0].text = 
    `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
  // let the bucket disappear ... clean up
  this.renderable = this.visible = this.interactive = this.loop = false;
  this.parent.removeChild(this);  // unstage
  this.destroy();  // clean up destroy bucket instance
};
// animation logic
Bucket.prototype.onFrameChange = function(index) {  // index of current frame in array
  this.y += 4;
  if (this.y >= window.innerHeight - board.height - this.height ||
      !inRange(this.x, 0 - this.width, window.innerWidth + this.width)) {
    // let the bucket disappear ... clean up
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.parent.removeChild(this);  // unstage
    this.destroy();  // clean up destroy bucket instance  
  }
};

/*****************************************************************************/

// Rendering empty stage first to avoid flickery!
base.renderer.render(base.stage);

// put something on stage to render
// try not to save any enemy variables?
// Only initalize chickens in a call to base.stage.addChild(...)
// -> guarantees they always have a parent, can be unstaged
//base.stage.addChild();  // Start()

// add application view to DOM
window.document.body.appendChild(base.view);

/*****************************************************************************/
