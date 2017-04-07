/* chickenchop.js */

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
const App = () => {
  // Returns a new instance of the PIXI.Application class. 
  // PIXI.Application is a convenience super class
  const app = new PIXI.Application(800, 600, {backgroundColor : 0xffffff});
  // size PIXI view 2 initial viewport 
  app.renderer.view.style.position = 'absolute';
  app.renderer.view.style.display = 'block';
  app.renderer.autoResize = true;
  app.renderer.resize(window.innerWidth, window.innerHeight);
  // holds swipe/drag data
  const swipe = {
    start  : 0, 
    end    : 0,
    length : 0 
  };
  // swipe/drag event listeners
  app.stage.interactive = true;
  app.stage.pointerdown = function(e) {
    swipe.start = e.data.getLocalPosition(this).x;
  };
  app.stage.pointerup = function(e) {
    swipe.end = e.data.getLocalPosition(this).x;
    swipe.length = swipe.start - swipe.end;
    if (Math.abs(swipe.length) > 5) {
      // only adjusting chickens' and bullet's x on swipe */
      app.stage.children.forEach(c => {
        if ((c.chicken || c.bullet) && c.renderable) {
          c.x -= swipe.length;
        }
      });
    }
  };
  // key event listeners
  window.document.addEventListener('keydown', e => {
    if (e.keyCode === 37 || e.keyCode === 65) {
      app.stage.children.forEach(c => {
        if ((c.chicken || c.bullet) && c.renderable) {
          c.x += 4;
        }
      });
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      app.stage.children.forEach(c => {
        if ((c.chicken || c.bullet) && c.renderable) {
          c.x -= 4;
        }
      });
    }
  });
  // factor
  return app;
};

/*****************************************************************************/

// create a base application
const base = App();

/*****************************************************************************/

// Clearer/Stager
const clearAndStage = (...newChildren) => {  // rest parameters
  // Clears the entire stage and adds new children.
  // disabling updateTransform()
  base.stage.children
    .filter(c => c.chicken || c.bullet)
    .forEach(c => {
      c.renderable = c.visible = c.interactive = c.loop = false;
      c.destroy();
  });
  // clear stage
  base.stage.removeChildren();
  // add new children
  if (newChildren.length > 0) base.stage.addChild(...newChildren);  // spread op
};

/*****************************************************************************/

// Sets stores
const setLocalStores = s => {
  window.localStorage.setItem('chickenchop', s);
  STORE.NAME = s;
};

/*****************************************************************************/

// Gets localStorage
const getLocalStorage = () => {
  const name = window.localStorage.getItem('chickenchop');
  return name === null ? '' : name;
};

/*****************************************************************************/

// Start screen factory
const Start = (app=base.renderer) => {
  // Returns a new instance of the Start screen.
  const inst = {
    container : new PIXI.Container(),
    chop      : new PIXI.Text(window.innerWidth < 370 ? 
                              'CHICKEN\nCHOP' : 'CHICKEN CHOP',
                              FONT.L),
    text      : new PIXI.Text('Enter your name!',
                              window.innerWidth < 370 ? FONT.XS : FONT.S),
    /* 3rd param to input is a func getting called when enter is pressed
       gets passed the text input's text value */
    input     : new PixiTextInput(getLocalStorage(), FONT.S, 
                                  s => {
                                    setLocalStores(s);
                                    clearAndStage(Levels());
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
};

/*****************************************************************************/

// Pause screen factory
const Pause = (app=base.renderer) => {
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
                  app.height / 2 - inst.text.height);
  // position buttons
  inst.play
    .position.set(app.width / 2 - inst.play.width / 2,
                  app.height / 2 + 2 * inst.play.height);
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
      endPause(this.parent);
    }, 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.text, inst.play, inst.exit);
  // factor
  return inst.container;
};

/*****************************************************************************/

// pause screen
const pause = Pause();

/*****************************************************************************/

// Pause screen helper
const startPause = (pause) => {
  base.stage.children.forEach(c => {
    if (c.chicken || c.bullet) {
      c.stop();
      c.interactive = false;
    }
  });
  base.stage.addChild(pause);
};

/*****************************************************************************/

// Pause screen helper
const endPause = (pause) => {
  base.stage.children.forEach(c => {
    if (c.chicken || c.bullet) {
      c.play();
      c.interactive = true;
    }
  });
  base.stage.removeChild(pause);
};

/*****************************************************************************/

