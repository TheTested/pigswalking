
var image = new Image;
image.src = "https://uploads-ssl.webflow.com/5ea2c6f295e67d090a35c87f/5ebb9b5db2b44c5b95a32f87_pig.png";
var feed = new Image;
feed.src = "https://uploads-ssl.webflow.com/5ea2c6f295e67d090a35c87f/5ea2d08d0047df0ec71b771c_feed.png";
var click = new Image;
click.src = "https://uploads-ssl.webflow.com/5ea2c6f295e67d090a35c87f/5ebb9b09fe19316975045ff7_click2feed.png";
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.style.position = "absolute";
canvas.style.top = "0px";
canvas.style.left = "0px";
var followMouse = true;
document.body.appendChild(canvas);
var clicked = false;
var resting = false;
var clickedPos = new Victor(0, 0);
var text = true;
var w, h;
var mouse = new Victor(0, 0);
function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  if (textX > w || textY > h) {
    newClickPosition()
  }
  
}
resize();
var textX = 0
var textY = 0
newClickPosition()
window.addEventListener("resize", resize);
function rand(min, max) { return Math.random() * (max ? (max - min) : min) + (max ? min : 0) }
function DO(count, callback) { while (count--) { callback(count) } }
const sprites = [];
DO(8, () => {
  sprites.push({
    position: new Victor(rand(w), rand(h)),
    xPosition: new Victor(0, 0), // actual position of sprite
    velocity: new Victor(rand(-2, 2), rand(-2, 2)),
    acceleration: new Victor(rand(-0.5, 0.5), rand(-0.5, 0.5)),
    scale: rand(0.1, 0.3),
    dr: 0,
    r: 0,
    move: true,
    steer: 0,
  });
});

function drawImage(image, spr) {
  ctx.setTransform(spr.scale, 0, 0, spr.scale, spr.xPosition.x, spr.xPosition.y); // sets scales and origin
  ctx.rotate(spr.r);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
}