// Scoreboard factory
const Scoreboard = (app=base.renderer) => {
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
      startPause(pause);
    }, 200); 
  };
  // add elements to inst.container
  inst.container.addChild(inst.info, inst.off, inst.on, inst.pause);
  // factor
  return inst.container;
};

/*****************************************************************************/

const board = Scoreboard();  // initialize board first global dependency !
// we need Scoreboard().height to correctly position other objects

/*****************************************************************************/

// Map01 factory - should we add an exit button to maps???
const Map01 = (app=base) => {
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
  inst.mid.position.set(0, app.renderer.height - board.height);
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
    }
  };
  // key event listeners - keydown listener was registered with App() -
  window.document.onkeydown = e => {
    if (e.keyCode === 37 || e.keyCode === 65) {
      inst.far.tilePosition.x += 2;
      inst.mid.tilePosition.x += 4;
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      inst.far.tilePosition.x -= 2;
      inst.mid.tilePosition.x -= 4;
    }
  };
  // add background layers to inst.container
  inst.container.addChild(inst.far, inst.mid);
  // factor
  return inst.container;
};

/*****************************************************************************/

// create level 01 map
const map01 = Map01();

/*****************************************************************************/

// Levels screen factory
const Levels = (app=base.renderer) => {
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
      clearAndStage(map01, new Chick(), new Fool(), new Goon(), board);
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
};

/*****************************************************************************/

// Returns a pseudo random integer within viewport dimensions
const getRandomInt = (dimension, offset_bottom=0) => {
  // @param {string} dimension 'width' or 'height'
  // @param {unsigned integer} offset_bottom
  const min = 0;
  const max = dimension === 'width' ? 
                window.innerWidth : 
                window.innerHeight - board.height - offset_bottom;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*****************************************************************************/

// Blood factory
const Blood = () => {
  const b = new PIXI.Graphics().beginFill(0xff0000).drawCircle(0, 0, 10).endFill();
  b.visible = false;
  return b;
};

/*****************************************************************************/

// Chick constructor
function Chick() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Chick instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras.AnimatedSprite(Chick.texture))
  );
  /*
     deleting 'onFrameChange' instance property so that its lookup is 
     delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  */
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
    Object.getOwnPropertyDescriptors(new PIXI.extras.AnimatedSprite(Fool.texture))
  );
  /*
     deleting 'onFrameChange' instance property so that its lookup is 
     delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  */
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
    Object.getOwnPropertyDescriptors(new PIXI.extras.AnimatedSprite(Cock.texture))
  );
  /*
     deleting 'onFrameChange' instance property so that its lookup is 
     delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  */
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
const inRange = (x, min, max) => {
  return x >= min && x <= max;
};

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
  //
  // deleting instance properties so that their lookup is delegated to 
  // their prototype
  //
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
const getRandomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*****************************************************************************/

// Goon constructor
function Goon() {
  // instance's own (mostly data) properties
  // define all OWN properties of 2nd param directly on Goon instance
  Object.defineProperties(
    this,
    Object.getOwnPropertyDescriptors(new PIXI.extras.AnimatedSprite(Goon.texture))
  );
  /*
     deleting 'onFrameChange' instance property so that its lookup is 
     delegated to its prototype; same with 'pointerdown' and 'animationSpeed'
  */
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
  if (this.changecount % 20 === 0) {
    base.stage.addChildAt(new Bullet(this.x, this.y),
                          base.stage.children.length - 1);
  }
};

/*****************************************************************************/

// Rendering empty stage first to avoid flickery!
base.renderer.render(base.stage);
// put something on stage to render
/*
  try not to save any enemy variables?
  Only initalize chickens in a call to base.stage.addChild(...)
    -> guarantees they always have a parent, can be unstaged
*/
base.stage.addChild(board);  // Start()
// add application view to DOM
window.document.body.appendChild(base.view);

/*****************************************************************************/

/*
  right now there can only be one GoonChicken and one Bullet 
  instance on stage at once... ... working on it ...
  endgegner style
*/


/*
start screen
  -should have name input
  -should have 'quit' button

level screen
  -should have level select
  -should have 'quit' and 'play' buttons

pause screen
  -should have 'quit' and 'continue' buttons

end screen
  -should announce if won or lost, score, rank on leaderboard
  -should have 'quit' and 'next level' buttons

scoreboard
  -should hold name, score and health info
  -should have sound on/off toggler
*/

/*
// Chicken factory
const Chicken = (board_height=BOARD_HEIGHT) => {
  // Returns a new instance of a chicken.
  const array = ['./img/one.png', './img/two.png']; 
  const proto = new PIXI.extras.AnimatedSprite.fromImages(array);
  // prototype health - random choice -
  const choice = [10, 20, 30];
  proto.health = choice[Math.floor(Math.random() * choice.length)];
  // size/position proto
  [proto.width, proto.height] = [100, 100];
  proto
    .position.set(getRandomInt(0, window.innerWidth),
                  getRandomInt(0, window.innerHeight - board_height - 
                               proto.height));
  // Define a hitArea matching the chicken's shape
  proto.hitArea = new PIXI.Circle(50, 50, 25);
  // define event handlers
  proto.interactive = true;
  proto.pointerdown = function(e) {  // this refers to the actual instance
    const local = this.toLocal(e.data.global);
    if (this.hitArea.contains(local.x, local.y)) {
      console.log('hit hitArea');
      this.health -= 5;
      if (this.health <= 0) {
        STORE.SCORE += this.__proto__.health;
        board.__proto__.children[0].text = 
          `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
        this.renderable = this.visible = this.interactive = this.loop = false;
        // this.destroy() does not stop animation
        this.__proto__.destroy();  // stops animation
      }
    }
  };
  // animation logic
  proto.onFrameChange = function(index) {  // index of current frame in array
    console.log('change');
    this.x -= 4;  // this refers to the prototype
    if (this.x < (0 - 2 * this.width) || 
        this.x > (window.innerWidth + 2 * this.width)) {
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.destroy();  // stops animation but does not remove from parent
    }
  };
  proto.animationSpeed = .04;
  proto.play();
  // factor
  return Object.create(proto);
};
*/

/*
// Chicken factory 2
const Chicken = (type=['chick', 'fool', 'cock'][Math.floor(Math.random() * 3)],
                 board_height=BOARD_HEIGHT) => {
  // Returns a new instance of a chicken.
  // texture subtypes
  const texture = {
    chick   : ['./img/one.png', './img/two.png'],
    fool    : ['./img/one.png', './img/two.png'],
    cock    : ['./img/one.png', './img/two.png']
  };
  // health subtypes
  const health = {
    chick : 10,
    fool  : 20,
    cock  : 30
  };
  // instantiate animated sprite according to type
  const proto = new PIXI.extras.AnimatedSprite.fromImages(texture[type]);
  // brandmark as chicken
  proto.chicken = true;
  // grant life
  proto.dead = false;
  // assign health according to type
  proto.health = health[type];
  // pseudo random direction flag
  proto.direction = Math.random() > .5 ? 4 : -4;
  // conditionally mirroring prototype
  if (proto.direction > 0) proto.scale.set(-1, 1);
  // size/position proto
  [proto.width, proto.height] = [100, 100];
  proto
    .position.set(getRandomInt(0, window.innerWidth),
                  getRandomInt(0, window.innerHeight - board_height - 
                               proto.height));
  // Define a hitArea matching the chicken's shape
  proto.hitArea = new PIXI.Circle(50, 50, 25);
  // define event handlers
  proto.interactive = true;
  proto.pointerdown = function(e) {  // this refers to the actual instance
    const local = this.toLocal(e.data.global);
    if (this.hitArea.contains(local.x, local.y)) {
      this.health -= 5;
      if (this.health <= 0) {
        STORE.SCORE += this.__proto__.health;  // reference to global variable
        board.__proto__.children[0].text =     // reference to global variable
          `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
        this.renderable = this.visible = this.interactive = this.loop = false;
        this.dead = true;
        this.parent.removeChild(this);  // unstaging
        // this.destroy() does not stop animation, because
        // console.log(this.hasOwnProperty('destroy')); -> false
        // but
        // console.log('destroy' in this) -> true
        // means
        // the chicken instance does not have an own destroy method 
        // but its prototype does -> let's call it!
        this.__proto__.destroy();  // clean up destroy it
      }
    }
  };
  // animation logic
  proto.onFrameChange = function(index) {  // index of current frame in array
    //console.log('change');
    this.x = this.x + proto.direction;  // this refers to the prototype
    if (this.x < (0 - 2 * this.width) || 
        this.x > (window.innerWidth + 2 * this.width)) {
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      base.stage  // reference to global variable ... unstaging
        .removeChild(...base.stage.children.filter(c => c.__proto__.dead));
      this.destroy();  // clean up destroy it after unstaging
    }
  };
  proto.animationSpeed = .04;
  proto.play();
  // factor
  return Object.create(proto);
};
*/