function update() {
  var ihM, iwM;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (text) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.drawImage(click, textX, textY);
  }
  if (image.complete) {
    var iw = image.width;
    var ih = image.height;
    var i = 0

    if (clicked) {
      ctx.setTransform(0.5, 0, 0, 0.5, clickedPos.x, clickedPos.y);
      ctx.drawImage(feed, -feed.width / 2, -feed.height / 2);
      for (var i = 0; i < sprites.length; i++) {
        var spr = sprites[i];
        var desired = clickedPos.clone().subtract(spr.xPosition);
        if (clickedPos.clone().subtract(spr.xPosition).length() > 100) {
          
          // Set the length of the vector to 6.
          if (!desired.isZero()) {
            desired.normalize().multiplyScalar(6);
          }
          sep = separation2(spr);
        
            
            
            spr.acceleration.add(limitForce3(sep))
          // Get the force needed to get from the current velocity
          // to the desired one
          var steeringForce = steer(spr.velocity, desired);

          // Limit it to our boid's max acceleration
          // (smaller values make for wider turns)
          spr.acceleration = spr.acceleration.add(limitForce(steeringForce))
          ;
          spr.acceleration = limitForce3(spr.acceleration)
          spr.move = true;
        } else {
          spr.velocity = spr.velocity.add(limitForce3(steer(spr.velocity, desired)))
          spr.move = false;
          followMouse = false;
        }

        if (spr.move) {
          spr.velocity.add(spr.acceleration)
          spr.position.add(spr.velocity)
        } else {
          spr.velocity = new Victor(spr.velocity.x+rand(-0.05,0.05), spr.velocity.y+rand(-0.05,0.05))
        }
        spr.r = spr.velocity.horizontalAngle() + Math.PI / 2;
        iwM = iw * spr.scale * 2 + w;
        ihM = ih * spr.scale * 2 + h;
        spr.xPosition = new Victor(((spr.position.x % iwM) + iwM) % iwM - iw * spr.scale, ((spr.position.y % ihM) + ihM) % ihM - ih * spr.scale)
        drawImage(image, spr);
      }
    } else {
      for (var i = 0; i < sprites.length; i++) {
        var spr = sprites[i];
        if (mouse.clone().subtract(spr.xPosition).length() < 100 && followMouse) {
          var desired = mouse.clone().subtract(spr.xPosition);
          if (!desired.isZero()) {
            desired.normalize().multiplyScalar(6);
          }
          var steeringForce = steer(spr.velocity, desired);
          spr.acceleration = limitForce2(steeringForce);
          spr.velocity.add(spr.acceleration)
        } else {
          sep = separation(spr);
          if (sep.length() > 0) {
            limitForce2(sep);
            spr.acceleration.add(sep)
            limitForce(spr.acceleration);
            spr.velocity.add(spr.acceleration)
          spr.position = spr.position.clone().add(spr.velocity)
          spr.acceleration.zero()
          } else {
            spr.acceleration = spr.acceleration.clone().add(new Victor(rand(-0.05, 0.05), rand(-0.05, 0.05)))
            spr.velocity.add(spr.acceleration)
          spr.position = spr.position.clone().add(spr.velocity)
          }
          if (spr.velocity.length() > 2 || spr.velocity.length() < -2) {
            spr.velocity.normalize()
          }
          if (spr.acceleration.length() > 0.5 || spr.acceleration.length() < -0.5) {
            spr.acceleration.normalize()
          }
        }
        spr.r = spr.velocity.horizontalAngle() + Math.PI / 2;
        iwM = iw * spr.scale * 2 + w;
        ihM = ih * spr.scale * 2 + h;
        spr.xPosition = new Victor(((spr.position.x % iwM) + iwM) % iwM - iw * spr.scale, ((spr.position.y % ihM) + ihM) % ihM - ih * spr.scale)
        drawImage(image, spr);
      }
    }
  }
  if (sprites.every(function (x) { return x.move != true; }) && !resting) {
    resting = true
    setTimeout(function () {
      clicked = false
      resting = false
      clickedPos = new Victor(0, 0)
      for (var i = 0; i < sprites.length; i++) {
        var spr = sprites[i];
        spr.velocity.normalize().multiplyScalar(1.3)
        spr.move = true
        spr.dx = -2 * spr.dx
        spr.dy = - 2 * spr.dy
      }
      setTimeout(function () {
        text = true
        setTimeout(function () {
          followMouse = true;
        }, 3000);
        newClickPosition()
      }, 1000);
    }, 1000);
  }
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}
function getMousePosition(event) {
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  if (distance(x, y, textX + 50, textY) < 50) {
    clicked = true
    clickedPos = new Victor(x, y)
    text = false;
  }
}
document.addEventListener("mousedown", function (e) {
  if (text) {
    getMousePosition(e);
  }
});
document.addEventListener("mousemove", function (e) {
  mouse = new Victor(e.clientX, e.clientY)
});
function limitForce(vector) {
  var maxForce = 0.05;
  if (vector.length() > maxForce) {
    vector.normalize().multiplyScalar(maxForce);
  }
  return vector;
}
function limitForce2(vector) {
  var maxForce = 0.3;
  if (vector.length() > maxForce) {
    vector.normalize().multiplyScalar(maxForce);
  }
  return vector;
}
function limitForceVar(vector, force) {
  var maxForce = force;
  if (vector.length() > maxForce) {
    vector.normalize().multiplyScalar(maxForce);
  }
  return vector;
}
function limitForce3(vector) {
  var maxForce = 0.3;
  if (vector.length() > maxForce) {
    vector.normalize().multiplyScalar(maxForce);
  }
  return vector;
}
function separation(spr) {
  // Choose a distance at which boids start avoiding each other
var desiredSeparation = 120 / 2;

var desired = new Victor(0, 0);


// For every flockmate, check if it's too close
for (var i = 0; i < sprites.length; i++) {
  var other = sprites[i];
  
  var dist = spr.xPosition.distance(other.xPosition);
  
  
  
  if (dist < desiredSeparation && dist > 0) {
    // Calculate vector pointing away from the flockmate, weighted by distance
    
      var diff = spr.xPosition.clone().subtract(other.xPosition).normalize().divideScalar(Math.pow(dist,1/2));
    desired.add(diff);
    
    
    
  }
 
  
}
 var dist = spr.xPosition.distance(new Victor(textX, textY));
  if (dist < 120 && dist > 0) {
      var diff = spr.xPosition.clone().subtract(new Victor(textX, textY)).normalize().divideScalar(Math.pow(dist,1/2));
    desired.add(diff);
  }

// If the boid had flockmates to separate from
if (desired.length() > 0) {
  // We set the average vector to the length of our desired speed
  desired.normalize().multiplyScalar(6);

  // We then calculate the steering force needed to get to that desired velocity
  return steer(spr.velocity, desired)
}

return desired
}
function separation2(spr) {
var desiredSeparation = 100 / 2;
var desired = new Victor(0, 0);
for (var i = 0; i < sprites.length; i++) {
  var other = sprites[i];
  var dist = spr.xPosition.distance(other.xPosition);
  if (dist < desiredSeparation && dist > 0) {
      var diff = spr.xPosition.clone().subtract(other.xPosition).normalize().divideScalar(Math.pow(dist,1/2));
    desired.add(diff);
  } 
}
if (desired.length() > 0) {
  desired.normalize().multiplyScalar(6);
  return steer(spr.velocity, desired)
}
return desired
}
function steer(current, desired) {
  return desired.subtract(current);
}

function newClickPosition() {
  nextX=rand(250, w-120)
  nextY=rand(40, h-40)
  var el = document.getElementById("textmain");
  var rect = el.getBoundingClientRect();
  if (distance(nextX, nextY, textX, textY) < 450) {
    newClickPosition()
  } else if ((nextY>rect.top && nextY<rect.bottom) || (nextX>rect.left && nextX<rect.right)) {
    newClickPosition()
  } else {
    textX = nextX
    textY = nextY
  }
  
}