/*
// Bullet factory
const Bullet = (x, y) => {
  // Returns a new bullet.
  //const texture = PIXI.Texture.fromImage('./img/bullet.svg');
  const texture = new PIXI.Graphics()
    .beginFill(0x000000)
    .drawCircle(0, 0, window.innerWidth / 2)  // 3rd param radius
    .endFill()
    .generateCanvasTexture(1);  // param scale factor
  const proto = new PIXI.Sprite.from(texture);
  // mark as bullet
  proto.bullet = true;
  // set its transform origin or anchor
  proto.anchor.set(.5);
  // initial scale
  proto.scale.set(.05);  // 5 percent
  // position proto
  proto
    .position.set(x, y);
  // make it interactive/clickable
  proto.interactive = true;
  proto.pointerdown = function(e) {  // this refers to the actual instance
    // let the bullet disappear ... clean up
    window.clearInterval(window.BULLET_INT);
    this.renderable = this.visible = this.interactive = this.loop = false;
    this.parent.removeChild(this);  // unstage
    this.__proto__.destroy();  // clean up destroy bullet instance
  };
  // bullet flies - scale it up for about 1.5s before it hits u and vanishes!
  proto.fly = function() {  // this refers to the prototype
    // increase bullet size in interval
    window.BULLET_INT = window.setInterval(() => {
      this.setTransform(this.x, this.y, this.scale.x + .05, this.scale.y + .05);
    }, 50);
    // kill interval thenwards
    window.setTimeout(() => {  // touching globals from within this scope
      // make sure bullet still exists, then check its center is within view
      if (base.stage.children.filter(c => c.__proto__.bullet).length > 0 &&
         inRange(this.x, 0, window.innerWidth)) {
        STORE.HEALTH -= 10;
        board.__proto__.children[0].text =
          `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
      }
      // clean up
      window.clearInterval(window.BULLET_INT);
      // disabling updateTransform() and unstaging
      this.renderable = this.visible = this.interactive = false;
      base.stage  // reference to global variable ... unstaging ...
        .removeChild(...base.stage.children.filter(c => c.__proto__.bullet));
      this.destroy();  // clean up destroy bullet instance
    }, 1000);
  };
  // let it fly once it is initialized
  proto.fly();
  // factor
  return Object.create(proto);
};
*/

/*
// bullet interval integers stack
window.BULLET_INT = [];
*/

/*****************************************************************************/

/*
// Bullet constructor
function Bullet(x, y) {
  // instance's own (mostly data) properties
  // define all OWN properties of new PIXI.Sprite(...) directly on Bullet instance
  Object.defineProperties(this,
                          Object.getOwnPropertyDescriptors(new PIXI.Sprite(Bullet.texture)));
  //
  // deleting 'pointerdown' instance property so that its lookup is
  // delegated to its prototype
  //
  delete this.pointerdown;
  // set its transform origin or anchor
  this.anchor.set(.5);
  // initial scale
  this.scale.set(.05);  // 5 percent
  // position
  this.position.set(x, y);
  // let it fly when it is initialized
  this.fly();
}

// Bullet static class properties
Bullet.texture = new PIXI.Graphics()
  .beginFill(0x000000)
  .drawCircle(0, 0, window.innerWidth / 2)  // 3rd param radius
  .endFill()
  .generateCanvasTexture(1);

// Bullet prototype data properties
// set the constructors prototype object
Bullet.prototype = new PIXI.Sprite(Bullet.texture);
// explicitely reset Bullet.prototype.constructor to Bullet
Bullet.prototype.constructor = Bullet;
// mark as bullet
Bullet.prototype.bullet = true;

// Bullet prototype methods
// bullet flies - scale it up for about 1.5s before it hits u and vanishes!
Bullet.prototype.fly = function() {
  // increase bullet size in interval
//window.BULLET_INT = window.setInterval(() => {
//  this.setTransform(this.x, this.y, this.scale.x + .05, this.scale.y + .05);
//}, 50);
  window.BULLET_INT.push(window.setInterval(() => {
    this.setTransform(this.x, this.y, this.scale.x + .05, this.scale.y + .05);
  }, 50));
  // kill interval thenwards
  window.setTimeout(() => {  // touching globals from within this scope
    // make sure bullet still staged, then check its center is within view
    if (this.parent &&
       inRange(this.x, 0, window.innerWidth)) {
      STORE.HEALTH -= 10;
      board.children[0].text =
        `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
    }
    // clean up
    window.clearInterval(window.BULLET_INT[0]);  // clear 1st/oldest entry
    window.BULLET_INT.shift();  // silently remove 1st/oldest entry
    // disabling updateTransform() and unstaging
    this.renderable = this.visible = this.interactive = false;
    this.parent.removeChild(this);
    this.destroy();  // clean up destroy bullet instance
  }, 1000);
};

// make it interactive/clickable
Bullet.prototype.interactive = true;
Bullet.prototype.pointerdown = function(e) {  // this refers to the actual instance
  // let the bullet disappear ... clean up
  window.clearInterval(window.BULLET_INT);
  this.renderable = this.visible = this.interactive = this.loop = false;
  this.parent.removeChild(this);  // unstage
  this.destroy();  // clean up destroy bullet instance
};
*/

/*
// GoonChicken factory
const GoonChicken = (board_height=BOARD_HEIGHT) => {
  // Returns a new instance of a GoonChicken shooting at you.
  const proto = new PIXI.extras.AnimatedSprite.fromImages(['./img/one.png', './img/two.png']);
   // brandmark as chicken
  proto.chicken = true;
  // grant life
  proto.dead = false;
  // assign health according to type
  proto.health = 115;
  // shot interval
  proto.shotinterval = 0;
  // size
  [proto.width, proto.height] = [100, 100];
  // set anchor/pivot cause bullet starts at goon chicken's coordinates
  //proto.anchor.set(.5);  // once anchor is set clickhandler does not work !!!
  proto.pivot.set(proto.width / 2, proto.height / 2);
  // position proto
  proto
    .position.set(getRandomInt(0, window.innerWidth),
                  getRandomInt(window.innerHeight * .7, window.innerHeight - 
                               board_height - 1.5 * proto.height));
  // Define a hitArea matching the chicken's shape
  proto.hitArea = new PIXI.Circle(50, 50, 25);
  // define event handlers
  proto.interactive = true;
  proto.pointerdown = function(e) {  // this refers to the actual instance
    const local = this.toLocal(e.data.global);
    if (this.hitArea.contains(local.x, local.y)) {
      this.health -= 5;
      if (this.health <= 0) {
        STORE.SCORE += this.__proto__.health;  // reference to global variable
        board.__proto__.children[0].text =     // reference to global variable
          `Score: ${STORE.SCORE} Health: ${STORE.HEALTH}`;
        this.renderable = this.visible = this.interactive = this.loop = false;
        this.dead = true;
        // this.destroy() does not stop animation
        this.parent.removeChild(this);  // unstaging
        this.__proto__.destroy();  // clean up destroy it
      }
    }
  };
  // animation logic
  proto.onFrameChange = function(index) {  // index of current frame in array
    //console.log('changegoon');
    proto.shotinterval++;
    if (this.shotinterval % 20 === 0) {
      base.stage.addChildAt(Bullet(this.x, this.y),
                            // insert bullet after goon but before board 
                            base.stage.children.length - 1);
    }
    if (this.x < (0 - 2 * this.width) ||  // this refers to the prototype
        this.x > (window.innerWidth + 2 * this.width)) {
      this.renderable = this.visible = this.interactive = this.loop = false;
      this.dead = true;
      base.stage  // reference to global variable
        .removeChild(...base.stage.children.filter(c => c.__proto__.dead));
      this.destroy();  // clean up destroy it after unstaging
    }
  };
  proto.animationSpeed = .04;
  proto.play();
  // factor
  return Object.create(proto);
};
*/

/*
// displaying a sprite - the easy way -
const goon = PIXI.Sprite.fromImage('./img/trash/goon.png');
// positioning a sprite
goon.position.set(app.renderer.width / 2, app.renderer.height / 2);
// changing a sprite's size
//[goon.width, goon.height] = [300, 300];
// changing a sprite's size proportionally
goon.scale.set(2, 2);
// set a sprite's anchor point
goon.anchor.set(.5, .5);
// rotating a sprite
goon.rotation += .5;
// loading images from a texture atlas
PIXI.loader.add('./img/chickenchop.json').load(setup);
// stage a sprite
APP.stage.addChild(goon);
// toggling a sprite's visibility
//sprite.visible = false;
// changing a sprite's texture
//sprite.texture = PIXI.Sprite.fromImage('...');
// adding a text input
const inputField = new PixiTextInput('', {});  // same style options as PIXI.Text
APP.stage.addChild(inputField);
// Listening for animate update
APP.ticker.add(function(delta) {
  // delta is 1 if running at 100% performance
  // creates frame-independent transformation
  goon.rotation += 0.1 * delta;
});
*/